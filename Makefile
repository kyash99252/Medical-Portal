ifneq (,$(wildcard ./.env))
    include .env
    export
endif

# Default Go binary name
BINARY_NAME=Medical-Portal

.PHONY: all run clean test test-unit test-integration migrate-up migrate-down swag-init docker-run docker-stop docker-logs

all: test build

# Build the Go application
build:
	@echo "Building binary..."
	@go build -o $(BINARY_NAME) ./cmd/server

# Run the Go application locally
run:
	@echo "Starting server locally..."
	@go run .api/cmd/server/main.go

# Clean up build artifacts
clean:
	@echo "Cleaning up..."
	@go clean
	@rm -f $(BINARY_NAME)

# Generate Swagger documentation
swag-init:
	@echo "Initializing Swagger docs..."
	@swag init -g api/cmd/server/main.go

# Run all tests (unit and integration)
test:
	@echo "Starting services for integration tests..."
	@docker-compose up -d db
	@echo "Waiting for DB to be ready..."
	@sleep 5
	@echo "Running all tests (unit + integration)..."
	@go test -v -tags=integration ./...
	@echo "Stopping services..."
	@docker-compose down

# Run only unit tests
test-unit:
	@echo "Running unit tests..."
	@go test -v `go list ./... | grep -v /tests`

# Run only integration tests
test-integration:
	@echo "Starting services for integration tests..."
	@docker-compose up -d db
	@echo "Waiting for DB to be ready..."
	@sleep 5
	@echo "Running integration tests..."
	@go test -v -tags=integration ./tests/...
	@echo "Stopping services..."
	@docker-compose down

migrate-up:
	@echo "Applying migrations via Docker..."
	@docker-compose --env-file ./.env exec -T app migrate -path /migrations -database "$$DATABASE_URL" up

migrate-down:
	@echo "Rolling back last migration via Docker..."
	@docker-compose --env-file ./.env exec -T app migrate -path /migrations -database "$$DATABASE_URL" down

# Run the application using Docker Compose
docker-run:
	@echo "Building and starting Docker containers..."
	@docker-compose up --build -d

# Stop the Docker Compose application
docker-stop:
	@echo "Stopping Docker containers..."
	@docker-compose down

# View logs for the app container
docker-logs:
	@docker-compose logs -f app