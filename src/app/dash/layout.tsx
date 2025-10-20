'use client'

import { useRouter, usePathname } from 'next/navigation'
import {
  GraduationCap,
  User,
  Calendar,
  ShoppingBag,
  LogOut,
  Home,
  Brain,
  BookOpen,
  Moon,
  Sun,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import clsx from 'clsx'
import { useEffect, useState } from 'react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [darkMode, setDarkMode] = useState(false)

  // Load dark mode from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    if (newMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const handleLogout = () => {
    router.push('/auth')
  }

  const navItems = [
    { name: 'Home', icon: Home, path: '/dash' },
    { name: 'Quiz', icon: User, path: '/dash/quiz' },
    { name: 'Add Quiz', icon: Calendar, path: '/dash/add-quizz' },
    { name: 'AI Summary', icon: Brain, path: '/dash/ai-summary' },
    { name: 'Courses', icon: BookOpen, path: '/dash/courses' },
    // { name: 'Store', icon: ShoppingBag, path: '/dash/store' },
  ]

  // Find current page title
  const currentPage = navItems.find((item) => item.path === pathname)?.name || 'Dashboard'

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 transition-all duration-300">
      {/* Sidebar (Desktop) */}
      <aside className="hidden max-h-screen sticky top-0 md:flex flex-col w-64 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border-r border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center space-x-3 mb-10">
          <div className="w-10 h-10 bg-gradient-to-r from-teal-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Smart Campus</h1>
        </div>

        <nav className="flex flex-col space-y-2 flex-grow">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.path
            return (
              <button
                key={item.name}
                onClick={() => router.push(item.path)}
                className={clsx(
                  'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-all',
                  active
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-blue-100/40 dark:hover:bg-slate-800'
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </button>
            )
          })}
        </nav>

        <Button
          variant="destructive"
          onClick={handleLogout}
          className="mt-auto bg-red-600 hover:bg-red-700 text-white"
        >
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <div className="w-full sticky top-0 z-10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex justify-between items-center shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">{currentPage}</h2>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              )}
            </button>

            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center text-white text-sm font-semibold">
              U
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-4 md:p-8 animate-fade-in">{children}</div>

        {/* Bottom navigation (Mobile) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 flex justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.path
            return (
              <button
                key={item.name}
                onClick={() => router.push(item.path)}
                className={clsx(
                  'flex flex-col items-center justify-center text-xs transition-all',
                  active ? 'text-blue-600' : 'text-slate-600 dark:text-slate-400'
                )}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span>{item.name}</span>
              </button>
            )
          })}
        </nav>
      </main>
    </div>
  )
}