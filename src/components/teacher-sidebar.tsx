"use client"

import { useRouter } from "next/navigation"
import { BookOpen, User, Settings, HelpCircle, LogOut, GraduationCap } from "lucide-react"

interface TeacherSidebarProps {
  email: string
  onLogout: () => void
}

export function TeacherSidebar({ email, onLogout }: TeacherSidebarProps) {
  const router = useRouter()

  const menuItems = [
    {
      label: "Profile",
      icon: User,
      action: () => router.push("/teacher/profile"),
    },
    {
      label: "Classes",
      icon: GraduationCap,
      action: () => router.push("/teacher/classes"),
    },
    {
      label: "Settings",
      icon: Settings,
      action: () => router.push("/teacher/settings"),
    },
    {
      label: "Help",
      icon: HelpCircle,
      action: () => router.push("/teacher/help"),
    },
  ]

  return (
    <aside className="w-64 bg-gradient-to-b from-teal-600 to-teal-700 text-white p-6 min-h-screen flex flex-col shadow-xl">
      {/* Logo/Brand */}
      <div className="flex items-center space-x-3 mb-8 pb-6 border-b border-teal-500">
        <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg">
          <BookOpen className="h-6 w-6 text-teal-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold">TeachHub</h2>
          <p className="text-xs text-teal-100 truncate">{email}</p>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="space-y-2 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.label}
              onClick={item.action}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-teal-500 transition-colors duration-200 text-left font-medium"
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Logout Button */}
      <button
        onClick={onLogout}
        className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-red-500 hover:bg-red-600 transition-colors duration-200 text-white font-medium"
      >
        <LogOut className="h-5 w-5" />
        <span>Logout</span>
      </button>
    </aside>
  )
}
