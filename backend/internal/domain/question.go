package domain

import "time"

type Question struct {
	ID         int64
	Title      string
	Answer     string
	Level      string
	Category   string
	Popularity int
	CreatedAt  time.Time
}
