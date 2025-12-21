package postgres

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"

	"justgoit-backend/internal/domain"
)

type QuestionRepository struct {
	db *pgxpool.Pool
}

func NewQuestionRepository(db *pgxpool.Pool) *QuestionRepository {
	return &QuestionRepository{db: db}
}

func (r *QuestionRepository) Create(ctx context.Context, q *domain.Question) error {
	query := `
		INSERT INTO questions (title, answer, level, category, popularity)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at
	`
	return r.db.QueryRow(
		ctx,
		query,
		q.Title,
		q.Answer,
		q.Level,
		q.Category,
		q.Popularity,
	).Scan(&q.ID, &q.CreatedAt)
}

func (r *QuestionRepository) GetByID(ctx context.Context, id int64) (*domain.Question, error) {
	query := `
		SELECT id, title, answer, level, category, popularity, created_at
		FROM questions
		WHERE id = $1
	`

	var q domain.Question
	err := r.db.QueryRow(ctx, query, id).Scan(
		&q.ID,
		&q.Title,
		&q.Answer,
		&q.Level,
		&q.Category,
		&q.Popularity,
		&q.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &q, nil
}

func (r *QuestionRepository) List(ctx context.Context) ([]domain.Question, error) {
	query := `
		SELECT id, title, answer, level, category, popularity, created_at
		FROM questions
		ORDER BY popularity DESC
	`

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var res []domain.Question
	for rows.Next() {
		var q domain.Question
		if err := rows.Scan(
			&q.ID,
			&q.Title,
			&q.Answer,
			&q.Level,
			&q.Category,
			&q.Popularity,
			&q.CreatedAt,
		); err != nil {
			return nil, err
		}
		res = append(res, q)
	}

	return res, rows.Err()
}
