"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, LogOut, User, Bell } from "lucide-react"
import { getUserRole, clearAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export function Header() {
  const [userRole, setUserRole] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    const role = getUserRole()
    setUserRole(role || "")
  }, [])

  const handleLogout = () => {
    clearAuth()
    router.push("/login")
  }

  const getInitials = (role: string) => {
    if (role === "doctor") return "DR"
    if (role === "receptionist") return "RC"
    return "U"
  }

  const getRoleDisplay = (role: string) => {
    if (role === "doctor") return "Doctor"
    if (role === "receptionist") return "Receptionist"
    return "User"
  }

  const getRoleBadgeColor = (role: string) => {
    if (role === "doctor") return "bg-blue-100 text-blue-700 border-blue-200"
    if (role === "receptionist") return "bg-purple-100 text-purple-700 border-purple-200"
    return "bg-slate-100 text-slate-700 border-slate-200"
  }

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search patients, records..."
              className="pl-10 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-300 focus:ring-blue-200 h-10"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5 text-slate-600" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 px-2 rounded-xl hover:bg-slate-50">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold">
                      {getInitials(userRole)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-slate-800">{getRoleDisplay(userRole)}</p>
                    <Badge variant="outline" className={cn("text-xs", getRoleBadgeColor(userRole))}>
                      {userRole}
                    </Badge>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-2">
                  <p className="text-sm font-medium leading-none">{getRoleDisplay(userRole)}</p>
                  <Badge variant="outline" className={cn("w-fit", getRoleBadgeColor(userRole))}>
                    {userRole}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
