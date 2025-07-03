# 🏥 Medical Portal

[![Go Version](https://img.shields.io/badge/Go-1.21+-00ADD8?logo=go)](https://golang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?logo=postgresql)](https://www.postgresql.org/)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![Swagger Docs](https://img.shields.io/badge/docs-swagger-blue?logo=swagger)](/swagger/index.html)

A modern, role-based hospital management system built with **Golang (Gin)** and **PostgreSQL**. The Medical Portal provides secure, API-driven access for both **receptionists** and **doctors** to manage patients, documents, and prescriptions. Includes a clean, optional **Next.js** frontend.

---

## 🚀 Project Overview

**Medical Portal** is a full-stack web application designed for hospitals and clinics. It features:

- **Receptionist Portal:** Register and manage patients.
- **Doctor Portal:** View and update patient details, manage prescriptions and documents.
- **Single Sign-On:** Unified login for both roles with JWT-based authentication.
- **Role-Based Access:** Fine-grained permissions for receptionists and doctors.
- **API-First:** Well-documented RESTful API with Swagger.
- **Cloudinary Integration:** Secure file uploads for medical documents and prescriptions.
- **Clean Architecture:** Modular, maintainable Go backend with repository/service/handler layers.
- **Optional Frontend:** Next.js + Tailwind + shadcn/ui for a modern UI.

---

## ✨ Features

- **Authentication & Authorization**
  - JWT-based login for both roles
  - Role-based access control (Receptionist, Doctor)
- **Patient Management**
  - Receptionists: Create, read, update, delete patients
  - Doctors: View and update patient details
- **Document & Prescription Management**
  - Upload and manage patient documents (Cloudinary)
  - Manage prescriptions for patients
- **API Documentation**
  - Swagger UI at `/swagger/index.html`
  - Postman collection in `docs/postman_collection.json`
- **Testing**
  - Partial unit and integration tests (see [Testing Instructions](#-testing-instructions))
- **Docker Support**
  - Dockerfile and docker-compose for easy setup
- **Extensible Architecture**
  - Clean separation of concerns for easy feature addition

---

## 🛠️ Tech Stack

- **Backend:** Go (Gin), Clean Architecture, JWT, PostgreSQL, Cloudinary SDK
- **Frontend:** Next.js, Tailwind CSS, shadcn/ui
- **API Docs:** Swagger, Postman
- **DevOps:** Docker, Makefile

---

## 📁 Project Structure

```
.
├── api/                # API entrypoint (main.go)
├── internal/           # Core business logic
│   ├── auth/           # Auth (JWT, roles)
│   ├── patient/        # Patient CRUD
│   ├── document/       # Document upload/management
│   ├── prescription/   # Prescription management
│   └── middleware/     # Auth middleware
├── pkg/config/         # Configuration utilities
├── migrations/         # SQL migrations
├── web/                # Next.js frontend
├── docs/               # API docs (Swagger, Postman)
├── tests/              # Unit & integration tests
├── Dockerfile
├── docker-compose.yml
├── Makefile
└── README.md
```

---

## ⚡ Setup & Installation

### 1. Prerequisites

- Go 1.21+
- PostgreSQL 15+
- [Cloudinary account](https://cloudinary.com/) (for file uploads)
- Node.js 18+ (for frontend)
- Docker (optional, for containerized setup)

### 2. Clone the Repository

```powershell
git clone https://github.com/kyash99252/Medical-Portal.git
cd Medical-Portal
```

### 3. Configure Environment

Copy and edit your environment variables:

```powershell
cp .env.example .env
# Edit .env with your DB, JWT, and Cloudinary credentials
```

### 4. Database Setup

Run migrations (ensure PostgreSQL is running):

```powershell
make migrate-up
```

Or with Docker:

```powershell
docker-compose up -d db
make migrate-up
```

### 5. Run the Backend

```powershell
go run api/cmd/server/main.go
```

Or with Docker Compose:

```powershell
docker-compose up --build
```

### 6. Run the Frontend

```powershell
cd web
pnpm install
pnpm dev
```

---

## 📖 API Documentation

- **Swagger UI:** [http://localhost:8080/swagger/index.html](http://localhost:8080/swagger/index.html)
- **Postman Collection:** [`docs/postman_collection.json`](docs/postman_collection.json)
- **OpenAPI Spec:** [`docs/swagger.yaml`](docs/swagger.yaml)

---

## 🧪 Sample Data / Usage

### 1. Register/Login

- **POST** `/api/auth/login`
  - Request: `{ "username": "...", "password": "..." }`
  - Response: `{ "token": "JWT...", "role": "receptionist|doctor" }`

### 2. Patient CRUD (Receptionist)

- **POST** `/api/patients`
- **GET** `/api/patients`
- **PUT** `/api/patients/{id}`
- **DELETE** `/api/patients/{id}`

### 3. Patient Details (Doctor)

- **GET** `/api/patients/{id}`
- **PUT** `/api/patients/{id}`

### 4. Document & Prescription Upload

- **POST** `/api/patients/{id}/documents`
- **POST** `/api/patients/{id}/prescriptions`

> See Swagger UI for full request/response details and try out endpoints interactively.

---

## 🧪 Testing Instructions

- **Run all tests:**

  ```powershell
  go test ./...
  ```

- **Test files:** Located in `tests/` (e.g., `auth_test.go`, `patient_test.go`, `integration_test.go`)

> ⚠️ **Warning:** Unit and integration test coverage is **partial**. Some modules may lack comprehensive tests.

---

## 🚀 Deployment Guide

### Docker Compose

1. Build and start all services:

   ```powershell
   docker-compose up --build
   ```

2. Access backend at [http://localhost:8080](http://localhost:8080)

3. Access Swagger docs at [http://localhost:8080/swagger/index.html](http://localhost:8080/swagger/index.html)

### Vercel (Frontend)

- The Next.js frontend can be deployed to Vercel. See `vercel.json` for configuration.

---
