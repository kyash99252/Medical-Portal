"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Patient {
  id: string
  name: string
  age: number
  phone_number: string
  email: string
  address: string
  diagnosis: string
  allergies: string
  emergencyContact: string
  bloodType: string
  createdAt: string
}

export default function EditPatientPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPatient()
  }, [params.id])

  const fetchPatient = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:8080/api/v1/patients/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPatient(data)
      } else {
        // Mock data for demo
        setPatient({
          id: params.id as string,
          name: "John Smith",
          age: 45,
          phone_number: "+1-555-0123",
          email: "john.smith@email.com",
          address: "123 Main St, Anytown, ST 12345",
          diagnosis: "Hypertension, Type 2 Diabetes",
          allergies: "Penicillin, Shellfish",
          emergencyContact: "Jane Smith - +1-555-0124",
          bloodType: "O+",
          createdAt: "2024-01-15T10:30:00Z",
        })
      }
    } catch (error) {
      console.error("Failed to fetch patient:", error)
      toast({
        title: "Error",
        description: "Failed to load patient data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)

    const formData = new FormData(event.currentTarget)
    const patientData = {
      name: formData.get("name") as string,
      age: Number.parseInt(formData.get("age") as string),
      phone_number: formData.get("phone") as string,
      email: formData.get("email") as string,
      address: formData.get("address") as string,
      bloodType: formData.get("bloodType") as string,
      emergencyContact: formData.get("emergencyContact") as string,
      allergies: formData.get("allergies") as string,
    }

    const diagnosis = formData.get("diagnosis") as string

    try {
      const token = localStorage.getItem("token")

      const response = await fetch(`http://localhost:8080/api/v1/patients/${params.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patientData),
      })

      if (!response.ok) throw new Error("Failed to update patient")

      // Then: Update diagnosis separately (PATCH)
      const medResponse = await fetch(`http://localhost:8080/api/v1/patients/${params.id}/medical`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ diagnosis, notes: "" }),
      })

      if (!medResponse.ok) throw new Error("Failed to update medical info")

      toast({
        title: "Patient updated",
        description: "Patient info and diagnosis updated successfully.",
      })

      router.push(`/patients/${params.id}`)
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Could not update all fields.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 mb-4">Patient not found</p>
        <Button onClick={() => router.push("/patients")} variant="outline" className="border-gray-200">
          Back to Patients
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/patients/${params.id}`)}
          className="border-gray-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Patient
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Edit Patient</h1>
          <p className="text-slate-600">Update patient information - {patient.name}</p>
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
                  defaultValue={patient.name}
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
                  defaultValue={patient.age}
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
                  defaultValue={patient.phone_number}
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
                  defaultValue={patient.email}
                  className="mt-1 border-gray-200 focus:border-teal-400"
                  placeholder="patient@email.com"
                />
              </div>
              <div>
                <Label htmlFor="bloodType">Blood Type</Label>
                <Input
                  id="bloodType"
                  name="bloodType"
                  defaultValue={patient.bloodType}
                  className="mt-1 border-gray-200 focus:border-teal-400"
                  placeholder="e.g., O+, A-, B+, AB-"
                />
              </div>
              <div>
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  name="emergencyContact"
                  defaultValue={patient.emergencyContact}
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
                defaultValue={patient.address}
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
                defaultValue={patient.allergies}
                className="mt-1 border-gray-200 focus:border-teal-400"
                placeholder="List any known allergies"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="diagnosis">Current Diagnosis/Notes</Label>
              <Textarea
                id="diagnosis"
                name="diagnosis"
                defaultValue={patient.diagnosis}
                className="mt-1 border-gray-200 focus:border-teal-400"
                placeholder="Enter current diagnosis or medical notes"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/patients/${params.id}`)}
                className="border-gray-200"
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="btn-gradient">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Patient History Summary */}
      <Card className="border-gray-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <CardTitle className="text-lg font-semibold text-slate-800">Patient Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium text-slate-700">Patient ID</p>
              <p className="text-slate-600">{patient.id}</p>
            </div>
            <div>
              <p className="font-medium text-slate-700">Registration Date</p>
              <p className="text-slate-600">
                {new Date(patient.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="font-medium text-slate-700">Last Updated</p>
              <p className="text-slate-600">Today</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}