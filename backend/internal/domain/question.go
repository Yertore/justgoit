package domain

import "time"

type Question struct {
	ID         int64     `json:"id"`
	Title      string    `json:"title"`
	Answer     string    `json:"answer"`
	Level      string    `json:"level"`
	Category   string    `json:"category"`
	Popularity int       `json:"popularity"` // %
	CreatedAt  time.Time `json:"createdAt"`
}
