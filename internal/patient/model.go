package patient

import "time"

type Patient struct {
	ID        int       `json:"id" db:"id"`
	Name      string    `json:"name" db:"name"`
	Age       int       `json:"age" db:"age"`
	Address   string    `json:"address" db:"address"`
	Diagnosis *string   `json:"diagnosis" db:"diagnosis"`
	Notes     *string   `json:"notes" db:"notes"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

// CreatePatientRequest is used for creating a new patient
type CreatePatientRequest struct {
	Name    string `json:"name" binding:"required"`
	Age     int    `json:"age" binding:"required,gt=0"`
	Address string `json:"address" binding:"required"`
}

// UpdatePatientRequest is used for updating a patient's full record
type UpdatePatientRequest struct {
	Name    string `json:"name" binding:"required"`
	Age     int    `json:"age" binding:"required,gt=0"`
	Address string `json:"address" binding:"required"`
}

// UpdatePatientMedicalRequest is used by doctors to update medical fields
type UpdatePatientMedicalRequest struct {
	Diagnosis string `json:"diagnosis" binding:"required"`
	Notes     string `json:"notes"`
}
