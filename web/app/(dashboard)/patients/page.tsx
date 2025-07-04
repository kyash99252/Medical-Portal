"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PatientTable } from "@/components/patients/patient-table"
import { Plus, Search } from "lucide-react"

interface Patient {
  id: string
  name: string
  age: number
  phone_number: string
  email: string
  diagnosis: string
  created_at: string
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:8080/api/v1/patients", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log(data)
        setPatients(data)
      } else {
        // Mock data for demo
        setPatients([
          {
            id: "1",
            name: "John Smith",
            age: 45,
            phone_number: "+1-555-0123",
            email: "john.smith@email.com",
            diagnosis: "Hypertension, Type 2 Diabetes",
            created_at: "2024-01-15T10:30:00Z",
          },
          {
            id: "2",
            name: "Sarah Johnson",
            age: 32,
            phone_number: "+1-555-0124",
            email: "sarah.j@email.com",
            diagnosis: "Migraine, Anxiety",
            created_at: "2024-01-14T14:20:00Z",
          },
          {
            id: "3",
            name: "Michael Brown",
            age: 28,
            phone_number: "+1-555-0125",
            email: "mike.brown@email.com",
            diagnosis: "Asthma",
            created_at: "2024-01-13T09:15:00Z",
          },
        ])
      }
    } catch (error) {
      console.error("Failed to fetch patients:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone_number.includes(searchTerm) ||
      patient.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Patients</h1>
          <p className="text-slate-600 mt-2">Manage patient records and information</p>
        </div>
        <Button onClick={() => router.push("/patients/new")} className="btn-gradient">
          <Plus className="mr-2 h-4 w-4" />
          New Patient
        </Button>
      </div>

      <div className="flex items-center space-x-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-200 focus:border-teal-400"
          />
        </div>
      </div>

      <PatientTable patients={filteredPatients} loading={loading} onRefresh={fetchPatients} />
    </div>
  )
}
