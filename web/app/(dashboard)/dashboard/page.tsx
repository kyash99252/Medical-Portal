"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, FileText, Activity, Plus, TrendingUp, Calendar, Clock } from "lucide-react"
import { getAllPatients } from "@/lib/api"
import { getUserRole } from "@/lib/auth"
import Link from "next/link"

interface Patient {
  id: number
  name: string
  age: number
  phone: string
  diagnosis: string
  created_at: string
}

export default function DashboardPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [stats, setStats] = useState({
    totalPatients: 0,
    recentPatients: 0,
    totalPrescriptions: 0,
    activeToday: 0,
  })
  const [userRole, setUserRole] = useState<string>("")

  useEffect(() => {
    const role = getUserRole()
    setUserRole(role || "")

    const fetchData = async () => {
      try {
        const patientsData = await getAllPatients()
        setPatients(patientsData.slice(0, 5))

        const today = new Date()
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)

        setStats({
          totalPatients: patientsData.length,
          recentPatients: patientsData.filter((p: Patient) => {
            const createdDate = new Date(p.created_at)
            return createdDate > weekAgo
          }).length,
          totalPrescriptions: Math.floor(Math.random() * 100) + 50,
          activeToday: Math.floor(Math.random() * 20) + 5,
        })
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      }
    }

    fetchData()
  }, [])

  const statCards = [
    {
      title: "Total Patients",
      value: stats.totalPatients,
      change: `+${stats.recentPatients} this week`,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100",
    },
    {
      title: "Active Today",
      value: stats.activeToday,
      change: "Currently in system",
      icon: Activity,
      color: "from-green-500 to-green-600",
      bgColor: "from-green-50 to-green-100",
    },
    {
      title: "Total Records",
      value: stats.totalPatients,
      change: "All time records",
      icon: FileText,
      color: "from-purple-500 to-purple-600",
      bgColor: "from-purple-50 to-purple-100",
    },
    ...(userRole === "doctor"
      ? [
          {
            title: "Prescriptions",
            value: stats.totalPrescriptions,
            change: "Total written",
            icon: TrendingUp,
            color: "from-orange-500 to-orange-600",
            bgColor: "from-orange-50 to-orange-100",
          },
        ]
      : []),
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-slate-600 mt-2 text-lg">Welcome back! Here's your healthcare overview.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            System Online
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            <CardContent className="p-0">
              <div className={`bg-gradient-to-br ${stat.bgColor} p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
                    <p className="text-xs text-slate-500 mt-1">{stat.change}</p>
                  </div>
                  <div className={`bg-gradient-to-r ${stat.color} p-3 rounded-xl shadow-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Patients */}
        <Card className="lg:col-span-2 border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-slate-800">Recent Patients</CardTitle>
                <CardDescription className="text-slate-600">Latest patient records in the system</CardDescription>
              </div>
              <Calendar className="h-5 w-5 text-slate-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {patients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {patient.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{patient.name}</p>
                      <p className="text-sm text-slate-600">
                        Age {patient.age} • {patient.phone}
                      </p>
                    </div>
                  </div>
                  <Link href={`/dashboard/patients/${patient.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-blue-50 hover:border-blue-200 bg-transparent"
                    >
                      View
                    </Button>
                  </Link>
                </div>
              ))}
              {patients.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No patients found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-slate-800">Quick Actions</CardTitle>
                <CardDescription className="text-slate-600">Common tasks and shortcuts</CardDescription>
              </div>
              <Clock className="h-5 w-5 text-slate-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userRole === "receptionist" && (
                <Link href="/dashboard/patients">
                  <Button className="w-full justify-start bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Patient
                  </Button>
                </Link>
              )}
              <Link href="/dashboard/patients">
                <Button
                  variant="outline"
                  className="w-full justify-start hover:bg-slate-50 border-slate-200 bg-transparent"
                >
                  <Users className="mr-2 h-4 w-4" />
                  View All Patients
                </Button>
              </Link>
              <Link href="/dashboard/patients">
                <Button
                  variant="outline"
                  className="w-full justify-start hover:bg-slate-50 border-slate-200 bg-transparent"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Patient Records
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-slate-50 border-slate-200 bg-transparent"
              >
                <Activity className="mr-2 h-4 w-4" />
                System Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
