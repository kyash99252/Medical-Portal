package prescription

import (
	"context"

	"github.com/jmoiron/sqlx"
)

// Repository defines the interface for prescription data storage operations
type Repository interface {
	Create(ctx context.Context, p *Prescription) error
	GetByPatientID(ctx context.Context, patientID int) ([]Prescription, error)
}

type postgresRepository struct {
	db *sqlx.DB
}

// NewPostgresRepository creates a new repository for prescription data
func NewPostgresRepository(db *sqlx.DB) Repository {
	return &postgresRepository{db: db}
}

// Create inserts a new prescription record into the database
func (r *postgresRepository) Create(ctx context.Context, p *Prescription) error {
	query := `INSERT INTO prescriptions (patient_id, doctor_id, medication, dosage, frequency, notes, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id, created_at`
	return r.db.QueryRowContext(ctx, query, p.PatientID, p.DoctorID, p.Medication, p.Dosage, p.Frequency, p.Notes).Scan(&p.ID, &p.CreatedAt)
}

// GetByPatientID retrieves all prescriptions for a given patient from the database
func (r *postgresRepository) GetByPatientID(ctx context.Context, patientID int) ([]Prescription, error) {
	var prescriptions []Prescription
	query := `SELECT id, patient_id, doctor_id, medication, dosage_frequency, notes, created_at FROM prescriptions WHERE patient_id = $1 ORDER BY created_at DESC`

	err := r.db.SelectContext(ctx, &prescriptions, query, patientID)
	if err != nil {
		return nil, err
	}
	return prescriptions, nil
}