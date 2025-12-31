package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"justgoit-backend/internal/domain"
	"justgoit-backend/internal/http/dto/request"
	"justgoit-backend/internal/http/dto/response"
	"justgoit-backend/internal/service"
)

type QuestionHandler struct {
	service *service.QuestionService
}

func NewQuestionHandler(s *service.QuestionService) *QuestionHandler {
	return &QuestionHandler{service: s}
}

//TODO:
// RegisterRoutes регистрирует маршруты версии v1
/**func (h *QuestionHandler) RegisterRoutes(rg *gin.RouterGroup) {
	questions := rg.Group("/questions")
	{
		questions.POST("", h.Create)
		questions.GET("/:id", h.GetByID)
		questions.GET("", h.List)
	}
}*/

// Create godoc
// @Summary      Create question
// @Tags         questions
// @Accept       json
// @Produce      json
// @Param        question body request.CreateQuestionRequest true "Create question"
// @Success      201 {object} response.QuestionResponse
// @Failure      400 {object} map[string]string
// @Failure      500 {object} map[string]string
// @Router       /questions [post]
func (h *QuestionHandler) Create(c *gin.Context) {
	var req request.CreateQuestionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	q := domain.Question{
		Title:      req.Title,
		Answer:     req.Answer,
		Level:      req.Level,
		Category:   req.Category,
		Popularity: req.Popularity,
	}

	if err := h.service.Create(c.Request.Context(), &q); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	resp := response.NewQuestionResponse(&q)
	c.JSON(http.StatusCreated, resp)
}

// GetByID godoc
// @Summary      Get question by id
// @Tags         questions
// @Produce      json
// @Param        id path int true "Question ID"
// @Success      200 {object} response.QuestionResponse
// @Failure      400 {object} map[string]string
// @Failure      404 {object} map[string]string
// @Router       /questions/{id} [get]
func (h *QuestionHandler) GetByID(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	q, err := h.service.GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}

	resp := response.NewQuestionResponse(q)
	c.JSON(http.StatusOK, resp)
}

// List godoc
// @Summary      Get all questions
// @Description  Returns list of questions ordered by popularity
// @Tags         questions
// @Produce      json
// @Success      200 {array} response.QuestionResponse
// @Failure      500 {object} map[string]string
// @Router       /questions [get]
func (h *QuestionHandler) List(c *gin.Context) {
	// Параметры запроса
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	level := c.Query("level")
	category := c.Query("category")
	// По умолчанию сортировка по id (DESC) — новые записи первыми
	sortBy := c.DefaultQuery("sort", "id")
	order := c.DefaultQuery("order", "desc")

	offset := (page - 1) * limit

	questions, total, err := h.service.List(c.Request.Context(), offset, limit, level, category, sortBy, order)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"questions":  questions,
		"total":      total,
		"page":       page,
		"limit":      limit,
		"totalPages": (total + limit - 1) / limit,
	})
}

// Update godoc
// @Summary      Update question
// @Tags         questions
// @Accept       json
// @Produce      json
// @Param        id path int true "Question ID"
// @Param        question body request.UpdateQuestionRequest true "Update question"
// @Success      200 {object} response.QuestionResponse
// @Failure      400 {object} map[string]string
// @Failure      404 {object} map[string]string
// @Failure      500 {object} map[string]string
// @Router       /questions/{id} [put]
// Update godoc
// ...
func (h *QuestionHandler) Update(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var req request.UpdateQuestionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	q := domain.Question{
		ID:         id,
		Title:      req.Title,
		Answer:     req.Answer,
		Level:      req.Level,
		Category:   req.Category,
		Popularity: req.Popularity,
	}

	updated, err := h.service.Update(c.Request.Context(), &q)
	if err != nil {
		if err == domain.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	resp := response.NewQuestionResponse(updated)
	c.JSON(http.StatusOK, resp)
}
