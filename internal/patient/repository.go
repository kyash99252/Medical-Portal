package patient

import (
	"context"
	"database/sql"
	"errors"

	"github.com/jmoiron/sqlx"
)

var ErrPatientNotFound = errors.New("patient not found")

// Repository defines the interface for patient data operations
type Repository interface {
	Create(ctx context.Context, patient *Patient) error
	GetByID(ctx context.Context, id int) (*Patient, error)
	GetAll(ctx context.Context) ([]Patient, error)
	Update(ctx context.Context, patient *Patient) error
	UpdateMedical(ctx context.Context, id int, diagnosis, notes string) error
	Delete(ctx context.Context, id int) error
	SearchByName(ctx context.Context, name string) ([]Patient, error)
}

type postgresRepository struct {
	db *sqlx.DB
}

// NewPostgresRepository creates a new patient repository
func NewPostgresRepository(db *sqlx.DB) Repository {
	return &postgresRepository{db: db}
}

func (r *postgresRepository) Create(ctx context.Context, p *Patient) error {
	query := `INSERT INTO patients (name, age, address, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id`
	return r.db.QueryRowContext(ctx, query, p.Name, p.Age, p.Address).Scan(&p.ID)
}

func (r *postgresRepository) GetByID(ctx context.Context, id int) (*Patient, error) {
	var p Patient
	query := `SELECT id, name, age, address, diagnosis, notes, created_at, updated_at FROM patients WHERE id = $1`
	err := r.db.GetContext(ctx, &p, query, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrPatientNotFound
		}
		return nil, err
	}
	return &p, nil
}

func (r *postgresRepository) GetAll(ctx context.Context) ([]Patient, error) {
	var patients []Patient
	query := `SELECT id, name, age, address, diagnosis, notes, created_at, updated_at FROM patients ORDER BY created_at DESC`
	err := r.db.SelectContext(ctx, &patients, query)
	return patients, err
}

func (r *postgresRepository) Update(ctx context.Context, p *Patient) error {
	query := `UPDATE patients SET name = $1, age = $2, address = $3, updated_at = NOW() WHERE id = $4`
	res, err := r.db.ExecContext(ctx, query, p.Name, p.Age, p.Address, p.ID)
	if err != nil {
		return err
	}
	rowsAffected, err := res.RowsAffected()
	if err == nil && rowsAffected == 0 {
		return ErrPatientNotFound
	}
	return err
}

func (r *postgresRepository) UpdateMedical(ctx context.Context, id int, diagnosis, notes string) error {
	query := `UPDATE patients SET diagnosis = $1, notes = $2, updated_at = NOW() WHERE id = $3`
	res, err := r.db.ExecContext(ctx, query, diagnosis, notes, id)
	if err != nil {
		return err
	}
	rowsAffected, err := res.RowsAffected()
	if err == nil && rowsAffected == 0 {
		return ErrPatientNotFound
	}
	return err
}

func (r *postgresRepository) Delete(ctx context.Context, id int) error {
	query := `DELETE FROM patients WHERE id = $1`
	res, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return err
	}
	rowsAffected, err := res.RowsAffected()
	if err == nil && rowsAffected == 0 {
		return ErrPatientNotFound
	}
	return err
}

func (r *postgresRepository) SearchByName(ctx context.Context, name string) ([]Patient, error) {
	var patients []Patient
	query := `SELECT id, name, age, address, diagnosis, notes, created_at, updated_at FROM patients WHERE name ILIKE $1 ORDER BY name ASC`
	err := r.db.SelectContext(ctx, &patients, query, "%"+name+"%")
	return patients, err
}
