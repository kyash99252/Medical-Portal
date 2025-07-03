package prescription

import "context"

// Service provides prescription-related business logic
type Service interface {
	CreatePrescription(ctx context.Context, patientID int, doctorID int, req CreateRequest) (*Prescription, error)
	GetPrescriptionsForPatient(ctx context.Context, patientID int) ([]Prescription, error)
}

type service struct {
	repo Repository
}

// NewService creates a new prescription service with the given repository
func NewService(r Repository) Service {
	return &service{repo: r}
}

// CreatePrescription validates the input, constructs a Prescription model, and instructs the repository to save it.
func (s *service) CreatePrescription(ctx context.Context, patientID int, doctorID int, req CreateRequest) (*Prescription, error) {
	p := &Prescription{
		PatientID: patientID,
		DoctorID: doctorID,
		Medication: req.Medication,
		Dosage: req.Dosage,
		Frequency: req.Frequency,
		Notes: req.Notes,
	}

	if err := s.repo.Create(ctx, p); err != nil {
		return nil, err
	}

	return p, nil
}

// GetPrescriptionsForPatient is a straightforward pass-through to the repository to fetch all prescriptions for a specific patient
func (s *service) GetPrescriptionsForPatient(ctx context.Context, patientID int) ([]Prescription, error) {
	return s.repo.GetByPatientID(ctx, patientID)
}