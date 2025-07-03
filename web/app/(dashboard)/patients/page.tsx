"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { FilePlus } from "lucide-react"
import { PatientTable } from "@/components/patients/patient-table"
import { PatientForm } from "@/components/patients/patient-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { getAllPatients } from "@/lib/api"
import { getUserRole } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

export interface Patient {
  id: number
  name: string
  age: number
  phone: string
  address: string
  diagnosis: string
  notes: string
  created_at: string
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [userRole, setUserRole] = useState<string>("")
  const { toast } = useToast()

  useEffect(() => {
    const role = getUserRole()
    setUserRole(role || "")
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      setIsLoading(true)
      const data = await getAllPatients()
      setPatients(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch patients",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePatientCreated = () => {
    setIsCreateDialogOpen(false)
    fetchPatients()
    toast({
      title: "Success",
      description: "Patient created successfully",
    })
  }

  const handlePatientUpdated = () => {
    fetchPatients()
    toast({
      title: "Success",
      description: "Patient updated successfully",
    })
  }

  const handlePatientDeleted = () => {
    fetchPatients()
    toast({
      title: "Success",
      description: "Patient deleted successfully",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Patient Records
          </h1>
          <p className="text-slate-600 mt-2 text-lg">Manage and view all patient information</p>
        </div>

        {userRole === "receptionist" && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                <FilePlus className="mr-2 h-4 w-4" />
                New Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">Create New Patient</DialogTitle>
              </DialogHeader>
              <PatientForm onSuccess={handlePatientCreated} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <PatientTable
        patients={patients}
        isLoading={isLoading}
        onPatientUpdated={handlePatientUpdated}
        onPatientDeleted={handlePatientDeleted}
      />
    </div>
  )
}
