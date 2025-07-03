package tests

import (
    "context"
    "testing"
	"bytes"
    "encoding/json"
    "net/http"
    "net/http/httptest"

	"github.com/gin-gonic/gin"
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/mock"

    "github.com/kyash99252/Medical-Portal/internal/auth"
)

type mockAuthService struct {
    mock.Mock
}

func (m *mockAuthService) Login(ctx context.Context, username, password string) (string, error) {
    args := m.Called(ctx, username, password)
    return args.String(0), args.Error(1)
}
func (m *mockAuthService) HashPassword(password string) (string, error) {
    args := m.Called(password)
    return args.String(0), args.Error(1)
}
func (m *mockAuthService) CheckPasswordHash(password, hash string) bool {
    args := m.Called(password, hash)
    return args.Bool(0)
}

func TestLogin_Success(t *testing.T) {
    mockSvc := new(mockAuthService)
    h := auth.NewHandler(mockSvc)

    req := auth.LoginRequest{Username: "user", Password: "pass"}
    mockSvc.On("Login", mock.Anything, req.Username, req.Password).Return("token123", nil)

    // Use gin's test context
    w := performRequest(h.Login, "POST", req)

    assert.Equal(t, 200, w.Code)
    assert.Contains(t, w.Body.String(), "token123")
}

func TestLogin_InvalidCredentials(t *testing.T) {
    mockSvc := new(mockAuthService)
    h := auth.NewHandler(mockSvc)

    req := auth.LoginRequest{Username: "user", Password: "wrong"}
    mockSvc.On("Login", mock.Anything, req.Username, req.Password).Return("", auth.ErrInvalidCredentials)

    w := performRequest(h.Login, "POST", req)

    assert.Equal(t, 401, w.Code)
    assert.Contains(t, w.Body.String(), "Invalid username or password")
}

func TestLogin_BadRequest(t *testing.T) {
    mockSvc := new(mockAuthService)
    h := auth.NewHandler(mockSvc)

    // Send invalid JSON (missing password)
    w := performRequestRaw(h.Login, "POST", `{"username":"user"}`)

    assert.Equal(t, 400, w.Code)
    assert.Contains(t, w.Body.String(), "Invalid request body")
}

func performRequest(handler gin.HandlerFunc, method string, body interface{}) *httptest.ResponseRecorder {
    gin.SetMode(gin.TestMode)
    r := gin.New()
    r.POST("/login", handler)

    jsonBody, _ := json.Marshal(body)
    w := httptest.NewRecorder()
    req, _ := http.NewRequest(method, "/login", bytes.NewBuffer(jsonBody))
    req.Header.Set("Content-Type", "application/json")
    r.ServeHTTP(w, req)
    return w
}

func performRequestRaw(handler gin.HandlerFunc, method string, raw string) *httptest.ResponseRecorder {
    gin.SetMode(gin.TestMode)
    r := gin.New()
    r.POST("/login", handler)
    w := httptest.NewRecorder()
    req, _ := http.NewRequest(method, "/login", bytes.NewBufferString(raw))
    req.Header.Set("Content-Type", "application/json")
    r.ServeHTTP(w, req)
    return w
}
