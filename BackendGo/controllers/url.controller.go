package controllers

import (
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	neturl "net/url"
	"url_shortner_backend_go/models"

	gonanoid "github.com/matoous/go-nanoid/v2"
	"gorm.io/gorm"
)

type URLController struct {
	DB *gorm.DB
}

const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

func generateCode(n int) (string, error) {
	code, err := gonanoid.Generate(alphabet, n)
	if err != nil {
		slog.Error("Failed to generate the short code")
		return "", err
	}

	return code, nil

}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

// POST /shorten  {"url": "https://example.com/long/path"}
func (c *URLController) CreateShortUrl(w http.ResponseWriter, r *http.Request) {

	var in struct {
		URL string `json:"url"`
	}

	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON"})
		return
	}

	u, err := neturl.ParseRequestURI(in.URL)
	if err != nil || (u.Scheme != "http" && u.Scheme != "https") || (u.Host == "") {
		slog.Error("url must start with http:// or https://")
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "url must start with http:// or https://"})
		return
	}

	code, err := generateCode(6)
	if err != nil {
		slog.Error("Error while creating short code")
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "something went wrong"})
		return
	}

	var record models.URL
	result := c.DB.Where(models.URL{LongURL: in.URL}).Attrs(models.URL{Code: code}).FirstOrCreate(&record)
	if result.Error != nil {
		slog.Error("create url", "err", result.Error)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "could not save url"})
		return
	}

	status := http.StatusOK // already existed
	if result.RowsAffected == 1 {
		status = http.StatusCreated // newly created
	}

	scheme := "http"
	if r.TLS != nil || r.Header.Get("X-Forwarded-Proto") == "https" {
		scheme = "https"
	}
	baseURL := scheme + "://" + r.Host

	writeJSON(w, status, map[string]string{
		"code":      record.Code,
		"short_url": fmt.Sprintf("%s/%s", baseURL, record.Code),
		"long_url":  record.LongURL,
	})
}

func (c *URLController) Redirect(w http.ResponseWriter, r *http.Request) {
	code := r.PathValue("code")

	var record models.URL
	err := c.DB.Where("code = ?", code).First(&record).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		http.NotFound(w, r)
		return
	}
	if err != nil {
		slog.Error("find url", "code", code, "err", err)
		http.Error(w, "something went wrong", http.StatusInternalServerError)
		return
	}

	// Count the click
	var res = c.DB.Model(&record).UpdateColumn("clicks", gorm.Expr("clicks + 1"))
	if res.Error != nil {
		slog.Error("count click", "code", code, "err", res.Error)
	}

	http.Redirect(w, r, record.LongURL, http.StatusFound)
}
