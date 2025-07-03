"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Edit, FileText, Pill, Upload, ExternalLink, Trash2 } from "lucide-react"
import { getPatientById, getPatientDocuments, getPatientPrescriptions } from "@/lib/api"
import { getUserRole } from "@/lib/auth"
import { PatientMedicalForm } from "@/components/patients/patient-medical-form"
import { PrescriptionForm } from "@/components/patients/prescription-form"
import { DocumentUploadForm } from "@/components/patients/document-upload-form"
import { useToast } from "@/hooks/use-toast"

interface Patient {
  id: number
  name: string
  age: number
  phone: string
  address: string
  diagnosis: string
  notes: string
  created_at: string
}

interface Document {
  id: number
  file_name: string
  mime_type: string
  file_url: string
  uploaded_at: string
}

interface Prescription {
  id: number
  medication: string
  dosage: string
  frequency: string
  notes: string
  created_at: string
}

export default function PatientDetailPage() {
  const params = useParams()
  const patientId = params.id as string
  const [patient, setPatient] = useState<Patient | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState<string>("")
  const { toast } = useToast()

  useEffect(() => {
    const role = getUserRole()
    setUserRole(role || "")
    fetchPatientData()
  }, [patientId])

  const fetchPatientData = async () => {
    try {
      setIsLoading(true)
      const [patientData, documentsData, prescriptionsData] = await Promise.all([
        getPatientById(Number.parseInt(patientId)),
        getPatientDocuments(Number.parseInt(patientId)),
        getPatientPrescriptions(Number.parseInt(patientId)),
      ])

      setPatient(patientData)
      setDocuments(documentsData)
      setPrescriptions(prescriptionsData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch patient data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-2 text-slate-600">Loading patient data...</p>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-slate-800">Patient Not Found</h2>
        <p className="text-slate-600 mt-2">The requested patient could not be found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">{patient.name}</h1>
          <p className="text-slate-600 mt-2">Patient ID: {patient.id}</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          Age {patient.age}
        </Badge>
      </div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Patient Details</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Patient Information</CardTitle>
                <CardDescription>Basic patient details and contact information</CardDescription>
              </div>
              {userRole === "doctor" && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Medical Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Medical Details</DialogTitle>
                    </DialogHeader>
                    <PatientMedicalForm
                      patient={patient}
                      onSuccess={() => {
                        fetchPatientData()
                        toast({
                          title: "Success",
                          description: "Medical details updated successfully",
                        })
                      }}
                    />
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Full Name</label>
                    <p className="text-slate-800 font-medium">{patient.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Age</label>
                    <p className="text-slate-800">{patient.age} years old</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Phone Number</label>
                    <p className="text-slate-800">{patient.phone}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Address</label>
                    <p className="text-slate-800">{patient.address}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Diagnosis</label>
                    <p className="text-slate-800">{patient.diagnosis || "No diagnosis recorded"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Medical Notes</label>
                    <p className="text-slate-800">{patient.notes || "No notes recorded"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Patient Documents</CardTitle>
                <CardDescription>Uploaded files and medical records</CardDescription>
              </div>
              {userRole === "receptionist" && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-teal-500 hover:bg-teal-600">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Document
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload New Document</DialogTitle>
                    </DialogHeader>
                    <DocumentUploadForm
                      patientId={Number.parseInt(patientId)}
                      onSuccess={() => {
                        fetchPatientData()
                        toast({
                          title: "Success",
                          description: "Document uploaded successfully",
                        })
                      }}
                    />
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              {documents.length > 0 ? (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-teal-500" />
                        <div>
                          <p className="font-medium">{doc.file_name}</p>
                          <p className="text-sm text-slate-600">
                            {doc.mime_type} • Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => window.open(doc.file_url, "_blank")}>
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        {userRole === "receptionist" && (
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-600 text-center py-8">No documents uploaded yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescriptions" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Prescriptions</CardTitle>
                <CardDescription>Medications prescribed to this patient</CardDescription>
              </div>
              {userRole === "doctor" && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-teal-500 hover:bg-teal-600">
                      <Pill className="mr-2 h-4 w-4" />
                      Add Prescription
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Prescription</DialogTitle>
                    </DialogHeader>
                    <PrescriptionForm
                      patientId={Number.parseInt(patientId)}
                      onSuccess={() => {
                        fetchPatientData()
                        toast({
                          title: "Success",
                          description: "Prescription added successfully",
                        })
                      }}
                    />
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              {prescriptions.length > 0 ? (
                <div className="grid gap-4">
                  {prescriptions.map((prescription) => (
                    <Card key={prescription.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <h4 className="font-semibold text-lg">{prescription.medication}</h4>
                            <div className="space-y-1">
                              <p className="text-sm">
                                <span className="font-medium">Dosage:</span> {prescription.dosage}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Frequency:</span> {prescription.frequency}
                              </p>
                              {prescription.notes && (
                                <p className="text-sm">
                                  <span className="font-medium">Notes:</span> {prescription.notes}
                                </p>
                              )}
                            </div>
                          </div>
                          <Badge variant="outline">{new Date(prescription.created_at).toLocaleDateString()}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-slate-600 text-center py-8">No prescriptions recorded yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
