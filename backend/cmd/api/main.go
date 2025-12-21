// @title           JustGoIT API
// @version         1.0
// @description     API for Go interview preparation platform
// @host            localhost:8089
// @BasePath        /

package main

import (
	"context"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"

	"justgoit-backend/internal/config"
	"justgoit-backend/internal/db"
	httpapi "justgoit-backend/internal/http"
	"justgoit-backend/internal/http/handlers"
	"justgoit-backend/internal/repository/postgres"
	"justgoit-backend/internal/service"
)

func main() {
	// ---------- PORT ----------
	port := os.Getenv("PORT")
	if port == "" {
		port = "8089"
	}

	// ---------- DB ----------
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	dbCfg := config.LoadDBConfig()
	pool := db.NewPostgresPool(ctx, dbCfg.DSN())
	defer pool.Close()

	// ---------- DI ----------
	repo := postgres.NewQuestionRepository(pool)
	svc := service.NewQuestionService(repo)
	handler := handlers.NewQuestionHandler(svc)

	// ---------- ROUTER ----------
	r := httpapi.SetupRouter(handler)

	// health/db — здесь, потому что нужен доступ к pool
	r.GET("/health/db", func(c *gin.Context) {
		if err := pool.Ping(c.Request.Context()); err != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"db": "down"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"db": "ok"})
	})

	// ---------- RUN ----------
	if err := r.Run(":" + port); err != nil {
		panic(err)
	}
}
