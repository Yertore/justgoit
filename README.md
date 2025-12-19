# justgoit

GitHub
  ↓ (push)
GitHub Actions (CI)
  ↓
Docker image
  ↓
VPS (ps.kz)
  ↓
Docker container
  ↓
Domain + HTTPS

Coommands:
docker build -t justgoit-backend .
docker run -p 8089:8089 justgoit-backend

docker compose up -d --build