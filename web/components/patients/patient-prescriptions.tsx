"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Pill, Plus, Printer, Trash2, Calendar, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Prescription {
  id: string
  medication: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
  prescribedBy: string
  prescribedAt: string
  status: "active" | "completed" | "discontinued"
}

interface PatientPrescriptionsProps {
  patientId: string
}

export function PatientPrescriptions({ patientId }: PatientPrescriptionsProps) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchPrescriptions()
  }, [patientId])

  const fetchPrescriptions = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:8080/api/v1/patients/${patientId}/prescriptions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPrescriptions(data)
      } else {
        // Mock data for demo
        setPrescriptions([
          {
            id: "1",
            medication: "Lisinopril",
            dosage: "10mg",
            frequency: "Once daily",
            duration: "30 days",
            instructions: "Take with food in the morning",
            prescribedBy: "Dr. Smith",
            prescribedAt: "2024-01-15T10:30:00Z",
            status: "active",
          },
          {
            id: "2",
            medication: "Metformin",
            dosage: "500mg",
            frequency: "Twice daily",
            duration: "90 days",
            instructions: "Take with meals, morning and evening",
            prescribedBy: "Dr. Smith",
            prescribedAt: "2024-01-14T14:20:00Z",
            status: "active",
          },
          {
            id: "3",
            medication: "Ibuprofen",
            dosage: "400mg",
            frequency: "As needed",
            duration: "7 days",
            instructions: "For pain relief, do not exceed 3 times daily",
            prescribedBy: "Dr. Johnson",
            prescribedAt: "2024-01-10T16:45:00Z",
            status: "completed",
          },
        ])
      }
    } catch (error) {
      console.error("Failed to fetch prescriptions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPrescription = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    const prescriptionData = {
      medication: formData.get("medication") as string,
      dosage: formData.get("dosage") as string,
      frequency: formData.get("frequency") as string,
      duration: formData.get("duration") as string,
      instructions: formData.get("instructions") as string,
    }

    setSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:8080/api/v1/patients/${patientId}/prescriptions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(prescriptionData),
      })

      if (response.ok) {
        toast({
          title: "Prescription added",
          description: "The prescription has been successfully added.",
        })
        setAddDialogOpen(false)
        fetchPrescriptions()
      } else {
        throw new Error("Failed to add prescription")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add prescription. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeletePrescription = async (prescriptionId: string) => {
    if (!confirm("Are you sure you want to delete this prescription?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:8080/api/v1/prescriptions/${prescriptionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast({
          title: "Prescription deleted",
          description: "The prescription has been successfully deleted.",
        })
        fetchPrescriptions()
      } else {
        throw new Error("Delete failed")
      }
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete prescription. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handlePrintPrescription = (prescription: Prescription) => {
    // Create a new window with prescription details for printing
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Prescription - ${prescription.medication}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
              .prescription-details { margin: 20px 0; }
              .field { margin: 10px 0; }
              .label { font-weight: bold; }
              .footer { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Medical Portal</h1>
              <h2>Prescription</h2>
            </div>
            <div class="prescription-details">
              <div class="field"><span class="label">Medication:</span> ${prescription.medication}</div>
              <div class="field"><span class="label">Dosage:</span> ${prescription.dosage}</div>
              <div class="field"><span class="label">Frequency:</span> ${prescription.frequency}</div>
              <div class="field"><span class="label">Duration:</span> ${prescription.duration}</div>
              <div class="field"><span class="label">Instructions:</span> ${prescription.instructions}</div>
              <div class="field"><span class="label">Prescribed by:</span> ${prescription.prescribedBy}</div>
              <div class="field"><span class="label">Date:</span> ${new Date(prescription.prescribedAt).toLocaleDateString()}</div>
            </div>
            <div class="footer">
              <p>This prescription was generated electronically.</p>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "discontinued":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Prescriptions</h2>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-gradient">
              <Plus className="mr-2 h-4 w-4" />
              Add Prescription
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Prescription</DialogTitle>
              <DialogDescription>Enter the prescription details for this patient.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddPrescription} className="space-y-4">
              <div>
                <Label htmlFor="medication">Medication</Label>
                <Input id="medication" name="medication" placeholder="e.g., Lisinopril" required className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dosage">Dosage</Label>
                  <Input id="dosage" name="dosage" placeholder="e.g., 10mg" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Input id="frequency" name="frequency" placeholder="e.g., Once daily" required className="mt-1" />
                </div>
              </div>
              <div>
                <Label htmlFor="duration">Duration</Label>
                <Input id="duration" name="duration" placeholder="e.g., 30 days" required className="mt-1" />
              </div>
              <div>
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  name="instructions"
                  placeholder="Special instructions for the patient..."
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="btn-gradient">
                  {submitting ? "Adding..." : "Add Prescription"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
          </CardContent>
        </Card>
      ) : prescriptions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Pill className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-800 mb-2">No prescriptions</h3>
            <p className="text-slate-600 mb-4">Add the first prescription for this patient.</p>
            <Button onClick={() => setAddDialogOpen(true)} className="btn-gradient">
              <Plus className="mr-2 h-4 w-4" />
              Add Prescription
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {prescriptions.map((prescription) => (
            <Card key={prescription.id} className="border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-teal-400 to-emerald-500 rounded-lg">
                      <Pill className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-slate-800">{prescription.medication}</CardTitle>
                      <p className="text-sm text-slate-600">
                        {prescription.dosage} • {prescription.frequency}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(prescription.status)}`}
                    >
                      {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePrintPrescription(prescription)}
                      className="border-gray-200 hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50"
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePrescription(prescription.id)}
                      className="border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="h-4 w-4 text-slate-500" />
                      <span className="text-slate-600">Duration: {prescription.duration}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <span className="text-slate-600">Prescribed: {formatDate(prescription.prescribedAt)}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">
                      <span className="font-medium">Prescribed by:</span> {prescription.prescribedBy}
                    </p>
                  </div>
                </div>
                {prescription.instructions && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-slate-700">
                      <span className="font-medium">Instructions:</span> {prescription.instructions}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
