package prescription

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/kyash99252/Medical-Portal/internal/middleware"
)

// Handler holds dependencies for the prescription handlers
type Handler struct {
	service Service
}

// NewHandler creates a new prescription handler
func NewHandler(s Service) *Handler {
	return &Handler{service: s}
}

// CreatePrescription godoc
// @Summary      Create a prescription (Doctor only)
// @Description  Creates a new prescription for a patient. The doctor's ID is automatically taken from the JWT token.
// @Tags         Prescriptions
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id   path      int  true  "Patient ID"
// @Param        prescription body CreateRequest true "Prescription details"
// @Success      201 {object} Prescription
// @Failure      400 {object} gin.H "Bad request due to invalid patient ID or request body"
// @Failure      403 {object} gin.H "Forbidden if user is not a doctor or token is invalid"
// @Failure      500 {object} gin.H "Internal server error"
// @Router       /patients/{id}/prescriptions [post]
func (h *Handler) CreatePrescription(c *gin.Context) {
	patientID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid patient ID format"})
		return
	}

	doctorIDVal, exists := c.Get(middleware.ContextKeyUserID)
	if !exists {
		c.JSON(http.StatusForbidden, gin.H{"error": "User ID not found in token"})
		return
	}

	doctorID, ok := doctorIDVal.(int)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User ID in context is not of expected type"})
		return
	}

	var req CreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	prescription, err := h.service.CreatePrescription(c.Request.Context(), patientID, doctorID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create prescription: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, prescription)
}

// GetPatientPrescriptions godoc
// @Summary      List prescriptions for a patient
// @Description  Retrieves a list of all prescriptions for a specific patient.
// @Tags         Prescriptions
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id   path      int  true  "Patient ID"
// @Success      200  {array}   Prescription
// @Failure      400  {object}  gin.H "Invalid patient ID"
// @Failure      500  {object}  gin.H "Internal server error"
// @Router       /patients/{id}/prescriptions [get]
func (h *Handler) GetPatientPrescriptions(c *gin.Context) {
	patientID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid patient ID format"})
		return
	}

	prescriptions, err := h.service.GetPrescriptionsForPatient(c.Request.Context(), patientID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve prescriptions: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, prescriptions)
}