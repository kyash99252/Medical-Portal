"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function UploadDocumentPage() {
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedPatient, setSelectedPatient] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      })
      return
    }

    if (!selectedPatient) {
      toast({
        title: "No patient selected",
        description: "Please select a patient for this document.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      const formData = new FormData()
      formData.append("document", selectedFile)
    //   formData.append("patientId", selectedPatient)

      const response = await fetch(`http://localhost:8080/api/v1/patients/${selectedPatient}/documents`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        toast({
          title: "Document uploaded",
          description: "The document has been successfully uploaded.",
        })
        router.push(`/patients/${selectedPatient}?tab=documents`)
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
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")} className="border-gray-200">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Upload Document</h1>
          <p className="text-slate-600">Upload a new document to a patient's record</p>
        </div>
      </div>

      <Card className="border-gray-200 max-w-2xl">
        <CardHeader className="bg-gradient-to-r from-teal-50 to-emerald-50 border-b border-gray-200">
          <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Document Upload
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="patient">Select Patient *</Label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient} required>
                <SelectTrigger className="mt-1 border-gray-200 focus:border-teal-400">
                  <SelectValue placeholder="Choose a patient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">John Smith</SelectItem>
                  <SelectItem value="2">Sarah Johnson</SelectItem>
                  <SelectItem value="3">Michael Brown</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="file">Select File *</Label>
              <Input
                id="file"
                name="file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileChange}
                required
                className="mt-1 border-gray-200 focus:border-teal-400"
              />
              <p className="text-sm text-slate-500 mt-1">Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)</p>
            </div>

            {selectedFile && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-medium text-slate-800 mb-2">Selected File:</h4>
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-teal-600" />
                  <div>
                    <p className="font-medium text-slate-800">{selectedFile.name}</p>
                    <p className="text-sm text-slate-500">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard")}
                className="border-gray-200"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !selectedFile || !selectedPatient} className="btn-gradient">
                {loading ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Document
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
