'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  BookOpen, 
  FileText, 
  Star, 
  Upload, 
  LogOut,
  Menu,
  X,
  GraduationCap,
  ClipboardList,
  FileCheck,
  Sparkles,
  TrendingUp,
  Lightbulb,
  Brain,
  Library,
  Dumbbell
} from 'lucide-react'

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('email')
    localStorage.removeItem('userId')
    router.push('/')
  }

  const navigation = [
    { name: 'Dashboard', href: '/student/dashboard', icon: BookOpen },
    { name: 'Cours', href: '/student/courses', icon: GraduationCap },
    { name: 'Devoirs', href: '/student/homework', icon: FileText },
    { name: 'Soumissions', href: '/student/submissions', icon: Upload },
    { name: 'Notes', href: '/student/grades', icon: Star },
    { name: 'Quiz', href: '/student/quiz', icon: ClipboardList },
    { name: 'Ajouter Quiz', href: '/student/add-quizz', icon: ClipboardList },
    { name: 'Examens', href: '/student/examen', icon: FileCheck },
    // Learn with AI Section
    { name: 'Generate Lesson', href: '/student/tutor', icon: Brain },
    { name: 'My Lessons', href: '/student/my-lessons', icon: Library },
    { name: 'My Exercises', href: '/student/my-exercises', icon: Dumbbell },
    { name: 'AI Explain', href: '/student/explain', icon: Lightbulb },
    { name: 'Progrès', href: '/student/progress', icon: TrendingUp },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#1a1f2e] shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#a855f7] rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">Étudiant</h1>
                <p className="text-sm text-slate-400">Portail</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    router.push(item.href)
                    setSidebarOpen(false)
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-colors duration-200
                    ${active 
                      ? 'bg-[#a855f7] text-white' 
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </button>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-700">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full flex items-center justify-center space-x-2 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              <span>Déconnexion</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="bg-[#1a1f2e] shadow-sm border-b border-slate-700 lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-700"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#a855f7] rounded-lg flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-white">Étudiant</span>
            </div>
          </div>
        </header>

        {/* Page content - Remove any extra padding/margin that causes empty space */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}