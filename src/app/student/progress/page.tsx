'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Settings } from 'lucide-react'
import Link from 'next/link'
import ProgressDashboard from '@/components/ProgressDashboard'
import { OfflineIndicator } from '@/components/OfflineIndicator'

export default function ProgressPage() {
  return (
    <>
      <OfflineIndicator />
      <div className="min-h-full bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] bg-[size:50px_50px]" />
      
      <div className="relative max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              Learning Progress
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">Track your programming journey and achievements</p>
          </div>
          
          <Link href="/dash/tutor">
            <Button variant="outline" className="h-9 sm:h-10 px-3 sm:px-4 border-2 hover:bg-indigo-50 dark:hover:bg-indigo-950 dark:border-slate-600 dark:text-slate-200 transition-colors w-full sm:w-auto">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="text-sm sm:text-base">Back to AI Tutor</span>
            </Button>
          </Link>
        </div>

        {/* Progress Dashboard */}
        <ProgressDashboard />
      </div>
    </div>
    </>
  )
}
