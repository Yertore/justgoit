# justgoit
Команды Docker:
docker compose down -v 
docker compose up -d --build

Docker problems
docker-compose down -v --remove-orphans
docker system prune -af
docker-compose up --build

Открой в браузере:
SPA: http://localhost/
Swagger: http://localhost/api/v1/swagger/index.html
API: http://localhost/api/v1/questions


  Clean Architecture
  Hexagonal / Ports & Adapters
  DDD-lite (Domain Driven Design)

GitHub(push) ->  GitHub Actions (CI) -> Docker image -> VPS -> Docker container -> Domain + HTTPS

Swagger:
go get github.com/swaggo/gin-swagger
go get github.com/swaggo/files
go get github.com/swaggo/swag@latest
go mod tidy
swag --version

cd backend
swag init -g cmd/api/main.go
или (наш кейс!!!)
swag init \
  -g cmd/api/main.go \
  --parseDependency \
  --parseInternal
---------------------------------------

Domain — это мозг.
DTO — это рот и уши.

POST /questions          ❌ плохо
POST /api/v1/questions   ✅ правильно

Versioning решает:
- не ломать клиентов
- безопасно развивать API
- поддерживать старые версии

DTO + Versioning = стабильный API

Схема слоёв
       ┌───────────────┐
       │   Client      │
       │ (Postman /    │
       │  Frontend)    │
       └──────┬────────┘
              │ HTTP JSON
              ▼
       ┌───────────────┐
       │  DTO Layer    │
       │ request /     │
       │ response      │
       └──────┬────────┘
              │ Конвертация
              ▼
       ┌───────────────┐
       │   Handler     │
       │  (HTTP Layer) │
       │ RegisterRoutes│
       └──────┬────────┘
              │ Передаёт domain
              ▼
       ┌───────────────┐
       │   Service     │
       │ Business Logic│
       └──────┬────────┘
              │ Использует
              ▼
       ┌───────────────┐
       │ Repository    │
       │ (Postgres /   │
       │  DB)          │
       └──────┬────────┘
              │ SQL / DB Access
              ▼
       ┌───────────────┐
       │  Database     │
       │  PostgreSQL   │
       └───────────────┘

Пояснения:

1. Client
Отправляет JSON на API
Например, Postman, Swagger или React/Vue frontend

2. DTO (Data Transfer Object)
Определяет формат данных, которые приходят и уходят через API
Пример: CreateQuestionRequest и QuestionResponse
Не содержит бизнес-логики

3. Handler
Получает DTO, проверяет данные
Преобразует DTO → domain
Передаёт в Service
На выходе domain → DTO → JSON клиенту

4. Service
Содержит бизнес-логику
Решает задачи вроде "сохрани вопрос", "отсортируй по популярности"
Не знает про HTTP или JSON

5. Repository
Отвечает за доступ к базе данных
CRUD операции, SQL-запросы
Service не занимается SQL напрямую

6. Database
Фактическое хранилище данных (PostgreSQL)


Пример потока Create Question

1) Клиент POST /api/v1/questions с JSON:
{
  "title": "Что такое goroutine?",
  "answer": "Легкий поток выполнения в Go.",
  "level": "junior",
  "category": "concurrency",
  "popularity": 95
}

2) Handler: CreateQuestionRequest → domain.Question
3) Service: бизнес-логика → проверка, заполнение дополнительных полей
4) Repository: INSERT в таблицу questions
5) Handler: domain.Question → QuestionResponse
6) Клиент получает JSON с ID и CreatedAt

💡 Ключевые моменты:
DTO отделяет внешний контракт от внутренней модели
domain — чистая бизнес-сущность
Service и Repository строят архитектуру по принципу «high-level не зависит от low-level»
Handler — граница между HTTP и бизнес-логикой

6️⃣ Как будет выглядеть момент истины (позже)
VPS
 ├── Nginx
 │    ├── / → frontend/dist
 │    └── /api → backend
 └── Docker / Go binary