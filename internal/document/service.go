package document

import (
	"context"
	"fmt"
	"log"
	"mime/multipart"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

type Service interface {
	UploadDocument(ctx context.Context, patientID int, fileHeader *multipart.FileHeader) (*Document, error)
	GetDocumentsForPatient(ctx context.Context, patientID int) ([]Document, error)
	DeleteDocument(ctx context.Context, id int) error
}

type service struct {
	repo Repository
	cloudinary *cloudinary.Cloudinary
}

func NewService(r Repository, cld *cloudinary.Cloudinary) Service {
	return &service{repo: r, cloudinary: cld}
}

func (s *service) UploadDocument(ctx context.Context, patientID int, fileHeader *multipart.FileHeader) (*Document, error) {
	log.Println("📥 Starting document upload for patient:", patientID)
	log.Println("📄 File received:", fileHeader.Filename)

	file, err := fileHeader.Open()
	if err != nil {
		log.Println("❌ Failed to open uploaded file:", err)
		return nil, err
	}
	defer file.Close()

	uploadParams := uploader.UploadParams{
		PublicID:     fmt.Sprintf("patient_docs/patient_%d/%s", patientID, fileHeader.Filename),
		Folder:       "patient_documents",
		ResourceType: "auto",
	}
	log.Println("🚀 Uploading to Cloudinary with PublicID:", uploadParams.PublicID)

	uploadResult, err := s.cloudinary.Upload.Upload(ctx, file, uploadParams)
	if err != nil {
		log.Println("❌ Cloudinary upload failed:", err)
		return nil, err
	}

	log.Println("✅ Upload successful")
	log.Println("🔗 File URL:", uploadResult.SecureURL)
	log.Println("🆔 Cloudinary Public ID:", uploadResult.PublicID)

	doc := &Document{
		PatientID: patientID,
		FileName:  fileHeader.Filename,
		FileURL:   uploadResult.SecureURL,
		PublicID:  uploadResult.PublicID,
		MimeType:  fileHeader.Header.Get("Content-Type"),
	}

	if err := s.repo.Create(ctx, doc); err != nil {
		log.Println("❌ Failed to save document to DB. Rolling back Cloudinary upload.")
		s.cloudinary.Upload.Destroy(ctx, uploader.DestroyParams{PublicID: doc.PublicID})
		return nil, err
	}

	log.Println("📄 Document metadata saved to DB successfully.")
	return doc, nil
}

func (s *service) GetDocumentsForPatient(ctx context.Context, patientID int) ([]Document, error) {
	return s.repo.GetByPatientID(ctx, patientID)
}

func (s *service) DeleteDocument(ctx context.Context, id int) error {
	doc, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	_, err = s.cloudinary.Upload.Destroy(ctx, uploader.DestroyParams{PublicID: doc.PublicID})
	if err != nil {
		log.Printf("WARN: Failed to delete document %s from Cloudinary: %v", doc.PublicID, err)
	}
	return s.repo.Delete(ctx, id)
}