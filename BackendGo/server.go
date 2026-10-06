package main

import (
	"fmt"
	"log"
	"log/slog"
	"net/http"
	"os"
	"url_shortner_backend_go/db"
	"url_shortner_backend_go/routes"

	"github.com/joho/godotenv"
)

func setupLogger() *os.File {
	f, err := os.OpenFile("app.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		panic(err)
	}

	logger := slog.New(slog.NewTextHandler(f, &slog.HandlerOptions{
		Level: slog.LevelDebug, // hides Debug, shows Info and above
	}))
	slog.SetDefault(logger)

	return f
}

func main() {
	logFile := setupLogger()
	defer logFile.Close()

	fmt.Printf("Creating a backend for my url shortner\n")
	if err := godotenv.Load(); err != nil {
		slog.Error("No .env file was found")
	}

	database := db.ConnectDB()
	router := routes.New(database)

	slog.Info("Listening on port :5000")
	fmt.Println("listening on :5000")

	log.Fatal(http.ListenAndServe(":5000", router))

}
