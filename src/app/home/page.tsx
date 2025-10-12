'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, LogOut, User, Calendar, ShoppingBag } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()

  const handleLogout = () => {
    // Here you could clear tokens or user data if needed
    router.push('/auth')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 p-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-10">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-teal-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Smart Campus</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">Welcome to your dashboard</p>
          </div>
        </div>

        <Button
          variant="destructive"
          className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </Button>
      </header>

      {/* Main Content */}
      <main className="grid md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-all cursor-pointer">
          <CardHeader className="flex items-center space-x-2">
            <User className="w-6 h-6 text-teal-600" />
            <CardTitle className="text-lg">My Profile</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-600 dark:text-slate-400">
            View and edit your personal details, preferences, and academic info.
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all cursor-pointer">
          <CardHeader className="flex items-center space-x-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            <CardTitle className="text-lg">Schedule</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-600 dark:text-slate-400">
            Check upcoming classes, exams, and important campus events.
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all cursor-pointer">
          <CardHeader className="flex items-center space-x-2">
            <ShoppingBag className="w-6 h-6 text-pink-600" />
            <CardTitle className="text-lg">Campus Store</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-600 dark:text-slate-400">
            Explore books, materials, and merchandise available at your university.
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
