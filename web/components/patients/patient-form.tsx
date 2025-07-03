"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { patientSchema, type PatientFormData } from "@/lib/zod-schemas"
import { createPatient, updatePatient } from "@/lib/api"
import type { Patient } from "@/app/(dashboard)/patients/page"

interface PatientFormProps {
  patient?: Patient
  onSuccess: () => void
}

export function PatientForm({ patient, onSuccess }: PatientFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!patient

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: patient?.name || "",
      age: patient?.age || 0,
      phone: patient?.phone || "",
      address: patient?.address || "",
    },
  })

  const onSubmit = async (data: PatientFormData) => {
    setIsLoading(true)
    try {
      if (isEditing) {
        await updatePatient(patient.id, data)
      } else {
        await createPatient(data)
      }
      onSuccess()
    } catch (error) {
      console.error("Failed to save patient:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter patient's full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="age"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Age</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter age"
                  {...field}
                  onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter phone number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Enter address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="submit" disabled={isLoading} className="bg-teal-500 hover:bg-teal-600">
            {isLoading ? "Saving..." : isEditing ? "Update Patient" : "Create Patient"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
