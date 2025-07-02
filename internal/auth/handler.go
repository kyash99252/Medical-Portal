package auth

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Handler holds the dependencies for the auth handler
type Handler struct {
	service Service
}

// NewHandler creates a new auth handler
func NewHandler(s Service) *Handler {
	return &Handler{service: s}
}

// LoginRequest represents the JSON body for the login request
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// LoginResponse represents the JSON body for a successful login
type LoginResponse struct {
	Token string `json:"token"`
}

// Login godoc
// @Summary      User Login
// @Description  Logs in a user and returns a JWT token.
// @Tags         Auth
// @Accept       json
// @Produce      json
// @Param        credentials body LoginRequest true "Login Credentials"
// @Success      200 {object} LoginResponse
// @Failure      400 {object} gin.H "Invalid request body"
// @Failure      401 {object} gin.H "Invalid credentials"
// @Failure      500 {object} gin.H "Internal server error"
// @Router       /login [post]
func (h *Handler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	token, err := h.service.Login(c.Request.Context(), req.Username, req.Password)
	if err != nil {
		if err == ErrInvalidCredentials {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to login: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, LoginResponse{Token: token})
}
