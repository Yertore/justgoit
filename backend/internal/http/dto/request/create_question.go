package request

type CreateQuestionRequest struct {
	Title      string `json:"title" binding:"required"`
	Answer     string `json:"answer" binding:"required"`
	Level      string `json:"level" binding:"required"`
	Category   string `json:"category" binding:"required"`
	Popularity int    `json:"popularity" binding:"gte=0,lte=100"`
}
