"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function NewPatientPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const patientData = {
      name: formData.get("name") as string,
      age: Number.parseInt(formData.get("age") as string),
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      address: formData.get("address") as string,
      bloodType: formData.get("bloodType") as string,
      emergencyContact: formData.get("emergencyContact") as string,
      allergies: formData.get("allergies") as string,
      diagnosis: formData.get("diagnosis") as string,
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:8080/api/v1/patients", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patientData),
      })

      if (response.ok) {
        const newPatient = await response.json()
        toast({
          title: "Patient created",
          description: "New patient has been successfully registered.",
        })
        router.push(`/patients/${newPatient.id}`)
      } else {
        throw new Error("Failed to create patient")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create patient. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" onClick={() => router.push("/patients")} className="border-gray-200">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Patients
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">New Patient</h1>
          <p className="text-slate-600">Register a new patient in the system</p>
        </div>
      </div>

      <Card className="border-gray-200">
        <CardHeader className="bg-gradient-to-r from-teal-50 to-emerald-50 border-b border-gray-200">
          <CardTitle className="text-lg font-semibold text-slate-800">Patient Information</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  className="mt-1 border-gray-200 focus:border-teal-400"
                  placeholder="Enter patient's full name"
                />
              </div>
              <div>
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  required
                  min="0"
                  max="150"
                  className="mt-1 border-gray-200 focus:border-teal-400"
                  placeholder="Enter age"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  className="mt-1 border-gray-200 focus:border-teal-400"
                  placeholder="+1-555-0123"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  className="mt-1 border-gray-200 focus:border-teal-400"
                  placeholder="patient@email.com"
                />
              </div>
              <div>
                <Label htmlFor="bloodType">Blood Type</Label>
                <Input
                  id="bloodType"
                  name="bloodType"
                  className="mt-1 border-gray-200 focus:border-teal-400"
                  placeholder="e.g., O+, A-, B+, AB-"
                />
              </div>
              <div>
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  name="emergencyContact"
                  className="mt-1 border-gray-200 focus:border-teal-400"
                  placeholder="Name - Phone Number"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                className="mt-1 border-gray-200 focus:border-teal-400"
                placeholder="Enter complete address"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="allergies">Known Allergies</Label>
              <Textarea
                id="allergies"
                name="allergies"
                className="mt-1 border-gray-200 focus:border-teal-400"
                placeholder="List any known allergies"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="diagnosis">Initial Diagnosis/Notes</Label>
              <Textarea
                id="diagnosis"
                name="diagnosis"
                className="mt-1 border-gray-200 focus:border-teal-400"
                placeholder="Enter initial diagnosis or medical notes"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/patients")}
                className="border-gray-200"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="btn-gradient">
                {loading ? (
                  <>
                    <Save className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Patient
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
