//go:build integration

package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	"github.com/joho/godotenv"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/kyash99252/Medical-Portal/internal/auth"
	"github.com/kyash99252/Medical-Portal/internal/middleware"
	"github.com/kyash99252/Medical-Portal/internal/patient"
	"github.com/kyash99252/Medical-Portal/pkg/config"
)

var (
	router *gin.Engine
	db *sqlx.DB
	cfg *config.Config
	receptionistToken string
	doctorToken string
)

func TestMain(m *testing.M) {
	// Setup
	err := godotenv.Load("../.env")
	if err != nil {
		panic("Error loading .env file for integration tests")
	}

	cfg = config.New()
	gin.SetMode(gin.TestMode)

	// Connect to the real test database
	db, err = sqlx.Connect("postgres", cfg.DatabaseURL)
	if err != nil {
		panic("Failed to connect to database for integration tests: " + err.Error())
	}

	// Setup router
	router = setupRouter(db, cfg)

	// Get tokens
	receptionistToken = getAuthToken("receptionist", "password123")
	doctorToken = getAuthToken("doctor", "password123")
	if receptionistToken == "" || doctorToken == "" {
		panic("Failed to get auth tokens for tests")
	}

	// Run tests
	code := m.Run()

	// Teardown
	db.Close()
	os.Exit(code)
}

func setupRouter(db *sqlx.DB, cfg *config.Config) *gin.Engine {
	r := gin.New()
	userRepo := auth.NewPostgresRepository(db)
	patientRepo := patient.NewPostgresRepository(db)
	authSvc := auth.NewService(userRepo, cfg.JWTSecretKey)
	patientSvc := patient.NewService(patientRepo)
	authHandler := auth.NewHandler(authSvc)
	patientHandler := patient.NewHandler(patientSvc)
	
	v1 := r.Group("/api/v1")
	{
		v1.POST("/login", authHandler.Login)
		authRoutes := v1.Group("/")
		authRoutes.Use(middleware.AuthMiddleware(cfg.JWTSecretKey))
		{
			p := authRoutes.Group("/patients")
			{
				p.POST("", middleware.RoleMiddleware("receptionist"), patientHandler.CreatePatient)
				p.PUT("/:id", middleware.RoleMiddleware("receptionist"), patientHandler.UpdatePatient)
				p.DELETE("/:id", middleware.RoleMiddleware("receptionist"), patientHandler.DeletePatient)
				p.PATCH("/:id/medical", middleware.RoleMiddleware("doctor"), patientHandler.UpdatePatientMedical)
				p.GET("", middleware.RoleMiddleware("receptionist", "doctor"), patientHandler.ListPatients)
				p.GET("/:id", middleware.RoleMiddleware("receptionist", "doctor"), patientHandler.GetPatient)
			}
		}
	}
	return r
}

func getAuthToken(username, password string) string {
	loginReq := auth.LoginRequest{Username: username, Password: password}
	body, _ := json.Marshal(loginReq)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/v1/login", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		return ""
	}

	var resp auth.LoginResponse
	json.Unmarshal(w.Body.Bytes(), &resp)
	return resp.Token
}

func clearPatientsTable() {
	_, err := db.Exec("TRUNCATE patients RESTART IDENTITY CASCADE")
	if err != nil {
		panic("Failed to clear patients table: " + err.Error())
	}
}

func TestPatientCRUD_Receptionist(t *testing.T) {
	clearPatientsTable()
	require.NotEmpty(t, receptionistToken, "Receptionist token is empty")
	
	var createdPatient patient.Patient

	// 1. Create Patient
	t.Run("Create Patient", func(t *testing.T) {
		createReq := patient.CreatePatientRequest{
			Name: "Integration Test Patient",
			Age: 30,
			Address: "123 Test St",
		}
		body, _ := json.Marshal(createReq)

		w := httptest.NewRecorder()
		req, _ := http.NewRequest("POST", "/api/v1/patients", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer " + receptionistToken)
		router.ServeHTTP(w, req)
		
		assert.Equal(t, http.StatusCreated, w.Code)
		err := json.Unmarshal(w.Body.Bytes(), &createdPatient)
		require.NoError(t, err)
		assert.Equal(t, "Integration Test Patient", createdPatient.Name)
		assert.NotZero(t, createdPatient.ID)
	})
	
	// 2. Get Patient
	t.Run("Get Patient", func(t *testing.T) {
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("GET", "/api/v1/patients/" + string(rune(createdPatient.ID)), nil)
		req.Header.Set("Authorization", "Bearer " + receptionistToken)
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
	})

	// 3. Update Patient
	t.Run("Update Patient", func(t *testing.T) {
		updateReq := patient.UpdatePatientRequest{
			Name: "Updated Patient Name",
			Age: 31,
			Address: "456 Updated St",
		}
		body, _ := json.Marshal(updateReq)
		
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("PUT", "/api/v1/patients/" + string(rune(createdPatient.ID)), bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer " + receptionistToken)
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var updatedPatient patient.Patient
		json.Unmarshal(w.Body.Bytes(), &updatedPatient)
		assert.Equal(t, "Updated Patient Name", updatedPatient.Name)
		assert.Equal(t, 31, updatedPatient.Age)
	})

	// 4. Delete Patient
	t.Run("Delete Patient", func(t *testing.T) {
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("DELETE", "/api/v1/patients/" + string(rune(createdPatient.ID)), nil)
		req.Header.Set("Authorization", "Bearer " + receptionistToken)
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusNoContent, w.Code)
	})
}

func TestPatientAccess_Doctor(t *testing.T) {
	clearPatientsTable()
	require.NotEmpty(t, doctorToken, "Doctor token is empty")

	// Pre-populate a patient using the DB directly for this test
	var patientID int
	err := db.QueryRow(`INSERT INTO patients (name, age, address) VALUES ($1, $2, $3) RETURNING id`,
		"Doctor Test Patient", 55, "789 Clinic Rd").Scan(&patientID)
	require.NoError(t, err)

	// 1. Doctor CANNOT create a patient
	t.Run("Doctor Cannot Create Patient", func(t *testing.T) {
		createReq := patient.CreatePatientRequest{Name: "Illegal", Age: 1, Address: "No"}
		body, _ := json.Marshal(createReq)
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("POST", "/api/v1/patients", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer " + doctorToken)
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusForbidden, w.Code)
	})

	// 2. Doctor CAN read patients
	t.Run("Doctor Can Read Patient", func(t *testing.T) {
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("GET", "/api/v1/patients", nil)
		req.Header.Set("Authorization", "Bearer " + doctorToken)
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
	})

	// 3. Doctor CAN update medical details
	t.Run("Doctor Can Update Medical Details", func(t *testing.T) {
		medicalReq := patient.UpdatePatientMedicalRequest{
			Diagnosis: "Hypertension",
			Notes:     "Prescribed beta-blockers.",
		}
		body, _ := json.Marshal(medicalReq)
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("PATCH", "/api/v1/patients/" + string(rune(patientID)) + "/medical", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer " + doctorToken)
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var updatedPatient patient.Patient
		json.Unmarshal(w.Body.Bytes(), &updatedPatient)
		assert.Equal(t, "Hypertension", *updatedPatient.Diagnosis)
	})
}