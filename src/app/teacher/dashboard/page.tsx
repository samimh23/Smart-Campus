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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-slate-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-teal-600 rounded-xl">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Dashboard Enseignant</h1>
                <p className="text-slate-600">Bienvenue, {email || 'Enseignant'}!</p>
              </div>
            </div>
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              className="flex items-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card 
            className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-teal-50 to-teal-100 hover:from-teal-100 hover:to-teal-200 group" 
            onClick={() => router.push('/teacher/homework')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-teal-800">Gestion des devoirs</CardTitle>
              <div className="p-2 bg-teal-600 rounded-lg group-hover:bg-teal-700 transition-colors">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-900">{allHomeworks.length}</div>
              <p className="text-sm text-teal-700">
                Devoirs créés
              </p>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 group" 
            onClick={() => router.push('/teacher/submissions')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-orange-800">Notation</CardTitle>
              <div className="p-2 bg-orange-600 rounded-lg group-hover:bg-orange-700 transition-colors">
                <Star className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">{getPendingGradingCount()}</div>
              <p className="text-sm text-orange-700">
                À noter
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-blue-800">Étudiants</CardTitle>
              <div className="p-2 bg-blue-600 rounded-lg group-hover:bg-blue-700 transition-colors">
                <Users className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{getTotalSubmissions()}</div>
              <p className="text-sm text-blue-700">
                Soumissions reçues
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-purple-800">Calendrier</CardTitle>
              <div className="p-2 bg-purple-600 rounded-lg group-hover:bg-purple-700 transition-colors">
                <Calendar className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{getUpcomingDeadlines()}</div>
              <p className="text-sm text-purple-700">
                Devoirs à venir
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Homeworks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-teal-100 border-b border-teal-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-teal-600 rounded-lg">
                    <BookOpen className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-slate-800">Derniers devoirs</CardTitle>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/teacher/homework')}
                  className="flex items-center gap-2 border-teal-300 text-teal-700 hover:bg-teal-50"
                >
                  <Plus className="h-4 w-4" />
                  Nouveau
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : recentHomeworks.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun devoir créé</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => router.push('/teacher/homework')}
                  >
                    Créer votre premier devoir
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentHomeworks.map((homework) => (
                    <div key={homework.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors group">
                      <h4 className="font-semibold text-slate-800 group-hover:text-teal-700">{homework.title}</h4>
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">{homework.description}</p>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-xs text-slate-500 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Échéance: {formatDate(homework.deadline)}
                        </span>
                        {homework.subject && (
                          <span className="text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded-full font-medium">
                            {homework.subject}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    className="w-full border-teal-300 text-teal-700 hover:bg-teal-50"
                    onClick={() => router.push('/teacher/homework')}
                  >
                    Voir tous les devoirs
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-slate-800">Statistiques</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-teal-100 rounded-lg">
                      <BookOpen className="h-4 w-4 text-teal-600" />
                    </div>
                    <span className="text-slate-700 font-medium">Total des devoirs</span>
                  </div>
                  <span className="text-2xl font-bold text-teal-600">{allHomeworks.length}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-slate-700 font-medium">Soumissions reçues</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">{getTotalSubmissions()}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-slate-700 font-medium">Soumissions notées</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">{getGradedCount()}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Star className="h-4 w-4 text-yellow-600" />
                    </div>
                    <span className="text-slate-700 font-medium">Moyenne des notes</span>
                  </div>
                  <span className="text-2xl font-bold text-yellow-600">
                    {getAverageGrade().toFixed(1)}/20
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    </div>
                    <span className="text-slate-700 font-medium">Devoirs expirés</span>
                  </div>
                  <span className="text-2xl font-bold text-red-600">{getOverdueHomeworks()}</span>
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
