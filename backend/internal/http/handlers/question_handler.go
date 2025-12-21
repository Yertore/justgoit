package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"justgoit-backend/internal/domain"
	"justgoit-backend/internal/service"
)

type QuestionHandler struct {
	service *service.QuestionService
}

func NewQuestionHandler(s *service.QuestionService) *QuestionHandler {
	return &QuestionHandler{service: s}
}

// Create godoc
// @Summary      Create question
// @Tags         questions
// @Accept       json
// @Produce      json
// @Param        question body domain.Question true "Question payload"
// @Success      201 {object} domain.Question
// @Failure      400 {object} map[string]string
// @Router       /questions [post]
func (h *QuestionHandler) Create(c *gin.Context) {
	var q domain.Question
	if err := c.ShouldBindJSON(&q); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.Create(c.Request.Context(), &q); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, q)
}

// GetByID godoc
// @Summary      Get question by id
// @Tags         questions
// @Produce      json
// @Param        id path int true "Question ID"
// @Success      200 {object} domain.Question
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

	c.JSON(http.StatusOK, q)
}

// List godoc
// @Summary      Get all questions
// @Description  Returns list of questions ordered by popularity
// @Tags         questions
// @Produce      json
// @Success      200 {array} domain.Question
// @Failure      500 {object} map[string]string
// @Router       /questions [get]
func (h *QuestionHandler) List(c *gin.Context) {
	res, err := h.service.List(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, res)
}
