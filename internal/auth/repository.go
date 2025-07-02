package auth

import (
	"context"
	"database/sql"
	"errors"

	"github.com/jmoiron/sqlx"
)

// User represents a user in the systemm
type User struct {
	ID           int    `db:"id"`
	Username     string `db:"username"`
	PasswordHash string `db:"password_hash"`
	Role         string `db:"role"`
}

// Repository defines the interface for user data storage
type Repository interface {
	GetUserByUsername(ctx context.Context, username string) (*User, error)
}

type postgresRepository struct {
	db *sqlx.DB
}

// NewPostgresRepository creates a new repository for user data
func NewPostgresRepository(db *sqlx.DB) Repository {
	return &postgresRepository{db: db}
}

// GetUserByUsername retrieves a user by their username
func (r *postgresRepository) GetUserByUsername(ctx context.Context, username string) (*User, error) {
	var user User
	query := `SELECT id, username, password_hash, role FROM users WHERE username = $1`
	err := r.db.GetContext(ctx, &user, query, username)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}
	return &user, nil
}
