package main

import (
	"context"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"

	"justgoit-backend/internal/config"
	"justgoit-backend/internal/db"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8089"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	dbCfg := config.LoadDBConfig()
	pool := db.NewPostgresPool(ctx, dbCfg.DSN())
	defer pool.Close()

	r := gin.Default()

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	r.GET("/health/db", func(c *gin.Context) {
		if err := pool.Ping(c.Request.Context()); err != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{
				"db": "down",
			})
			return
		}
		c.JSON(http.StatusOK, gin.H{"db": "ok"})
	})

	r.Run(":" + port)
}
