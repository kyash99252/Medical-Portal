package document

import "time"

// Document represents a patient's uploaded document
type Document struct {
	ID         int       `json:"id" db:"id"`
	PatientID  int       `json:"patient_id" db:"patient_id"`
	FileName   string    `json:"file_name" db:"file_name"`
	FileURL    string    `json:"file_url" db:"file_url"`
	PublicID   string    `json:"-" db:"public_id"`
	MimeType   string    `json:"mime_type" db:"mime_type"`
	UploadedAt time.Time `json:"uploaded_at" db:"uploaded_at"`
}
