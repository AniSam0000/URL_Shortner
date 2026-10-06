package routes

import (
	"net/http"
	"url_shortner_backend_go/controllers"

	"gorm.io/gorm"
)

func New(db *gorm.DB) http.Handler {
	c := &controllers.URLController{DB: db}

	mux := http.NewServeMux()

	mux.HandleFunc("GET /{$}", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"message":"URL shortener is running"}`))
	})
	mux.HandleFunc("POST /url/shorten", c.CreateShortUrl)
	mux.HandleFunc("GET /{code}", c.Redirect)

	return mux

}
