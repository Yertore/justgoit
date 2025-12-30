package repository

import (
	"context"

	"justgoit-backend/internal/domain"
)

type QuestionRepository interface {
	Create(ctx context.Context, q *domain.Question) error
	GetByID(ctx context.Context, id int64) (*domain.Question, error)
	List(ctx context.Context, offset, limit int, level, category, sortBy, order string) ([]domain.Question, int, error)
}
