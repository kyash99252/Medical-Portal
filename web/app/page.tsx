import { redirect } from "next/navigation"

export default function RootPage() {
  // In a real app, you'd check if user is authenticated here
  // For now, redirect to login
  redirect("/login")
}
