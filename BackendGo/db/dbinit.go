package db

import (
	"fmt"
	"log/slog"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"url_shortner_backend_go/models"
)

func Connect(dsn string) (*gorm.DB, error) {
	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		return nil, err
	}

	if os.Getenv("MIGRATE") == "true" {
		if err := database.AutoMigrate(&models.URL{}); err != nil {
			return nil, err
		}
	}

	return database, nil
}

func ConnectDB() *gorm.DB {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "postgres://postgres:password@localhost:5432/testdb"
	}

	database, err := Connect(dsn)
	if err != nil {
		slog.Error("db connection failed:", "err", err)
		fmt.Fprintln(os.Stderr, "db connection failed:", err)
		os.Exit(1)
	}

	fmt.Println("Connected to PostgreSQL")
	return database
}
