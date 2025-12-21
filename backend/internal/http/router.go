package http

import (
	"github.com/gin-gonic/gin"

	"justgoit-backend/internal/http/handlers"

	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func SetupRouter(qh *handlers.QuestionHandler) *gin.Engine {
	r := gin.Default()

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	q := r.Group("/questions")
	{
		q.POST("", qh.Create)
		q.GET("", qh.List)
		q.GET("/:id", qh.GetByID)
	}

	return r
}
