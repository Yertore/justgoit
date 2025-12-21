# justgoit
  Clean Architecture
  Hexagonal / Ports & Adapters
  DDD-lite (Domain Driven Design)

GitHub
  ↓ (push)
GitHub Actions (CI)
  ↓
Docker image
  ↓
VPS
  ↓
Docker container
  ↓
Domain + HTTPS

Coommands:
docker build -t justgoit-backend .
docker run -p 8089:8089 justgoit-backend

docker compose down -v 
docker compose up -d --build


go get github.com/swaggo/gin-swagger
go get github.com/swaggo/files
go get github.com/swaggo/swag@latest
go mod tidy
swag --version
swag init -g cmd/api/main.go
или
swag init \
  -g cmd/api/main.go \
  --parseDependency \
  --parseInternal