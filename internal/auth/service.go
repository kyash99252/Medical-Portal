package auth

import (
	"context"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrInvalidCredentials = errors.New("invalid username or password")
	ErrUserNotFound       = errors.New("user not found")
)

// Service provides authentication logic
type Service interface {
	Login(ctx context.Context, username, password string) (string, error)
	HashPassword(password string) (string, error)
	CheckPasswordHash(password, hash string) bool
}

type service struct {
	repo Repository
	jwtSecretKey string
}

// NewService creates a new auth service
func NewService(r Repository, jwtSecret string) Service {
	return &service{repo: r, jwtSecretKey: jwtSecret}
}

// Login authenticates a user and returns a JWT token
func (s *service) Login(ctx context.Context, username, password string) (string, error) {
	user, err := s.repo.GetUserByUsername(ctx, username)
	if err != nil {
		if err == ErrUserNotFound {
			return "", ErrInvalidCredentials
		}
		return "", err
	}

	if !s.CheckPasswordHash(password, user.PasswordHash) {
		return "", ErrInvalidCredentials
	}

	// Create JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": user.ID,
		"user": user.Username,
		"role": user.Role,
		"exp": time.Now().Add(time.Hour * 72).Unix(),
	})

	tokenString, err := token.SignedString([]byte(s.jwtSecretKey))
	if err != nil {
		return "", err
	}
	return tokenString, nil
}

// HashPassword hashes a password using bcrypt
func (s *service) HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

// CheckPasswordHash compares a password with a hash
func (s *service) CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}