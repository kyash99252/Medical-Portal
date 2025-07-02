package patient

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// Handler holds dependencies for patient handlers
type Handler struct {
	service Service
}

// NewHandler creates a new patient handler
func NewHandler(s Service) *Handler {
	return &Handler{service: s}
}

// CreatePatient godoc
// @Summary      Create a patient
// @Description  Adds a new patient to the system.
// @Tags         Patients
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        patient body CreatePatientRequest true "Patient data"
// @Success      201 {object} Patient
// @Failure      400 {object} gin.H "Invalid request body"
// @Failure      403 {object} gin.H "Forbidden"
// @Failure      500 {object} gin.H "Internal server error"
// @Router       /patients [post]
func (h *Handler) CreatePatient(c *gin.Context) {
	var req CreatePatientRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	patient, err := h.service.CreatePatient(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create patient: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, patient)
}

// GetPatient godoc
// @Summary      Get a patient by ID
// @Description  Retrieves a single patient's details.
// @Tags         Patients
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id   path      int  true  "Patient ID"
// @Success      200  {object}  Patient
// @Failure      400  {object}  gin.H "Invalid patient ID"
// @Failure      403  {object}  gin.H "Forbidden"
// @Failure      404  {object}  gin.H "Patient not found"
// @Router       /patients/{id} [get]
func (h *Handler) GetPatient(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid patient ID"})
		return
	}

	patient, err := h.service.GetPatient(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, ErrPatientNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, patient)
}

// ListPatients godoc
// @Summary      List all patients
// @Description  Retrieves a list of all patients in the system.
// @Tags         Patients
// @Produce      json
// @Security     ApiKeyAuth
// @Success      200  {array}   Patient
// @Failure      403  {object}  gin.H "Forbidden"
// @Failure      500  {object}  gin.H "Internal server error"
// @Router       /patients [get]
func (h *Handler) ListPatients(c *gin.Context) {
	patients, err := h.service.ListAllPatients(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, patients)
}

// UpdatePatient godoc
// @Summary      Update a patient
// @Description  Updates a patient's non-medical information.
// @Tags         Patients
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id      path      int                  true  "Patient ID"
// @Param        patient body      UpdatePatientRequest true  "Patient data"
// @Success      200     {object}  Patient
// @Failure      400     {object}  gin.H "Invalid request body or ID"
// @Failure      403     {object}  gin.H "Forbidden"
// @Failure      404     {object}  gin.H "Patient not found"
// @Router       /patients/{id} [put]
func (h *Handler) UpdatePatient(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid patient ID"})
		return
	}

	var req UpdatePatientRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	patient, err := h.service.UpdatePatient(c.Request.Context(), id, req)
	if err != nil {
		if errors.Is(err, ErrPatientNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update patient: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, patient)
}

// UpdatePatientMedical godoc
// @Summary      Update patient's medical info (Doctor only)
// @Description  Updates a patient's diagnosis and notes.
// @Tags         Patients
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id      path      int                  true  "Patient ID"
// @Param        patient body      UpdatePatientMedicalRequest true  "Patient medical data"
// @Success      200     {object}  Patient
// @Failure      400     {object}  gin.H "Invalid request body or ID"
// @Failure      403     {object}  gin.H "Forbidden"
// @Failure      404     {object}  gin.H "Patient not found"
// @Router       /patients/{id}/medical [patch]
func (h *Handler) UpdatePatientMedical(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid patient ID"})
		return
	}

	var req UpdatePatientMedicalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	patient, err := h.service.UpdatePatientMedical(c.Request.Context(), id, req)
	if err != nil {
		if errors.Is(err, ErrPatientNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update patient medical info: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, patient)
}

// DeletePatient godoc
// @Summary      Delete a patient
// @Description  Deletes a patient from the system.
// @Tags         Patients
// @Security     ApiKeyAuth
// @Param        id   path      int  true  "Patient ID"
// @Success      204  {object}  nil
// @Failure      400  {object}  gin.H "Invalid patient ID"
// @Failure      403  {object}  gin.H "Forbidden"
// @Failure      404  {object}  gin.H "Patient not found"
// @Router       /patients/{id} [delete]
func (h *Handler) DeletePatient(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid patient ID"})
		return
	}

	err = h.service.DeletePatient(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, ErrPatientNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete patient: " + err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

// SearchPatients godoc
// @Summary      Search for patients
// @Description  Searches for patients by name (case-insensitive).
// @Tags         Patients
// @Produce      json
// @Security     ApiKeyAuth
// @Param        q   query      string  true  "Search query"
// @Success      200  {array}   Patient
// @Failure      400  {object}  gin.H "Query parameter 'q' is required"
// @Failure      403  {object}  gin.H "Forbidden"
// @Router       /patients/search [get]
func (h *Handler) SearchPatients(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Query parameter 'q' is required"})
		return
	}

	patients, err := h.service.SearchPatients(c.Request.Context(), query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to search patients: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, patients)
}