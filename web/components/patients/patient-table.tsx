"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MoreHorizontal, Eye, Edit, Trash2, Phone, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Patient {
  id: string
  name: string
  age: number
  phone: string
  email: string
  diagnosis: string
  createdAt: string
}

interface PatientTableProps {
  patients: Patient[]
  loading: boolean
  onRefresh: () => void
}

export function PatientTable({ patients, loading, onRefresh }: PatientTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleView = (patientId: string) => {
    router.push(`/patients/${patientId}`)
  }

  const handleEdit = (patientId: string) => {
    router.push(`/patients/${patientId}/edit`)
  }

  const handleDelete = async (patientId: string) => {
    if (!confirm("Are you sure you want to delete this patient?")) return

    setDeletingId(patientId)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:8080/api/v1/patients/${patientId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast({
          title: "Patient deleted",
          description: "Patient record has been successfully deleted.",
        })
        onRefresh()
      } else {
        throw new Error("Failed to delete patient")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete patient. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading patients...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (patients.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No patients found</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-slate-600 mb-4">No patients match your search criteria.</p>
            <Button onClick={() => router.push("/patients/new")} className="btn-gradient">
              Add First Patient
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-800">Patient Records ({patients.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-slate-700">Name</TableHead>
                <TableHead className="font-semibold text-slate-700">Age</TableHead>
                <TableHead className="font-semibold text-slate-700">Contact</TableHead>
                <TableHead className="font-semibold text-slate-700">Diagnosis</TableHead>
                <TableHead className="font-semibold text-slate-700">Registered</TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow
                  key={patient.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleView(patient.id)}
                >
                  <TableCell className="font-medium text-slate-800">{patient.name}</TableCell>
                  <TableCell className="text-slate-600">{patient.age} years</TableCell>
                  <TableCell className="text-slate-600">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1 text-sm">
                        <Phone className="h-3 w-3" />
                        <span>{patient.phone}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm">
                        <Mail className="h-3 w-3" />
                        <span>{patient.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600 max-w-xs">
                    <div className="truncate" title={patient.diagnosis}>
                      {patient.diagnosis}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">{formatDate(patient.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            handleView(patient.id)
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEdit(patient.id)
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Patient
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(patient.id)
                          }}
                          className="text-red-600 focus:text-red-600"
                          disabled={deletingId === patient.id}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {deletingId === patient.id ? "Deleting..." : "Delete"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
