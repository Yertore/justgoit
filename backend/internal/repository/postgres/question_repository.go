package postgres

import (
	"context"
	"fmt"
	"strconv"
	"strings"

	"github.com/jackc/pgx/v5"
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

	// --- Валидация сортировки (white-list) ---
	// Разрешённые поля сортировки (добавьте/уберите по необходимости)
	allowed := map[string]string{
		"id":         "id",
		"popularity": "popularity",
		"created_at": "created_at",
		"title":      "title",
		"level":      "level",
		"category":   "category",
	}

	// По умолчанию сортировать по id
	if sortBy == "" {
		sortBy = "id"
	}

	// Нормализуем и проверяем sortBy
	sortBy = strings.ToLower(sortBy)
	if col, ok := allowed[sortBy]; ok {
		sortBy = col
	} else {
		// Если неизвестный столбец — fallback на id
		sortBy = "id"
	}

	// Нормализуем порядок
	order = strings.ToUpper(order)
	if order != "ASC" && order != "DESC" {
		order = "DESC"
	}
	// -------------------------------------------------

	// Формируем запрос безопасно (имя столбца вставляем только после проверки)
	query := fmt.Sprintf(
		"SELECT id, title, answer, level, category, popularity, created_at FROM questions %s ORDER BY %s %s LIMIT $%d OFFSET $%d",
		where,
		sortBy,
		order,
		len(args)+1,
		len(args)+2,
	)
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

// Replace existing Update with this version that returns the updated Question
func (r *QuestionRepository) Update(ctx context.Context, q *domain.Question) (*domain.Question, error) {
	// UPDATE ... RETURNING all columns we need
	query := `
        UPDATE questions
        SET title = $1,
            answer = $2,
            level = $3,
            category = $4,
            popularity = $5
        WHERE id = $6
        RETURNING id, title, answer, level, category, popularity, created_at
    `

	var updated domain.Question
	err := r.db.QueryRow(
		ctx,
		query,
		q.Title,
		q.Answer,
		q.Level,
		q.Category,
		q.Popularity,
		q.ID,
	).Scan(
		&updated.ID,
		&updated.Title,
		&updated.Answer,
		&updated.Level,
		&updated.Category,
		&updated.Popularity,
		&updated.CreatedAt,
	)
	if err != nil {
		// if no rows returned, QueryRow().Scan returns pgx.ErrNoRows (or similar) — map it to domain.ErrNotFound
		if err == pgx.ErrNoRows {
			return nil, domain.ErrNotFound
		}
		return nil, err
	}

	return &updated, nil
}
