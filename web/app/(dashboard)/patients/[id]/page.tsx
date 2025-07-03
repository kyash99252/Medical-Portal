"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { PatientDetails } from "@/components/patients/patient-details"
import { PatientDocuments } from "@/components/patients/patient-documents"
import { PatientPrescriptions } from "@/components/patients/patient-prescriptions"
import { ArrowLeft, Printer } from "lucide-react"
import { useRouter } from "next/navigation"

interface Patient {
  id: string
  name: string
  age: number
  phone: string
  email: string
  address: string
  diagnosis: string
  allergies: string
  emergencyContact: string
  bloodType: string
  createdAt: string
}

export default function PatientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)

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
          phone: "+1-555-0123",
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
    } finally {
      setLoading(false)
    }
  }

  const handlePrintRecord = () => {
    window.print()
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
        <p className="text-slate-600">Patient not found</p>
        <Button onClick={() => router.push("/patients")} variant="outline" className="mt-4">
          Back to Patients
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.push("/patients")} className="border-gray-200">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">{patient.name}</h1>
            <p className="text-slate-600">Patient ID: {patient.id}</p>
          </div>
        </div>
        <Button
          onClick={handlePrintRecord}
          variant="outline"
          className="no-print border-gray-200 hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50 bg-transparent"
        >
          <Printer className="mr-2 h-4 w-4" />
          Print Record
        </Button>
      </div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100">
          <TabsTrigger
            value="details"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-400 data-[state=active]:to-emerald-500 data-[state=active]:text-white"
          >
            Details
          </TabsTrigger>
          <TabsTrigger
            value="documents"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-400 data-[state=active]:to-emerald-500 data-[state=active]:text-white"
          >
            Documents
          </TabsTrigger>
          <TabsTrigger
            value="prescriptions"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-400 data-[state=active]:to-emerald-500 data-[state=active]:text-white"
          >
            Prescriptions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <PatientDetails patient={patient} />
        </TabsContent>

        <TabsContent value="documents">
          <PatientDocuments patientId={patient.id} />
        </TabsContent>

        <TabsContent value="prescriptions">
          <PatientPrescriptions patientId={patient.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
