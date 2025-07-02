package config

import (
	"log"
	"os"
)

// Config holds all configuration for the application
type Config struct {
	Port          string
	DatabaseURL   string
	JWTSecretKey  string
	GinMode       string
	CloudinaryURL string
}

// New creates a new Config instanceb
func New() *Config {
	return &Config{
		Port:          getEnv("PORT", "8080"),
		DatabaseURL:   getEnv("DATABASE_URL", ""),
		JWTSecretKey:  getEnv("JWT_SECRET_KEY", "secret"),
		GinMode:       getEnv("GIN_MODE", "debug"),
		CloudinaryURL: getEnv("CLOUDINARY_URL", ""),
	}
}

// getEnv reads an environment variable or returns a default value
func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	if fallback == "" && key != "CLOUDINARY_URL" {
		log.Fatalf("FATAL: Required environment variable %s is not set", key)
	}
	return fallback
}
