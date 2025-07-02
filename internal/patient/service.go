package patient

import "context"

// Service provides patient-related business logic
type Service interface {
	CreatePatient(ctx context.Context, req CreatePatientRequest) (*Patient, error)
	GetPatient(ctx context.Context, id int) (*Patient, error)
	ListAllPatients(ctx context.Context) ([]Patient, error)
	UpdatePatient(ctx context.Context, id int, req UpdatePatientRequest) (*Patient, error)
	UpdatePatientMedical(ctx context.Context, id int, req UpdatePatientMedicalRequest) (*Patient, error)
	DeletePatient(ctx context.Context, id int) error
	SearchPatients(ctx context.Context, name string) ([]Patient, error)
}

type service struct {
	repo Repository
}

// NewService creates a new patient service
func NewService(r Repository) Service {
	return &service{repo: r}
}

func (s *service) CreatePatient(ctx context.Context, req CreatePatientRequest) (*Patient, error) {
	p := &Patient{
		Name:        req.Name,
		Age:         req.Age,
		Address:     req.Address,
		PhoneNumber: req.PhoneNumber,
	}
	err := s.repo.Create(ctx, p)
	if err != nil {
		return nil, err
	}
	return p, nil
}

func (s *service) GetPatient(ctx context.Context, id int) (*Patient, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *service) ListAllPatients(ctx context.Context) ([]Patient, error) {
	return s.repo.GetAll(ctx)
}

func (s *service) UpdatePatient(ctx context.Context, id int, req UpdatePatientRequest) (*Patient, error) {
	p := &Patient{
		ID:          id,
		Name:        req.Name,
		Age:         req.Age,
		Address:     req.Address,
		PhoneNumber: req.PhoneNumber,
	}
	err := s.repo.Update(ctx, p)
	if err != nil {
		return nil, err
	}
	return s.repo.GetByID(ctx, id)
}

func (s *service) UpdatePatientMedical(ctx context.Context, id int, req UpdatePatientMedicalRequest) (*Patient, error) {
	err := s.repo.UpdateMedical(ctx, id, req.Diagnosis, req.Notes)
	if err != nil {
		return nil, err
	}
	return s.repo.GetByID(ctx, id)
}

func (s *service) DeletePatient(ctx context.Context, id int) error {
	return s.repo.Delete(ctx, id)
}

func (s *service) SearchPatients(ctx context.Context, name string) ([]Patient, error) {
	return s.repo.SearchByName(ctx, name)
}
