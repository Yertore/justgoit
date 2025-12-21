package service

import (
	"context"

	"justgoit-backend/internal/domain"
	"justgoit-backend/internal/repository"
)

type QuestionService struct {
	repo repository.QuestionRepository
}

func NewQuestionService(repo repository.QuestionRepository) *QuestionService {
	return &QuestionService{repo: repo}
}

func (s *QuestionService) Create(ctx context.Context, q *domain.Question) error {
	return s.repo.Create(ctx, q)
}

func (s *QuestionService) GetByID(ctx context.Context, id int64) (*domain.Question, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *QuestionService) List(ctx context.Context) ([]domain.Question, error) {
	return s.repo.List(ctx)
}
