// JWT token management
export const setAuthToken = (token: string) => {
  localStorage.setItem("auth_token", token)
}

export const getAuthToken = () => {
  return localStorage.getItem("auth_token")
}

export const clearAuth = () => {
  localStorage.removeItem("auth_token")
  localStorage.removeItem("user_role")
}

// User role management
export const setUserRole = (role: string) => {
  localStorage.setItem("user_role", role)
}

export const getUserRole = () => {
  return localStorage.getItem("user_role")
}

// Decode JWT token (basic implementation)
export const decodeToken = (token: string) => {
  try {
    const payload = token.split(".")[1]
    const decoded = JSON.parse(atob(payload))
    return decoded
  } catch (error) {
    console.error("Failed to decode token:", error)
    return null
  }
}

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getAuthToken()
  if (!token) return false

  try {
    const decoded = decodeToken(token)
    if (!decoded) return false

    // Check if token is expired
    const currentTime = Date.now() / 1000
    return decoded.exp > currentTime
  } catch (error) {
    return false
  }
}
