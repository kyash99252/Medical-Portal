"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FileText, Upload, Download, Printer, Trash2, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Document {
  id: string
  name: string
  type: string
  size: number
  uploadedAt: string
  uploadedBy: string
}

interface PatientDocumentsProps {
  patientId: string
}

export function PatientDocuments({ patientId }: PatientDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchDocuments()
  }, [patientId])

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:8080/api/v1/patients/${patientId}/documents`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setDocuments(data)
      } else {
        // Mock data for demo
        setDocuments([
          {
            id: "1",
            name: "Blood Test Results - Jan 2024.pdf",
            type: "application/pdf",
            size: 245760,
            uploadedAt: "2024-01-15T10:30:00Z",
            uploadedBy: "Dr. Smith",
          },
          {
            id: "2",
            name: "X-Ray Chest.jpg",
            type: "image/jpeg",
            size: 1048576,
            uploadedAt: "2024-01-14T14:20:00Z",
            uploadedBy: "Nurse Johnson",
          },
          {
            id: "3",
            name: "Insurance Card.pdf",
            type: "application/pdf",
            size: 102400,
            uploadedAt: "2024-01-13T09:15:00Z",
            uploadedBy: "Reception",
          },
        ])
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const file = formData.get("file") as File

    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    try {
      const token = localStorage.getItem("token")
      const uploadFormData = new FormData()
      uploadFormData.append("file", file)

      const response = await fetch(`http://localhost:8080/api/v1/patients/${patientId}/documents`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadFormData,
      })

      if (response.ok) {
        toast({
          title: "Document uploaded",
          description: "The document has been successfully uploaded.",
        })
        setUploadDialogOpen(false)
        fetchDocuments()
      } else {
        throw new Error("Upload failed")
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (documentId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:8080/api/v1/documents/${documentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast({
          title: "Document deleted",
          description: "The document has been successfully deleted.",
        })
        fetchDocuments()
      } else {
        throw new Error("Delete failed")
      }
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete document. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handlePrint = (document: Document) => {
    // In a real app, this would open the document in a new window for printing
    window.open(`/api/documents/${document.id}/print`, "_blank")
  }

  const handleDownload = (document: Document) => {
    // In a real app, this would trigger a download
    const link = document.createElement("a")
    link.href = `/api/documents/${document.id}/download`
    link.download = document.name
    link.click()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return "📄"
    if (type.includes("image")) return "🖼️"
    if (type.includes("word")) return "📝"
    return "📁"
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Documents</h2>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-gradient">
              <Plus className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload New Document</DialogTitle>
              <DialogDescription>Select a file to upload to this patient's record.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <Label htmlFor="file">Select File</Label>
                <Input
                  id="file"
                  name="file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  required
                  className="mt-1"
                />
                <p className="text-sm text-slate-500 mt-1">Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)</p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setUploadDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading} className="btn-gradient">
                  {uploading ? (
                    <>
                      <Upload className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload
                    </>
                  )}
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
      ) : documents.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-800 mb-2">No documents uploaded</h3>
            <p className="text-slate-600 mb-4">Upload the first document for this patient.</p>
            <Button onClick={() => setUploadDialogOpen(true)} className="btn-gradient">
              <Plus className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {documents.map((document) => (
            <Card key={document.id} className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{getFileIcon(document.type)}</div>
                    <div>
                      <h3 className="font-medium text-slate-800">{document.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-slate-500 mt-1">
                        <span>{formatFileSize(document.size)}</span>
                        <span>•</span>
                        <span>Uploaded by {document.uploadedBy}</span>
                        <span>•</span>
                        <span>{formatDate(document.uploadedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePrint(document)}
                      className="border-gray-200 hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50"
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(document)}
                      className="border-gray-200"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(document.id)}
                      className="border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
