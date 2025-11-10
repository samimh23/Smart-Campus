'use client'

import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { LogOut, BarChart3, BookOpen, FileText, Users, GraduationCap, Menu, X } from "lucide-react"

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")

    if (!token || role !== "TEACHER") {
      router.push("/")
      return
    }

    const storedEmail = localStorage.getItem("email")
    setEmail(storedEmail || "")
    setIsLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    localStorage.removeItem("email")
    localStorage.removeItem("userId")
    router.push("/")
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  const handleNavigation = (path: string) => {
    router.push(path)
    closeSidebar()
  }

  const getCurrentPage = () => {
    if (pathname === '/teacher/dashboard') return 'dashboard'
    if (pathname === '/teacher/homework') return 'homework'
    if (pathname === '/teacher/submissions') return 'submissions'
    if (pathname === '/teacher/classes') return 'classes'
    if (pathname === '/teacher/settings') return 'settings'
    return 'dashboard'
  }

  const currentPage = getCurrentPage()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a855f7]"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#0a0e1a]">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 rounded-lg text-white hover:bg-slate-700 transition-colors"
        aria-label="Toggle menu"
      >
        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar - Hidden on mobile, slide-in when open, always visible on desktop */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-[#0a0e1a] flex flex-col overflow-hidden border-r border-slate-800
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">Teacher Portal</h2>
          <p className="text-sm text-[#a855f7] mt-1">Learning Management</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => handleNavigation("/teacher/dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              currentPage === 'dashboard' 
                ? 'bg-gradient-to-r from-[#FF6B35]/30 to-[#f97316]/20 border-l-3 border-[#FF6B35] text-white' 
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </button>

          <button
            onClick={() => handleNavigation("/teacher/homework")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              currentPage === 'homework' 
                ? 'bg-gradient-to-r from-[#FF6B35]/30 to-[#f97316]/20 border-l-3 border-[#FF6B35] text-white' 
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="font-medium">Devoirs</span>
          </button>

          <button
            onClick={() => handleNavigation("/teacher/submissions")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              currentPage === 'submissions' 
                ? 'bg-gradient-to-r from-[#FF6B35]/30 to-[#f97316]/20 border-l-3 border-[#FF6B35] text-white' 
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="font-medium">Soumissions</span>
          </button>

          <button
            onClick={() => handleNavigation("/teacher/classes")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              currentPage === 'classes' 
                ? 'bg-gradient-to-r from-[#FF6B35]/30 to-[#f97316]/20 border-l-3 border-[#FF6B35] text-white' 
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">Classes</span>
          </button>

          <button
            onClick={() => handleNavigation("/teacher/settings")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              currentPage === 'settings' 
                ? 'bg-gradient-to-r from-[#FF6B35]/30 to-[#f97316]/20 border-l-3 border-[#FF6B35] text-white' 
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <GraduationCap className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#a855f7]/15 to-[#FF6B35]/10 rounded-lg mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#a855f7] to-[#FF6B35] flex items-center justify-center text-white font-semibold">
              {email.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{email || "Teacher"}</p>
              <p className="text-xs text-[#a855f7]">Enseignant</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="destructive" className="w-full">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto w-full lg:w-auto">
        {/* Mobile Top Bar - Shows page title on mobile */}
        <div className="lg:hidden sticky top-0 z-20 bg-[#0a0e1a]/95 backdrop-blur-sm border-b border-slate-800 px-16 py-4">
          <h1 className="text-lg font-semibold text-white capitalize">
            {currentPage === 'dashboard' ? 'Dashboard' : 
             currentPage === 'homework' ? 'Devoirs' :
             currentPage === 'submissions' ? 'Soumissions' :
             currentPage === 'classes' ? 'Classes' :
             currentPage === 'settings' ? 'Settings' : 'Teacher Portal'}
          </h1>
        </div>
        {children}
      </main>

      {/* Bottom Navigation Bar (Mobile) - Quick access to main pages */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-[#0a0e1a]/95 backdrop-blur-sm border-t border-slate-800 pb-safe">
        <div className="flex justify-around items-center px-2 py-2">
          <button
            onClick={() => handleNavigation("/teacher/dashboard")}
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all ${
              currentPage === 'dashboard' ? 'text-[#FF6B35]' : 'text-slate-400'
            }`}
          >
            <BarChart3 className="w-5 h-5 mb-1" />
            <span className="text-xs">Dashboard</span>
          </button>

          <button
            onClick={() => handleNavigation("/teacher/homework")}
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all ${
              currentPage === 'homework' ? 'text-[#FF6B35]' : 'text-slate-400'
            }`}
          >
            <BookOpen className="w-5 h-5 mb-1" />
            <span className="text-xs">Devoirs</span>
          </button>

          <button
            onClick={() => handleNavigation("/teacher/submissions")}
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all ${
              currentPage === 'submissions' ? 'text-[#FF6B35]' : 'text-slate-400'
            }`}
          >
            <FileText className="w-5 h-5 mb-1" />
            <span className="text-xs">Soumissions</span>
          </button>

          <button
            onClick={() => handleNavigation("/teacher/classes")}
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all ${
              currentPage === 'classes' ? 'text-[#FF6B35]' : 'text-slate-400'
            }`}
          >
            <Users className="w-5 h-5 mb-1" />
            <span className="text-xs">Classes</span>
          </button>
        </div>
      </nav>
    </div>
  )
}