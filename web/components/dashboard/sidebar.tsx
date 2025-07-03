"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Stethoscope, LayoutDashboard, Users, Settings, LogOut, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SidebarProps {
  user: any
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ user, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Patients", href: "/patients", icon: Users },
    { name: "Settings", href: "/settings", icon: Settings },
  ]

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
    router.push("/login")
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:inset-0
      `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-teal-400 to-emerald-500">
            <div className="flex items-center space-x-3">
              <Stethoscope className="h-8 w-8 text-white" />
              <div>
                <h1 className="text-xl font-bold text-white">Medical Portal</h1>
                <p className="text-sm text-teal-50">Healthcare System</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden text-white hover:bg-white/20">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User info */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">{user?.name?.charAt(0) || "U"}</span>
              </div>
              <div>
                <p className="font-medium text-slate-800">{user?.name || "User"}</p>
                <p className="text-sm text-slate-500 capitalize">{user?.role || "Staff"}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`
                        flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                        ${
                          isActive
                            ? "bg-gradient-to-r from-teal-400 to-emerald-500 text-white shadow-md"
                            : "text-slate-600 hover:bg-gray-100 hover:text-slate-800"
                        }
                      `}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-6 border-t border-gray-200">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full justify-start border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 bg-transparent"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
