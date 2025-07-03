"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { User, Bell, Shield, Database } from "lucide-react"

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleUpdateProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const profileData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:8080/api/v1/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        localStorage.setItem("user", JSON.stringify(updatedUser))
        setUser(updatedUser)

        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated.",
        })
      } else {
        throw new Error("Update failed")
      }
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const passwordData = {
      currentPassword: formData.get("currentPassword") as string,
      newPassword: formData.get("newPassword") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New passwords do not match.",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:8080/api/v1/change-password", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      if (response.ok) {
        toast({
          title: "Password changed",
          description: "Your password has been successfully changed.",
        })
        // Reset form
        ;(event.target as HTMLFormElement).reset()
      } else {
        throw new Error("Password change failed")
      }
    } catch (error) {
      toast({
        title: "Password change failed",
        description: "Failed to change password. Please check your current password.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-600 mt-2">Manage your account settings and preferences</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Settings */}
        <Card className="border-gray-200">
          <CardHeader className="bg-gradient-to-r from-teal-50 to-emerald-50 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-teal-600" />
              <CardTitle className="text-lg font-semibold text-slate-800">Profile Information</CardTitle>
            </div>
            <CardDescription>Update your personal information and contact details</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={user.name}
                    required
                    className="mt-1 border-gray-200 focus:border-teal-400"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={user.email}
                    required
                    className="mt-1 border-gray-200 focus:border-teal-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    defaultValue={user.phone}
                    className="mt-1 border-gray-200 focus:border-teal-400"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" value={user.role} disabled className="mt-1 bg-gray-100 text-gray-600" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={loading} className="btn-gradient">
                  {loading ? "Updating..." : "Update Profile"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="border-gray-200">
          <CardHeader className="bg-gradient-to-r from-teal-50 to-emerald-50 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-teal-600" />
              <CardTitle className="text-lg font-semibold text-slate-800">Security</CardTitle>
            </div>
            <CardDescription>Change your password and security settings</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  required
                  className="mt-1 border-gray-200 focus:border-teal-400"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    className="mt-1 border-gray-200 focus:border-teal-400"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className="mt-1 border-gray-200 focus:border-teal-400"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={loading} className="btn-gradient">
                  {loading ? "Changing..." : "Change Password"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="border-gray-200">
          <CardHeader className="bg-gradient-to-r from-teal-50 to-emerald-50 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-teal-600" />
              <CardTitle className="text-lg font-semibold text-slate-800">Notifications</CardTitle>
            </div>
            <CardDescription>Configure your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-slate-800">Email Notifications</h4>
                  <p className="text-sm text-slate-600">Receive notifications via email</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-slate-800">New Patient Alerts</h4>
                  <p className="text-sm text-slate-600">Get notified when new patients are registered</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-slate-800">Appointment Reminders</h4>
                  <p className="text-sm text-slate-600">Receive reminders for upcoming appointments</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-slate-800">System Updates</h4>
                  <p className="text-sm text-slate-600">Get notified about system maintenance and updates</p>
                </div>
                <Switch />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card className="border-gray-200">
          <CardHeader className="bg-gradient-to-r from-teal-50 to-emerald-50 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-teal-600" />
              <CardTitle className="text-lg font-semibold text-slate-800">System Information</CardTitle>
            </div>
            <CardDescription>View system details and statistics</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-slate-800 mb-2">Application Version</h4>
                <p className="text-slate-600">v2.1.0</p>
              </div>
              <div>
                <h4 className="font-medium text-slate-800 mb-2">Last Login</h4>
                <p className="text-slate-600">{new Date().toLocaleDateString()}</p>
              </div>
              <div>
                <h4 className="font-medium text-slate-800 mb-2">Account Created</h4>
                <p className="text-slate-600">January 15, 2024</p>
              </div>
              <div>
                <h4 className="font-medium text-slate-800 mb-2">Data Storage</h4>
                <p className="text-slate-600">2.3 GB used</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
