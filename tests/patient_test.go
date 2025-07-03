package tests

import (
    "context"
    "errors"
    "testing"
	"bytes"
    "encoding/json"
    "fmt"
    "net/http"
    "net/http/httptest"

	"github.com/gin-gonic/gin"
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/mock"

    "github.com/kyash99252/Medical-Portal/internal/patient"
)

type mockPatientService struct {
    mock.Mock
}

func (m *mockPatientService) CreatePatient(ctx context.Context, req patient.CreatePatientRequest) (*patient.Patient, error) {
    args := m.Called(ctx, req)
    if args.Get(0) == nil {
        return nil, args.Error(1)
    }
    return args.Get(0).(*patient.Patient), args.Error(1)
}
func (m *mockPatientService) GetPatient(ctx context.Context, id int) (*patient.Patient, error) {
    args := m.Called(ctx, id)
    if args.Get(0) == nil {
        return nil, args.Error(1)
    }
    return args.Get(0).(*patient.Patient), args.Error(1)
}
func (m *mockPatientService) ListAllPatients(ctx context.Context) ([]patient.Patient, error) {
    args := m.Called(ctx)
    return args.Get(0).([]patient.Patient), args.Error(1)
}
func (m *mockPatientService) UpdatePatient(ctx context.Context, id int, req patient.UpdatePatientRequest) (*patient.Patient, error) {
    args := m.Called(ctx, id, req)
    if args.Get(0) == nil {
        return nil, args.Error(1)
    }
    return args.Get(0).(*patient.Patient), args.Error(1)
}
func (m *mockPatientService) UpdatePatientMedical(ctx context.Context, id int, req patient.UpdatePatientMedicalRequest) (*patient.Patient, error) {
    args := m.Called(ctx, id, req)
    if args.Get(0) == nil {
        return nil, args.Error(1)
    }
    return args.Get(0).(*patient.Patient), args.Error(1)
}
func (m *mockPatientService) DeletePatient(ctx context.Context, id int) error {
    args := m.Called(ctx, id)
    return args.Error(0)
}
func (m *mockPatientService) SearchPatients(ctx context.Context, name string) ([]patient.Patient, error) {
    args := m.Called(ctx, name)
    return args.Get(0).([]patient.Patient), args.Error(1)
}

func TestCreatePatient_Success(t *testing.T) {
    mockSvc := new(mockPatientService)
    h := patient.NewHandler(mockSvc)

    req := patient.CreatePatientRequest{Name: "John", Age: 30, Address: "123 St"}
    pat := &patient.Patient{ID: 1, Name: "John", Age: 30, Address: "123 St"}
    mockSvc.On("CreatePatient", mock.Anything, req).Return(pat, nil)

    w := performPatientRequest(h.CreatePatient, "POST", req)

    assert.Equal(t, 201, w.Code)
    assert.Contains(t, w.Body.String(), "John")
}

func TestGetPatient_NotFound(t *testing.T) {
    mockSvc := new(mockPatientService)
    h := patient.NewHandler(mockSvc)

    mockSvc.On("GetPatient", mock.Anything, 99).Return(nil, errors.New("patient not found"))
    w := performPatientRequestWithID(h.GetPatient, "GET", 99, nil)

    assert.Equal(t, 404, w.Code)
    assert.Contains(t, w.Body.String(), "patient not found")
}

func TestListPatients_Empty(t *testing.T) {
    mockSvc := new(mockPatientService)
    h := patient.NewHandler(mockSvc)
    mockSvc.On("ListAllPatients", mock.Anything).Return([]patient.Patient{}, nil)
    w := performPatientRequest(h.ListPatients, "GET", nil)
    assert.Equal(t, 200, w.Code)
    assert.Contains(t, w.Body.String(), "[]")
}

func performPatientRequest(handler gin.HandlerFunc, method string, body interface{}) *httptest.ResponseRecorder {
    gin.SetMode(gin.TestMode)
    r := gin.New()
    r.POST("/patients", handler)
    r.GET("/patients", handler)

    var reqBody *bytes.Buffer
    if body != nil {
        jsonBody, _ := json.Marshal(body)
        reqBody = bytes.NewBuffer(jsonBody)
    } else {
        reqBody = &bytes.Buffer{}
    }
    w := httptest.NewRecorder()
    req, _ := http.NewRequest(method, "/patients", reqBody)
    req.Header.Set("Content-Type", "application/json")
    r.ServeHTTP(w, req)
    return w
}

func performPatientRequestWithID(handler gin.HandlerFunc, method string, id int, body interface{}) *httptest.ResponseRecorder {
    gin.SetMode(gin.TestMode)
    r := gin.New()
    url := fmt.Sprintf("/patients/%d", id)
    r.GET("/patients/:id", handler)

    var reqBody *bytes.Buffer
    if body != nil {
        jsonBody, _ := json.Marshal(body)
        reqBody = bytes.NewBuffer(jsonBody)
    } else {
        reqBody = &bytes.Buffer{}
    }
    w := httptest.NewRecorder()
    req, _ := http.NewRequest(method, url, reqBody)
    req.Header.Set("Content-Type", "application/json")
    r.ServeHTTP(w, req)
    return w
}
