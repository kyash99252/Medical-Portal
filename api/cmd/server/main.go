package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/golang-migrate/migrate/v4"
	"github.com/cloudinary/cloudinary-go/v2"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	"github.com/joho/godotenv"
	"github.com/kyash99252/Medical-Portal/internal/auth"
	"github.com/kyash99252/Medical-Portal/internal/document"
	"github.com/kyash99252/Medical-Portal/internal/middleware"
	"github.com/kyash99252/Medical-Portal/internal/patient"
	"github.com/kyash99252/Medical-Portal/internal/prescription"
	"github.com/kyash99252/Medical-Portal/pkg/config"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "gb.com/lib/pithuq"
)

// @title           Receptionist & Doctor Portal API
// @version         1.0
// @description     This is a sample server for a receptionist and doctor portal.
// @termsOfService  http://swagger.io/terms/

// @contact.name   API Support
// @contact.url    http://www.swagger.io/support
// @contact.email  support@swagger.io

// @license.name  Apache 2.0
// @license.url   http://www.apache.org/licenses/LICENSE-2.0.html

// @host      localhost:8080
// @BasePath  /api/v1

// @securityDefinitions.apikey ApiKeyAuth
// @in header
// @name Authorization

func main() {
	// Load config
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found using environment variables")
	}
	cfg := config.New()

	// Run Migrations
	runMigrations(cfg.DatabaseURL)

	// Initialize Database connection
	db, err := sqlx.Connect("postgres", cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Could not connect to the database: %v", err)
	}
	defer db.Close()

	cld, err := cloudinary.NewFromURL(cfg.CloudinaryURL)
	if err != nil {
		log.Fatalf("Could not initialize Cloudinary: %v", err)
	}

	// Set Gin mode
	gin.SetMode(cfg.GinMode)

	// Initialize Router
	router := gin.Default()

	// Serve frontend
	router.Static("/web", "./web")
	router.GET("/", func(c *gin.Context) {
		c.Redirect(http.StatusMovedPermanently, "/web")
	})

	// Health Check
	router.GET("/healthz", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// Swagger Docs
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// API v1 Group
	v1 := router.Group("/api/v1")
	{
		// --- Repositories ---
		userRepo := auth.NewPostgresRepository(db)
		patientRepo := patient.NewPostgresRepository(db)
		docRepo := document.NewPostgresRepository(db)
		prescriptionRepo := prescription.NewPostgresRepository(db)

		// --- Services ---
		authSvc := auth.NewService(userRepo, cfg.JWTSecretKey)
		patientSvc := patient.NewService(patientRepo)
		docSvc := document.NewService(docRepo, cld)
		prescriptionSvc := prescription.NewService(prescriptionRepo)

		// --- Handlers ---
		authHandler := auth.NewHandler(authSvc)
		patientHandler := patient.NewHandler(patientSvc)
		docHandler := document.NewHandler(docSvc)
		prescriptionHandler := prescription.NewHandler(prescriptionSvc)

		// --- Routes ---
		v1.POST("/login", authHandler.Login)
		
		authRoutes := v1.Group("/")
		authRoutes.Use(middleware.AuthMiddleware(cfg.JWTSecretKey))
		{
			// Patient routes (permissions already set up)
			p := authRoutes.Group("/patients")
			{
				p.POST("", middleware.RoleMiddleware("receptionist"), patientHandler.CreatePatient)
				p.GET("", middleware.RoleMiddleware("receptionist", "doctor"), patientHandler.ListPatients)
				p.GET("/:id", middleware.RoleMiddleware("receptionist", "doctor"), patientHandler.GetPatient)
				p.PUT("/:id", middleware.RoleMiddleware("receptionist"), patientHandler.UpdatePatient)
				p.PATCH("/:id/medical", middleware.RoleMiddleware("doctor"), patientHandler.UpdatePatientMedical)
				p.DELETE("/:id", middleware.RoleMiddleware("receptionist"), patientHandler.DeletePatient)

				// Prescription Routes
				p.POST("/:id/prescriptions", middleware.RoleMiddleware("doctor"), prescriptionHandler.CreatePrescription)
				p.GET("/:id/prescriptions", middleware.RoleMiddleware("receptionist", "doctor"), prescriptionHandler.GetPatientPrescriptions)
				
				// Document Routes
				p.POST("/:id/documents", middleware.RoleMiddleware("receptionist", "doctor"), docHandler.UploadDocument)
				p.GET("/:id/documents", middleware.RoleMiddleware("receptionist", "doctor"), docHandler.GetPatientDocuments)
			}
			
			// Standalone Document Deletion
			authRoutes.DELETE("/documents/:doc_id", middleware.RoleMiddleware("receptionist"), docHandler.DeleteDocument)
		}
	}

	// Create HTTP server
	srv := &http.Server{
		Addr: ":" + cfg.Port,
		Handler: router,
	}

	// Start server in a goroutine
	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s\n", err)
		}
	} ()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5 *time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown: ", err)
	}

	log.Println("Server exiting")
}

func runMigrations(databaseURL string) {
	m, err := migrate.New("file://migrations", databaseURL)
	if err != nil {
		log.Printf("Could not create migrate instance: %v. Skipping migrations.", err)
		return
	}

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		log.Printf("Could not run migrations: %v. Please check your DB connection and migration files.", err)
	} else {
		log.Println("Migrations applied successfully.")
	}
}