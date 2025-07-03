"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { prescriptionSchema, type PrescriptionFormData } from "@/lib/zod-schemas"
import { createPrescription } from "@/lib/api"

interface PrescriptionFormProps {
  patientId: number
  onSuccess: () => void
}

export function PrescriptionForm({ patientId, onSuccess }: PrescriptionFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      medication: "",
      dosage: "",
      frequency: "",
      notes: "",
    },
  })

  const onSubmit = async (data: PrescriptionFormData) => {
    setIsLoading(true)
    try {
      await createPrescription(patientId, data)
      onSuccess()
    } catch (error) {
      console.error("Failed to create prescription:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="medication"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Medication</FormLabel>
              <FormControl>
                <Input placeholder="Enter medication name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dosage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dosage</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 500mg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="frequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Frequency</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Twice daily" {...field} />
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
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional instructions or notes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="submit" disabled={isLoading} className="bg-teal-500 hover:bg-teal-600">
            {isLoading ? "Adding..." : "Add Prescription"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
