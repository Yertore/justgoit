package http

import (
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	handlers "justgoit-backend/internal/http/handlers"

	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func SetupRouter(qh *handlers.QuestionHandler) *gin.Engine {
	r := gin.Default()

	// --- CORS ---
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5174"}, // адрес фронтенда
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	v1 := r.Group("/api/v1")
	//TODO:
	//qh.RegisterRoutes(v1)
	{
		v1.POST("/questions", qh.Create)
		v1.GET("/questions/:id", qh.GetByID)
		v1.GET("/questions", qh.List)
	}

	return r
}
