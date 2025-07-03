package document

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service Service
}

func NewHandler(s Service) *Handler {
	return &Handler{service: s}
}

type ErrorResponse struct {
	Error string `json:"error"`
}

// UploadDocument godoc
// @Summary      Upload a document for a patient
// @Description  Uploads a file (pdf, jpg, etc.) associated with a patient.
// @Tags         Documents
// @Accept       multipart/form-data
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id   path      int  true  "Patient ID"
// @Param        document formData file true "The document to upload"
// @Success      201 {object} Document
// @Failure      400 {object} ErrorResponse "Bad request"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /patients/{id}/documents [post]
func (h *Handler) UploadDocument(c *gin.Context) {
	patientID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid patient ID"})
		return
	}

	file, err := c.FormFile("document")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File 'document' is required in form-data"})
		return
	}

	doc, err := h.service.UploadDocument(c.Request.Context(), patientID, file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upload document: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, doc)
}

// GetPatientDocuments 
// @Summary      List documents for a patient
// @Description  Retrieves a list of all documents for a specific patient.
// @Tags         Documents
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id   path      int  true  "Patient ID"
// @Success      200  {array}   Document
// @Failure      400  {object}  ErrorResponse "Invalid patient ID"
// @Failure      500  {object}  ErrorResponse "Internal server error"
// @Router       /patients/{id}/documents [get]
func (h *Handler) GetPatientDocuments(c *gin.Context) {
	patientID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid patient ID"})
		return
	}

	docs, err := h.service.GetDocumentsForPatient(c.Request.Context(), patientID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve documetns: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, docs)
}

// DeleteDocument godoc
// @Summary      Delete a document
// @Description  Deletes a document from the system and cloud storage.
// @Tags         Documents
// @Security     ApiKeyAuth
// @Param        doc_id   path      int  true  "Document ID"
// @Success      204  {object}  nil
// @Failure      400  {object}  ErrorResponse "Invalid document ID"
// @Failure      404  {object}  ErrorResponse "Document not found"
// @Router       /documents/{doc_id} [delete]
func (h *Handler) DeleteDocument(c *gin.Context) {
	docID, err := strconv.Atoi(c.Param("doc_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid document ID"})
		return
	}

	err = h.service.DeleteDocument(c.Request.Context(), docID)
	if err != nil {
		if errors.Is(err, ErrDocumentNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete document: " + err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}