package models

import "time"

type URL struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Code      string    `json:"code" gorm:"uniqueIndex;not null"`
	LongURL   string    `json:"long_url" gorm:"not null;index"`
	Clicks    int       `json:"clicks" gorm:"default:0"`
	CreatedAt time.Time `json:"created_at"`
}
