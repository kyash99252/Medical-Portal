"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Printer, Edit } from "lucide-react"
import { useRouter } from "next/navigation"

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

interface PatientDetailsProps {
  patient: Patient
}

export function PatientDetails({ patient }: PatientDetailsProps) {
  const router = useRouter()
  const handlePrint = () => {
    window.print()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const fields = [
    { label: "Full Name", value: patient.name },
    { label: "Age", value: `${patient.age} years` },
    { label: "Phone", value: patient.phone_number },
    { label: "Email", value: patient.email },
    { label: "Address", value: patient.address },
    { label: "Blood Type", value: patient.bloodType },
    { label: "Emergency Contact", value: patient.emergencyContact },
    { label: "Allergies", value: patient.allergies },
    { label: "Current Diagnosis", value: patient.diagnosis },
    { label: "Registration Date", value: formatDate(patient.createdAt) },
  ]

  return (
    <div className="space-y-6">
      {/* Print header - only visible when printing */}
      <div className="print-only hidden">
        <div className="print-header">Medical Portal - Patient Record</div>
        <div className="text-center mb-6">
          <p className="text-lg">Patient ID: {patient.id}</p>
          <p className="text-sm text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="flex justify-between items-center no-print">
        <h2 className="text-2xl font-bold text-slate-800">Patient Details</h2>
        <div className="flex space-x-2">
          <Button
            onClick={handlePrint}
            variant="outline"
            className="border-gray-200 hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50 bg-transparent"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print Details
          </Button>
          <Button onClick={() => router.push(`/patients/${patient.id}/edit`)} className="btn-gradient">
            <Edit className="mr-2 h-4 w-4" />
            Edit Patient
          </Button>
        </div>
      </div>

      <Card className="border-gray-200">
        <CardHeader className="bg-gradient-to-r from-teal-50 to-emerald-50 border-b border-gray-200">
          <CardTitle className="text-lg font-semibold text-slate-800">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map((field, index) => (
              <div key={index} className="print-field">
                <div className="print-label">
                  <label className="text-sm font-semibold text-slate-600 block mb-1">{field.label}</label>
                </div>
                <div className="print-value">
                  <p className="text-slate-800 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    {field.value || "Not specified"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200 print-section">
        <CardHeader className="bg-gradient-to-r from-teal-50 to-emerald-50 border-b border-gray-200">
          <CardTitle className="text-lg font-semibold text-slate-800">Medical Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-slate-700 mb-2">Current Conditions</h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-slate-800">{patient.diagnosis}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-700 mb-2">Known Allergies</h4>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-slate-800">{patient.allergies}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-700 mb-2">Blood Type</h4>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-slate-800 font-medium">{patient.bloodType}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
