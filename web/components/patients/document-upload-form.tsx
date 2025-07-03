"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { uploadDocument } from "@/lib/api"

interface DocumentUploadFormProps {
  patientId: number
  onSuccess: () => void
}

export function DocumentUploadForm({ patientId, onSuccess }: DocumentUploadFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      await uploadDocument(patientId, file)

      clearInterval(progressInterval)
      setUploadProgress(100)

      setTimeout(() => {
        onSuccess()
      }, 500)
    } catch (error) {
      console.error("Failed to upload document:", error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="file">Select Document</Label>
        <Input id="file" type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" required />
        <p className="text-xs text-slate-600">Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)</p>
      </div>

      {file && (
        <div className="p-3 bg-slate-50 rounded-lg">
          <p className="text-sm font-medium">{file.name}</p>
          <p className="text-xs text-slate-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      )}

      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} />
        </div>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="submit" disabled={!file || isUploading} className="bg-teal-500 hover:bg-teal-600">
          {isUploading ? "Uploading..." : "Upload Document"}
        </Button>
      </div>
    </form>
  )
}
