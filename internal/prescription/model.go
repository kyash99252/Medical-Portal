package prescription

import "time"

type Prescription struct {
	ID         int       `json:"id" db:"id"`
	PatientID  int       `json:"patient_id" db:"patient_id"`
	DoctorID   int       `json:"doctor_id" db:"doctor_id"`
	Medication string    `json:"medication" db:"medication"`
	Dosage     string    `json:"dosage" db:"dosage"`
	Frequency  string    `json:"frequency" db:"frequency"`
	Notes      *string   `json:"notes,omitempty" db:"notes"`
	CreatedAt  time.Time `json:"created_at" db:"created_at"`
}

// CreateRequest defines the payload for creating a prescription
type CreateRequest struct {
	Medication string  `json:"medication" binding:"required"`
	Dosage     string  `json:"dosage" binding:"required"`
	Frequency  string  `json:"frequency" binding:"required"`
	Notes      *string `json:"notes"`
}
