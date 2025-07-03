"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MoreHorizontal, Eye, Edit, Trash2, Search, Users } from "lucide-react"
import type { Patient } from "@/app/(dashboard)/patients/page"
import { PatientForm } from "./patient-form"
import { getUserRole } from "@/lib/auth"
import { deletePatient } from "@/lib/api"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PatientTableProps {
  patients: Patient[]
  isLoading: boolean
  onPatientUpdated: () => void
  onPatientDeleted: () => void
}

export function PatientTable({ patients, isLoading, onPatientUpdated, onPatientDeleted }: PatientTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const userRole = getUserRole()

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm) ||
      patient.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (patient: Patient) => {
    setDeletingPatient(patient)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingPatient) return

    try {
      await deletePatient(deletingPatient.id)
      onPatientDeleted()
      setIsDeleteDialogOpen(false)
      setDeletingPatient(null)
    } catch (error) {
      console.error("Failed to delete patient:", error)
    }
  }

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false)
    setEditingPatient(null)
    onPatientUpdated()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-2 text-slate-600">Loading patients...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex items-center justify-between">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white border-slate-200 focus:border-blue-300 focus:ring-blue-200"
          />
        </div>
        <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
          {filteredPatients.length} patients
        </Badge>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="font-semibold text-slate-700">Patient ID</TableHead>
              <TableHead className="font-semibold text-slate-700">Full Name</TableHead>
              <TableHead className="font-semibold text-slate-700">Age</TableHead>
              <TableHead className="font-semibold text-slate-700">Phone Number</TableHead>
              <TableHead className="font-semibold text-slate-700">Diagnosis</TableHead>
              <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.map((patient, index) => (
              <TableRow key={patient.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-25 hover:bg-slate-50"}>
                <TableCell className="font-medium text-blue-600">#{patient.id}</TableCell>
                <TableCell className="font-medium">{patient.name}</TableCell>
                <TableCell>{patient.age}</TableCell>
                <TableCell>{patient.phone}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {patient.diagnosis ? (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {patient.diagnosis}
                    </Badge>
                  ) : (
                    <span className="text-slate-400">No diagnosis</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/patients/${patient.id}`} className="cursor-pointer">
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      {userRole === "receptionist" && (
                        <>
                          <DropdownMenuItem onClick={() => handleEdit(patient)} className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Patient
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(patient)}
                            className="cursor-pointer text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Patient
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredPatients.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg font-medium">
              {searchTerm ? "No patients found matching your search." : "No patients found."}
            </p>
            <p className="text-slate-500 text-sm mt-1">
              {searchTerm ? "Try adjusting your search terms." : "Add your first patient to get started."}
            </p>
          </div>
        )}
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Patient</DialogTitle>
          </DialogHeader>
          {editingPatient && <PatientForm patient={editingPatient} onSuccess={handleEditSuccess} />}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the patient record for {deletingPatient?.name}{" "}
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
