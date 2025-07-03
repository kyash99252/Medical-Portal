"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { medicalFormSchema, type MedicalFormData } from "@/lib/zod-schemas"
import { updatePatientMedical } from "@/lib/api"

interface Patient {
  id: number
  diagnosis: string
  notes: string
}

interface PatientMedicalFormProps {
  patient: Patient
  onSuccess: () => void
}

export function PatientMedicalForm({ patient, onSuccess }: PatientMedicalFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<MedicalFormData>({
    resolver: zodResolver(medicalFormSchema),
    defaultValues: {
      diagnosis: patient.diagnosis || "",
      notes: patient.notes || "",
    },
  })

  const onSubmit = async (data: MedicalFormData) => {
    setIsLoading(true)
    try {
      await updatePatientMedical(patient.id, data)
      onSuccess()
    } catch (error) {
      console.error("Failed to update medical details:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="diagnosis"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Diagnosis</FormLabel>
              <FormControl>
                <Input placeholder="Enter diagnosis" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Medical Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter medical notes and observations" className="min-h-[100px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="submit" disabled={isLoading} className="bg-teal-500 hover:bg-teal-600">
            {isLoading ? "Updating..." : "Update Medical Details"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
