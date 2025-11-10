'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Users, Calendar, LogOut, Plus, Star, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { Homework, HomeworkSubmission, Grade } from '@/types/homework'
import { homeworkAPI } from '@/lib/homework-api'
import { submissionAPI } from '@/lib/submission-api'
import { useNotifications } from '@/hooks/use-notifications'
import { NotificationToast } from '@/components/notifications/NotificationToast'

export default function TeacherDashboard() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [userId, setUserId] = useState<string>('')
  const [recentHomeworks, setRecentHomeworks] = useState<Homework[]>([])
  const [allHomeworks, setAllHomeworks] = useState<Homework[]>([])
  const [allSubmissions, setAllSubmissions] = useState<HomeworkSubmission[]>([])
  const [allGrades, setAllGrades] = useState<Grade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Notifications
  const { notifications, removeNotification } = useNotifications(userId, 'TEACHER')

  useEffect(() => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')
    const storedUserId = localStorage.getItem('userId')

    if (!token || role !== 'TEACHER') {
      router.push('/') // redirect to login if not teacher
    } else {
      const storedEmail = localStorage.getItem('email')
      setEmail(storedEmail || '')
      setUserId(storedUserId || '')
      loadDashboardData()
    }
  }, [router])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      const homeworks = await homeworkAPI.getMyHomework()
      setAllHomeworks(homeworks) // Tous les devoirs pour les statistiques
      setRecentHomeworks(homeworks.slice(0, 3)) // Afficher les 3 derniers devoirs
      
      // Charger les soumissions et notes pour tous les devoirs
      const submissionsPromises = homeworks.map(hw => 
        submissionAPI.getHomeworkSubmissions(hw.id).catch(() => [])
      )
      const allSubmissionsData = await Promise.all(submissionsPromises)
      setAllSubmissions(allSubmissionsData.flat())
      
      // Charger les notes créées par l'enseignant
      const gradesData = await submissionAPI.getTeacherGrades()
      setAllGrades(gradesData)
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('email')
    router.push('/')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Statistiques pour l'enseignant
  const getTotalSubmissions = () => {
    return allSubmissions.length
  }

  const getSubmittedCount = () => {
    return allSubmissions.filter(s => s.is_submitted).length
  }

  const getPendingGradingCount = () => {
    return allSubmissions.filter(s => s.is_submitted).length - allGrades.length
  }

  const getGradedCount = () => {
    return allGrades.length
  }

  const getAverageGrade = () => {
    if (allGrades.length === 0) return 0
    return allGrades.reduce((sum, grade) => sum + grade.grade, 0) / allGrades.length
  }

  const getActiveHomeworks = () => {
    return allHomeworks.filter(h => h.is_active).length
  }

  const getUpcomingDeadlines = () => {
    return allHomeworks.filter(h => new Date(h.deadline) > new Date()).length
  }

  const getOverdueHomeworks = () => {
    return allHomeworks.filter(h => new Date(h.deadline) < new Date()).length
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-6 pb-20 lg:pb-6">
        {/* Header */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-[#a855f7] to-[#FF6B35] rounded-xl shadow-lg flex-shrink-0">
                <BookOpen className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-white truncate">Dashboard Enseignant</h1>
                <p className="text-sm sm:text-base text-slate-400 truncate">Bienvenue, {email || 'Enseignant'}!</p>
              </div>
            </div>
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600 w-full sm:w-auto justify-center"
            >
              <LogOut className="h-4 w-4" />
              <span>Déconnexion</span>
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card 
            className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-[#14b8a6] to-[#0d9488] active:scale-95 sm:hover:scale-105 group shadow-lg shadow-teal-500/20" 
            onClick={() => router.push('/teacher/homework')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-semibold text-white">Gestion des devoirs</CardTitle>
              <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors backdrop-blur-sm flex-shrink-0">
                <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-white">{allHomeworks.length}</div>
              <p className="text-xs sm:text-sm text-teal-100">
                Devoirs créés
              </p>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-[#FF6B35] to-[#f97316] active:scale-95 sm:hover:scale-105 group shadow-lg shadow-orange-500/20" 
            onClick={() => router.push('/teacher/submissions')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-semibold text-white">Notation</CardTitle>
              <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors backdrop-blur-sm flex-shrink-0">
                <Star className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-white">{getPendingGradingCount()}</div>
              <p className="text-xs sm:text-sm text-orange-100">
                À noter
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-[#3b82f6] to-[#2563eb] active:scale-95 sm:hover:scale-105 group shadow-lg shadow-blue-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-semibold text-white">Étudiants</CardTitle>
              <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors backdrop-blur-sm flex-shrink-0">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-white">{getTotalSubmissions()}</div>
              <p className="text-xs sm:text-sm text-blue-100">
                Soumissions reçues
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-[#a855f7] to-[#9333ea] active:scale-95 sm:hover:scale-105 group shadow-lg shadow-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-semibold text-white">Calendrier</CardTitle>
              <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors backdrop-blur-sm flex-shrink-0">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-white">{getUpcomingDeadlines()}</div>
              <p className="text-xs sm:text-sm text-purple-100">
                Devoirs à venir
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Homeworks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="border border-slate-800 shadow-lg bg-slate-900/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-slate-800/50 border-b border-slate-700 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="p-2 sm:p-2.5 bg-gradient-to-br from-[#14b8a6] to-[#3b82f6] rounded-lg flex-shrink-0">
                    <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <CardTitle className="text-white text-base sm:text-lg font-semibold">Derniers devoirs</CardTitle>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => router.push('/teacher/homework')}
                  className="flex items-center gap-2 text-slate-300 hover:text-white hover:bg-slate-700/50 w-full sm:w-auto justify-center"
                >
                  <Plus className="h-4 w-4" />
                  <span>Nouveau</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#a855f7]"></div>
                </div>
              ) : recentHomeworks.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Aucun devoir créé</p>
                  <Button 
                    variant="outline" 
                    className="mt-4 border-slate-700 text-slate-300 hover:bg-slate-800"
                    onClick={() => router.push('/teacher/homework')}
                  >
                    Créer votre premier devoir
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentHomeworks.map((homework) => (
                    <div key={homework.id} className="border border-slate-700/50 rounded-lg p-3 sm:p-4 hover:bg-slate-800/50 hover:border-[#14b8a6]/30 transition-all group cursor-pointer">
                      <h4 className="font-semibold text-white group-hover:text-[#14b8a6] transition-colors text-sm sm:text-base">{homework.title}</h4>
                      <p className="text-xs sm:text-sm text-slate-400 mt-1 line-clamp-2">{homework.description}</p>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mt-3">
                        <span className="text-xs text-slate-500 flex items-center">
                          <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">Échéance: {formatDate(homework.deadline)}</span>
                        </span>
                        {homework.subject && (
                          <span className="text-xs bg-[#14b8a6]/20 text-[#14b8a6] px-3 py-1 rounded-full font-medium border border-[#14b8a6]/30 w-fit">
                            {homework.subject}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button 
                    variant="ghost" 
                    className="w-full text-slate-400 hover:text-white hover:bg-slate-800/50 mt-2"
                    onClick={() => router.push('/teacher/homework')}
                  >
                    Voir tous les devoirs →
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border border-slate-800 shadow-lg bg-slate-900/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-slate-800/50 border-b border-slate-700 p-4 sm:p-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-2 sm:p-2.5 bg-gradient-to-br from-[#a855f7] to-[#FF6B35] rounded-lg flex-shrink-0">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <CardTitle className="text-white text-base sm:text-lg font-semibold">Statistiques</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-[#14b8a6]/30 transition-colors">
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                    <div className="p-1.5 sm:p-2 bg-[#14b8a6]/10 rounded-lg flex-shrink-0">
                      <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-[#14b8a6]" />
                    </div>
                    <span className="text-slate-300 font-medium text-xs sm:text-sm truncate">Total des devoirs</span>
                  </div>
                  <span className="text-lg sm:text-xl font-bold text-[#14b8a6] ml-2">{allHomeworks.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-blue-400/30 transition-colors">
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                    <div className="p-1.5 sm:p-2 bg-blue-500/10 rounded-lg flex-shrink-0">
                      <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
                    </div>
                    <span className="text-slate-300 font-medium text-xs sm:text-sm truncate">Soumissions reçues</span>
                  </div>
                  <span className="text-lg sm:text-xl font-bold text-blue-400 ml-2">{getTotalSubmissions()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-green-400/30 transition-colors">
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                    <div className="p-1.5 sm:p-2 bg-green-500/10 rounded-lg flex-shrink-0">
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
                    </div>
                    <span className="text-slate-300 font-medium text-xs sm:text-sm truncate">Soumissions notées</span>
                  </div>
                  <span className="text-lg sm:text-xl font-bold text-green-400 ml-2">{getGradedCount()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-yellow-400/30 transition-colors">
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                    <div className="p-1.5 sm:p-2 bg-yellow-500/10 rounded-lg flex-shrink-0">
                      <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
                    </div>
                    <span className="text-slate-300 font-medium text-xs sm:text-sm truncate">Moyenne des notes</span>
                  </div>
                  <span className="text-lg sm:text-xl font-bold text-yellow-400 ml-2">
                    {getAverageGrade().toFixed(1)}/20
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-red-400/30 transition-colors">
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                    <div className="p-1.5 sm:p-2 bg-red-500/10 rounded-lg flex-shrink-0">
                      <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-400" />
                    </div>
                    <span className="text-slate-300 font-medium text-xs sm:text-sm truncate">Devoirs expirés</span>
                  </div>
                  <span className="text-lg sm:text-xl font-bold text-red-400 ml-2">{getOverdueHomeworks()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Notifications */}
      {notifications.map((notification, index) => (
        <NotificationToast
          key={`${notification.timestamp}-${index}`}
          notification={notification}
          onClose={() => removeNotification(index)}
        />
      ))}
    </div>
  )
}
