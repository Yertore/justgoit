package response

import (
	"justgoit-backend/internal/domain"
	"time"
)

type QuestionResponse struct {
	ID         int64     `json:"id"`
	Title      string    `json:"title"`
	Answer     string    `json:"answer"`
	Level      string    `json:"level"`
	Category   string    `json:"category"`
	Popularity int       `json:"popularity"`
	CreatedAt  time.Time `json:"createdAt"`
}

func NewQuestionResponse(q *domain.Question) QuestionResponse {
	return QuestionResponse{
		ID:         q.ID,
		Title:      q.Title,
		Answer:     q.Answer,
		Level:      q.Level,
		Category:   q.Category,
		Popularity: q.Popularity,
		CreatedAt:  q.CreatedAt,
	}
}
