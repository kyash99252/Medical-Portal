"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Stethoscope, Loader2 } from "lucide-react"
import { jwtDecode } from "jwt-decode"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("http://localhost:8080/api/v1/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      if (response.ok) {
        const data = await response.json()
        const decoded = jwtDecode(data.token)

        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(decoded))

        toast({
          title: "Login successful",
          description: `Welcome, ${decoded.user}`,
        })

        router.push("/dashboard")
      }
    } catch (error: any) {
      console.error("Caught error during login:", error)
      toast({
        title: "Connection error",
        description: error?.message ?? "Unable to connect to the server",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center bg-gradient-to-br from-teal-400 to-emerald-500 text-white rounded-t-lg">
          <div className="flex justify-center mb-2">
            <Stethoscope className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold">Medical Portal</CardTitle>
          <CardDescription className="text-teal-50">Receptionist & Doctor System</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="border-gray-200 focus:border-teal-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-gray-200 focus:border-teal-400"
              />
            </div>
            <Button type="submit" className="w-full btn-gradient" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
