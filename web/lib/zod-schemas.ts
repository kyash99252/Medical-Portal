import { z } from "zod"

export const patientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  age: z.number().min(0, "Age must be a positive number").max(150, "Age must be realistic"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
})

export const medicalFormSchema = z.object({
  diagnosis: z.string().min(2, "Diagnosis must be at least 2 characters"),
  notes: z.string().optional(),
})

export const prescriptionSchema = z.object({
  medication: z.string().min(2, "Medication name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  notes: z.string().optional(),
})

export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export type PatientFormData = z.infer<typeof patientSchema>
export type MedicalFormData = z.infer<typeof medicalFormSchema>
export type PrescriptionFormData = z.infer<typeof prescriptionSchema>
export type LoginFormData = z.infer<typeof loginSchema>
