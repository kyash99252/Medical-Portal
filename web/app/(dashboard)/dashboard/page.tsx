"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, Pill, Calendar } from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  totalPatients: number
  todayAppointments: number
  pendingDocuments: number
  activePrescriptions: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayAppointments: 0,
    pendingDocuments: 0,
    activePrescriptions: 0,
  })

  useEffect(() => {
    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("http://localhost:8080/api/v1/dashboard/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error)
        // Set mock data for demo
        setStats({
          totalPatients: 3,
          todayAppointments: 0,
          pendingDocuments: 2,
          activePrescriptions: 1,
        })
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: "Total Patients",
      value: stats.totalPatients,
      description: "Registered in system",
      icon: Users,
      gradient: "from-blue-400 to-blue-600",
    },
    {
      title: "Today's Appointments",
      value: stats.todayAppointments,
      description: "Scheduled for today",
      icon: Calendar,
      gradient: "from-teal-400 to-emerald-500",
    },
    {
      title: "Pending Documents",
      value: stats.pendingDocuments,
      description: "Awaiting review",
      icon: FileText,
      gradient: "from-purple-400 to-purple-600",
    },
    {
      title: "Active Prescriptions",
      value: stats.activePrescriptions,
      description: "Currently prescribed",
      icon: Pill,
      gradient: "from-green-400 to-green-600",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-600 mt-2">Welcome to your medical portal overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <Card key={index} className="border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">{card.title}</CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-r ${card.gradient}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-800">{card.value}</div>
                <p className="text-xs text-slate-500 mt-1">{card.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Recent Activity</CardTitle>
            <CardDescription>Latest system activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "New patient registered", time: "2 minutes ago", type: "patient" },
                { action: "Prescription added", time: "15 minutes ago", type: "prescription" },
                { action: "Document uploaded", time: "1 hour ago", type: "document" },
                { action: "Patient record updated", time: "2 hours ago", type: "patient" },
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activity.type === "patient"
                        ? "bg-blue-500"
                        : activity.type === "prescription"
                          ? "bg-green-500"
                          : "bg-purple-500"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{activity.action}</p>
                    <p className="text-xs text-slate-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/patients/new">
                <div className="p-4 rounded-lg border border-gray-200 hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50 hover:border-teal-200 transition-all duration-200 text-left cursor-pointer">
                  <Users className="h-5 w-5 text-teal-600 mb-2" />
                  <p className="text-sm font-medium text-slate-800">Add Patient</p>
                </div>
              </Link>
              <Link href="/patients">
                <div className="p-4 rounded-lg border border-gray-200 hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50 hover:border-teal-200 transition-all duration-200 text-left cursor-pointer">
                  <FileText className="h-5 w-5 text-teal-600 mb-2" />
                  <p className="text-sm font-medium text-slate-800">View Patients</p>
                </div>
              </Link>
              <Link href="/documents/upload">
                <div className="p-4 rounded-lg border border-gray-200 hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50 hover:border-teal-200 transition-all duration-200 text-left cursor-pointer">
                  <FileText className="h-5 w-5 text-teal-600 mb-2" />
                  <p className="text-sm font-medium text-slate-800">Upload Document</p>
                </div>
              </Link>
              <Link href="/settings">
                <div className="p-4 rounded-lg border border-gray-200 hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50 hover:border-teal-200 transition-all duration-200 text-left cursor-pointer">
                  <Calendar className="h-5 w-5 text-teal-600 mb-2" />
                  <p className="text-sm font-medium text-slate-800">Settings</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
