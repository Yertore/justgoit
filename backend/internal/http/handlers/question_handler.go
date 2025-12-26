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
	questions, err := h.service.List(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	resp := make([]response.QuestionResponse, len(questions))
	for i, q := range questions {
		resp[i] = response.NewQuestionResponse(&q)
	}

	c.JSON(http.StatusOK, resp)
}
