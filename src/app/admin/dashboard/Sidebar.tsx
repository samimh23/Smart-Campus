"use client"

import { Button } from "@/components/ui/button"
import { LogOut, BarChart3, GraduationCap, Users, BookOpen, UserPlus, Settings } from "lucide-react"

type View = "overview" | "teachers" | "students" | "classes" | "add-user" | "settings"

interface SidebarProps {
  currentView: View
  onViewChange: (view: View) => void
  sidebarOpen: boolean
  email: string
  handleLogout: () => void
}

export default function Sidebar({ currentView, onViewChange, sidebarOpen, email, handleLogout }: SidebarProps) {
  return (
    <aside
      className={`${sidebarOpen ? "w-64" : "w-0"} transition-all duration-300 sidebar-bg flex flex-col overflow-hidden border-r border-slate-800`}
    >
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white">Admin Portal</h2>
        <p className="text-sm text-[#a855f7] mt-1">Learning Management</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <button
          onClick={() => onViewChange("overview")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            currentView === "overview" ? "sidebar-accent-active text-white" : "text-slate-300 hover:bg-white/10"
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="font-medium">Overview</span>
        </button>

        <button
          onClick={() => onViewChange("teachers")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            currentView === "teachers" ? "sidebar-accent-active text-white" : "text-slate-300 hover:bg-white/10"
          }`}
        >
          <GraduationCap className="w-5 h-5" />
          <span className="font-medium">Teachers</span>
        </button>

        <button
          onClick={() => onViewChange("students")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            currentView === "students" ? "sidebar-accent-active text-white" : "text-slate-300 hover:bg-white/10"
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="font-medium">Students</span>
        </button>

        <button
          onClick={() => onViewChange("classes")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            currentView === "classes" ? "sidebar-accent-active text-white" : "text-slate-300 hover:bg-white/10"
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="font-medium">Classes</span>
        </button>

        <button
          onClick={() => onViewChange("add-user")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            currentView === "add-user" ? "sidebar-accent-active text-white" : "text-slate-300 hover:bg-white/10"
          }`}
        >
          <UserPlus className="w-5 h-5" />
          <span className="font-medium">Add User</span>
        </button>

        <button
          onClick={() => onViewChange("settings")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            currentView === "settings" ? "sidebar-accent-active text-white" : "text-slate-300 hover:bg-white/10"
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </button>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-4 py-3 sidebar-accent-bg rounded-lg mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#a855f7] to-[#FF6B35] flex items-center justify-center text-white font-semibold">
            {email.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{email || "Admin"}</p>
            <p className="text-xs text-[#a855f7]">Administrator</p>
          </div>
        </div>
        <Button onClick={handleLogout} variant="destructive" className="w-full">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      <style jsx>{`
        .sidebar-bg {
          background: #0a0e1a;
        }
        .sidebar-accent-bg {
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(255, 107, 53, 0.1) 100%);
        }
        .sidebar-accent-active {
          background: linear-gradient(135deg, rgba(255, 107, 53, 0.3) 0%, rgba(249, 115, 22, 0.2) 100%);
          border-left: 3px solid #FF6B35;
        }
      `}</style>
    </aside>
  )
}