package postgres

import (
	"context"
	"strconv"

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

func (r *QuestionRepository) List(ctx context.Context, offset, limit int, level, category, sortBy, order string) ([]domain.Question, int, error) {
	args := []interface{}{}
	where := "WHERE 1=1"

	if level != "" {
		args = append(args, level)
		where += " AND level = $" + strconv.Itoa(len(args))
	}
	if category != "" {
		args = append(args, category)
		where += " AND category = $" + strconv.Itoa(len(args))
	}

	// Получаем total
	var total int
	countQuery := "SELECT COUNT(*) FROM questions " + where
	if err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	// Сортировка
	if sortBy == "" {
		sortBy = "popularity"
	}
	if order == "" {
		order = "DESC"
	}

	query := "SELECT id, title, answer, level, category, popularity, created_at FROM questions " +
		where + " ORDER BY " + sortBy + " " + order +
		" LIMIT $" + strconv.Itoa(len(args)+1) + " OFFSET $" + strconv.Itoa(len(args)+2)
	args = append(args, limit, offset)

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var qs []domain.Question
	for rows.Next() {
		var q domain.Question
		if err := rows.Scan(&q.ID, &q.Title, &q.Answer, &q.Level, &q.Category, &q.Popularity, &q.CreatedAt); err != nil {
			return nil, 0, err
		}
		qs = append(qs, q)
	}

	return qs, total, rows.Err()
}
