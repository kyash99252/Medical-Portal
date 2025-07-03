"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"
import { getUserRole, isAuthenticated } from "@/lib/auth"

interface AuthContextType {
  isAuthenticated: boolean
  userRole: string | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userRole: null,
  isLoading: true,
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuth, setIsAuth] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated()
      const role = getUserRole()

      setIsAuth(authenticated)
      setUserRole(role)
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: isAuth,
        userRole,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
