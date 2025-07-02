package document

import (
	"context"
	"database/sql"
	"errors"

	"github.com/jmoiron/sqlx"
)

var ErrDocumentNotFound = errors.New("document not found")

type Repository interface {
	Create(ctx context.Context, doc *Document) error
	GetByID(ctx context.Context, id int) (*Document, error)
	GetByPatientID(ctx context.Context, patientID int) ([]Document, error)
	Delete(ctx context.Context, id int) error
}

type postgresRepository struct {
	db *sqlx.DB
}

func NewPostgresRepository(db *sqlx.DB) Repository {
	return &postgresRepository{db: db}
}

func (r *postgresRepository) Create(ctx context.Context, doc *Document) error {
	query := `INSERT INTO patient_documents (patient_id, file_name, file_url, public_id, mime_type, uploaded_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id, uploaded_at`
	return r.db.QueryRowContext(ctx, query, doc.PatientID, doc.FileName, doc.FileURL, doc.PublicID, doc.MimeType).Scan(&doc.ID, &doc.UploadedAt)
}

func (r *postgresRepository) GetByID(ctx context.Context, id int) (*Document, error) {
	var doc Document
	query := `SELECT id, patient_id, file_name, file_url, public_id, mime_type, uploaded_at FROM patient_documents WHERE id = $1`
	err := r.db.GetContext(ctx, &doc, query, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrDocumentNotFound
		}
		return nil, err
	}
	return &doc, nil
}

func (r *postgresRepository) GetByPatientID(ctx context.Context, patientID int) ([]Document, error) {
	var docs []Document
	query := `SELECT id, patient_id, file_name, file_url, mime_type, uploaded_at FROM patient_documents WHERE patient_id = $1 ORDER BY uploaded_by DESC`
	err := r.db.SelectContext(ctx, &docs, query, patientID)
	return docs, err
}

func (r *postgresRepository) Delete(ctx context.Context, id int) error {
	query := `DELECT FROM patient_documents WHERE id = $1`
	res, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return err
	}
	rowsAffected, err := res.RowsAffected()
	if err == nil && rowsAffected == 0 {
		return ErrDocumentNotFound
	}
	return err
}
