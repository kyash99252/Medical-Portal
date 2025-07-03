const API_BASE_URL = "http://localhost:8080/api/v1"

// Get auth token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem("auth_token")
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Auth API
export const login = async (username: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  })

  if (!response.ok) {
    throw new Error("Login failed")
  }

  return response.json()
}

// Patient API
export const getAllPatients = async () => {
  const response = await fetch(`${API_BASE_URL}/patients`, {
    headers: getAuthHeader(),
  })

  if (!response.ok) {
    throw new Error("Failed to fetch patients")
  }

  return response.json()
}

export const getPatientById = async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
    headers: getAuthHeader(),
  })

  if (!response.ok) {
    throw new Error("Failed to fetch patient")
  }

  return response.json()
}

export const createPatient = async (data: any) => {
  const response = await fetch(`${API_BASE_URL}/patients`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error("Failed to create patient")
  }

  return response.json()
}

export const updatePatient = async (id: number, data: any) => {
  const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error("Failed to update patient")
  }

  return response.json()
}

export const updatePatientMedical = async (id: number, data: any) => {
  const response = await fetch(`${API_BASE_URL}/patients/${id}/medical`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error("Failed to update patient medical info")
  }

  return response.json()
}

export const deletePatient = async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
    method: "DELETE",
    headers: getAuthHeader(),
  })

  if (!response.ok) {
    throw new Error("Failed to delete patient")
  }

  return response.json()
}

// Prescription API
export const getPatientPrescriptions = async (patientId: number) => {
  const response = await fetch(`${API_BASE_URL}/patients/${patientId}/prescriptions`, {
    headers: getAuthHeader(),
  })

  if (!response.ok) {
    throw new Error("Failed to fetch prescriptions")
  }

  return response.json()
}

export const createPrescription = async (patientId: number, data: any) => {
  const response = await fetch(`${API_BASE_URL}/patients/${patientId}/prescriptions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error("Failed to create prescription")
  }

  return response.json()
}

// Document API
export const getPatientDocuments = async (patientId: number) => {
  const response = await fetch(`${API_BASE_URL}/patients/${patientId}/documents`, {
    headers: getAuthHeader(),
  })

  if (!response.ok) {
    throw new Error("Failed to fetch documents")
  }

  return response.json()
}

export const uploadDocument = async (patientId: number, file: File) => {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch(`${API_BASE_URL}/patients/${patientId}/documents`, {
    method: "POST",
    headers: getAuthHeader(),
    body: formData,
  })

  if (!response.ok) {
    throw new Error("Failed to upload document")
  }

  return response.json()
}

export const deleteDocument = async (documentId: number) => {
  const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
    method: "DELETE",
    headers: getAuthHeader(),
  })

  if (!response.ok) {
    throw new Error("Failed to delete document")
  }

  return response.json()
}
