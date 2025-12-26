package config

import (
	"fmt"
	"os"
)

/*
Правильная логика (чистая архитектура)
config/

	└─ db.go        ← как подключиться

repository/

	└─ postgres/
	    └─ question_repository.go ← SQL

domain/

	└─ question.go

База данных — это кафе ☕
-config/db.go → провести электричество и воду
-repository/postgres → готовить блюда
-service → решать, что готовить
-handler → принимать заказы
Ты же не хранишь проводку на кухне

если настраивает → config
если работает с данными → repository
если принимает решения → service
*/
type DBConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	Name     string
}

func LoadDBConfig() DBConfig {
	return DBConfig{
		Host:     getEnv("DB_HOST", "localhost"),
		Port:     getEnv("DB_PORT", "5432"),
		User:     getEnv("DB_USER", "justgoit"),
		Password: getEnv("DB_PASSWORD", "justgoit"),
		Name:     getEnv("DB_NAME", "justgoit"),
	}
}

// DSN = Data Source Name: строка подключения к базе данных
func (c DBConfig) DSN() string {
	return fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=disable",
		c.User, c.Password, c.Host, c.Port, c.Name,
	)
}

func getEnv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}
