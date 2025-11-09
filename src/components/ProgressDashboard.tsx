'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Trophy, Target, Clock, TrendingUp, Award, Zap } from 'lucide-react'
import { apiClient } from '@/lib/api-client'

interface ProgressData {
  overview: {
    totalLessons: number
    totalExercises: number
    completedExercises: number
    successRate: number
    learningStreak: number
    totalTimeSpent: number
  }
  languageProgress: Record<string, {
    total: number
    completed: number
    progress: number
  }>
  achievements: Array<{
    id: string
    title: string
    description: string
    icon: string
    unlocked: boolean
  }>
}

export default function ProgressDashboard() {
  const [progress, setProgress] = useState<ProgressData | null>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        const [progressResponse, analyticsResponse] = await Promise.all([
          apiClient.getComprehensiveProgress(),
          apiClient.getLearningAnalytics('30d')
        ])
        
        if (progressResponse.data) setProgress(progressResponse.data)
        if (analyticsResponse.data) setAnalytics(analyticsResponse.data)
      } catch (error) {
        console.error('Error fetching progress data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProgressData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading progress data...</p>
        </div>
      </div>
    )
  }

  if (!progress) {
    return (
      <div className="text-center p-8">
        <p className="text-slate-600">No progress data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 text-white">
          <CardHeader className="pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Target className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Exercises</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
            <div className="text-2xl sm:text-3xl font-bold">{progress.overview.completedExercises}</div>
            <p className="text-xs sm:text-sm text-indigo-100">of {progress.overview.totalExercises} completed</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 text-white">
          <CardHeader className="pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Success</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
            <div className="text-2xl sm:text-3xl font-bold">{progress.overview.successRate}%</div>
            <p className="text-xs sm:text-sm text-green-100">Accuracy</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-600 dark:from-orange-600 dark:to-red-700 text-white">
          <CardHeader className="pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Streak</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
            <div className="text-2xl sm:text-3xl font-bold">{progress.overview.learningStreak}</div>
            <p className="text-xs sm:text-sm text-orange-100">Days in a row</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-cyan-600 dark:from-blue-600 dark:to-cyan-700 text-white">
          <CardHeader className="pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Time</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
            <div className="text-2xl sm:text-3xl font-bold">{progress.overview.totalTimeSpent}</div>
            <p className="text-xs sm:text-sm text-blue-100">Minutes</p>
          </CardContent>
        </Card>
      </div>

      {/* Language Progress */}
      <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center gap-3 text-lg sm:text-xl dark:text-white">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
              <Trophy className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="text-base sm:text-xl">Progress by Language</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="space-y-4">
            {Object.entries(progress.languageProgress).map(([language, data]) => (
              <div key={language} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs sm:text-sm font-medium dark:border-slate-600 dark:text-slate-200">
                      {language.toUpperCase()}
                    </Badge>
                    <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                      {data.completed}/{data.total} completed
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                    {data.progress}%
                  </span>
                </div>
                <Progress value={data.progress} className="h-2 dark:bg-slate-700" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      {progress.achievements.length > 0 && (
        <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex items-center gap-3 text-lg sm:text-xl dark:text-white">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <span className="text-base sm:text-xl">Achievements</span>
            </CardTitle>
            <CardDescription className="text-sm dark:text-slate-400">
              Unlock achievements by completing exercises and learning consistently
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {progress.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    achievement.unlocked
                      ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-800">{achievement.title}</h4>
                      <p className="text-sm text-slate-600">{achievement.description}</p>
                    </div>
                    {achievement.unlocked && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        Unlocked
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Learning Analytics */}
      {analytics && (
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              Learning Analytics (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800">{analytics.totalSubmissions}</div>
                <p className="text-sm text-slate-600">Total Submissions</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800">{analytics.correctSubmissions}</div>
                <p className="text-sm text-slate-600">Correct Answers</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800">{analytics.averageSessionTime} min</div>
                <p className="text-sm text-slate-600">Avg Session Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
