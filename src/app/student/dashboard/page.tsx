'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Calendar, LogOut, AlertCircle, CheckCircle, Star, FileText, Bell } from 'lucide-react'
import { Homework, HomeworkSubmission, Grade } from '@/types/homework'
import { homeworkAPI } from '@/lib/homework-api'
import { submissionAPI } from '@/lib/submission-api'
import { useNotifications } from '@/hooks/use-notifications'
import { NotificationToast } from '@/components/notifications/NotificationToast'

export default function StudentDashboard() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [userId, setUserId] = useState<string>('')
  const [recentHomeworks, setRecentHomeworks] = useState<Homework[]>([])
  const [allHomeworks, setAllHomeworks] = useState<Homework[]>([])
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Notifications
  const { notifications, removeNotification, isConnected } = useNotifications(userId, 'STUDENT')
  const [localNotifications, setLocalNotifications] = useState<any[]>([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')
    const storedUserId = localStorage.getItem('userId')

    if (!token || role !== 'STUDENT') {
      router.push('/') // redirect to login if not student
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
      const [homeworksData, submissionsData, gradesData] = await Promise.all([
        homeworkAPI.getAllHomework(),
        submissionAPI.getMySubmissions(),
        submissionAPI.getMyGrades()
      ])
      setAllHomeworks(homeworksData) // Tous les devoirs pour les statistiques
      setRecentHomeworks(homeworksData.slice(0, 3)) // Afficher les 3 derniers devoirs
      setSubmissions(submissionsData)
      setGrades(gradesData)
      
      // Vérifier s'il y a de nouveaux devoirs depuis la dernière visite
      checkForNewHomeworks(homeworksData)
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkForNewHomeworks = (homeworks: Homework[]) => {
    const lastVisit = localStorage.getItem('lastVisit')
    const now = new Date().toISOString()
    
    if (lastVisit) {
      const newHomeworks = homeworks.filter(hw => 
        new Date(hw.created_at) > new Date(lastVisit)
      )
      
      if (newHomeworks.length > 0) {
        // Créer des notifications pour les nouveaux devoirs
        newHomeworks.forEach(homework => {
          const notification = {
            type: 'new_homework' as const,
            data: homework,
            message: `Nouveau devoir: ${homework.title}`,
            timestamp: new Date().toISOString(),
          }
          setLocalNotifications(prev => [notification, ...prev.slice(0, 4)])
        })
      }
    }
    
    // Mettre à jour la dernière visite
    localStorage.setItem('lastVisit', now)
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

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date()
  }

  const isDueSoon = (deadline: string) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diffInHours = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60)
    return diffInHours <= 24 && diffInHours > 0
  }

  const getUpcomingCount = () => {
    return allHomeworks.filter(h => new Date(h.deadline) > new Date()).length
  }

  const getOverdueCount = () => {
    return allHomeworks.filter(h => isOverdue(h.deadline)).length
  }

  // Statistiques des soumissions
  const getSubmissionsCount = () => {
    return submissions.length
  }

  const getSubmittedCount = () => {
    return submissions.filter(s => s.is_submitted).length
  }

  const getDraftCount = () => {
    return submissions.filter(s => !s.is_submitted).length
  }

  // Statistiques des notes
  const getGradesCount = () => {
    return grades.length
  }

  const getAverageGrade = () => {
    if (grades.length === 0) return 0
    return grades.reduce((sum, grade) => sum + grade.grade, 0) / grades.length
  }

  const getGoodGradesCount = () => {
    return grades.filter(g => g.grade >= 12).length
  }

  const getExcellentGradesCount = () => {
    return grades.filter(g => g.grade >= 16).length
  }

  // Test function to simulate a notification
  const testNotification = () => {
    const testNotification = {
      type: 'new_homework' as const,
      data: { title: 'Test Devoir', description: 'Ceci est un test' },
      message: 'Test notification',
      timestamp: new Date().toISOString(),
    }
    // Force add to local notifications
    setLocalNotifications(prev => [testNotification, ...prev.slice(0, 4)])
  }

  // Simuler la création d'un devoir par un enseignant
  const simulateNewHomework = () => {
    const newHomework = {
      id: Date.now(),
      title: 'Nouveau Devoir de Test',
      description: 'Ce devoir a été créé par un enseignant',
      subject: 'Mathématiques',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Dans 7 jours
      created_at: new Date().toISOString(),
      teacher: {
        first_name: 'Professeur',
        last_name: 'Test'
      }
    }
    
    const notification = {
      type: 'new_homework' as const,
      data: newHomework,
      message: `Nouveau devoir: ${newHomework.title}`,
      timestamp: new Date().toISOString(),
    }
    
    setLocalNotifications(prev => [notification, ...prev.slice(0, 4)])
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-slate-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Dashboard Étudiant</h1>
                <p className="text-slate-600">Bienvenue, {email || 'Étudiant'}!</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Connection Status */}
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                  {isConnected ? 'Connecté' : 'Déconnecté'}
                </span>
              </div>
              
              {/* Notification Bell */}
              {(notifications.length > 0 || localNotifications.length > 0) && (
                <div className="relative">
                  <Bell className="h-5 w-5 text-blue-600 animate-pulse" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {notifications.length + localNotifications.length}
                  </span>
                </div>
              )}
              
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
        </div>


        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card 
            className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 group" 
            onClick={() => router.push('/student/homework')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-blue-800">Mes devoirs</CardTitle>
              <div className="p-2 bg-blue-600 rounded-lg group-hover:bg-blue-700 transition-colors">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{allHomeworks.length}</div>
              <p className="text-sm text-blue-700">
                Devoirs assignés
              </p>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 group" 
            onClick={() => router.push('/student/submissions')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-purple-800">Mes soumissions</CardTitle>
              <div className="p-2 bg-purple-600 rounded-lg group-hover:bg-purple-700 transition-colors">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{getSubmissionsCount()}</div>
              <p className="text-sm text-purple-700">
                Soumissions
              </p>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 group" 
            onClick={() => router.push('/student/grades')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-yellow-800">Mes notes</CardTitle>
              <div className="p-2 bg-yellow-600 rounded-lg group-hover:bg-yellow-700 transition-colors">
                <Star className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-900">{getGradesCount()}</div>
              <p className="text-sm text-yellow-700">
                Notes reçues
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-green-800">À venir</CardTitle>
              <div className="p-2 bg-green-600 rounded-lg group-hover:bg-green-700 transition-colors">
                <Calendar className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{getUpcomingCount()}</div>
              <p className="text-sm text-green-700">
                Devoirs à venir
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-red-800">En retard</CardTitle>
              <div className="p-2 bg-red-600 rounded-lg group-hover:bg-red-700 transition-colors">
                <AlertCircle className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900">{getOverdueCount()}</div>
              <p className="text-sm text-red-700">
                Devoirs en retard
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Homeworks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <BookOpen className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-slate-800">Derniers devoirs</CardTitle>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/student/homework')}
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  Voir tout
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
                  <p className="text-gray-500">Aucun devoir assigné</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentHomeworks.map((homework) => (
                    <div key={homework.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors group">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-slate-800 group-hover:text-blue-700">{homework.title}</h4>
                        <div className="flex items-center gap-1">
                          {isOverdue(homework.deadline) ? (
                            <div className="flex items-center gap-1">
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <span className="text-xs text-red-600 font-medium">En retard</span>
                            </div>
                          ) : isDueSoon(homework.deadline) ? (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-orange-500" />
                              <span className="text-xs text-orange-600 font-medium">Bientôt</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-xs text-green-600 font-medium">À temps</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">{homework.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Échéance: {formatDate(homework.deadline)}
                        </span>
                        {homework.subject && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                            {homework.subject}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push('/student/homework')}
                  >
                    Voir tous les devoirs
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-green-600 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-slate-800">Statistiques</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-slate-700 font-medium">Total des devoirs</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">{allHomeworks.length}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FileText className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="text-slate-700 font-medium">Soumissions</span>
                  </div>
                  <span className="text-2xl font-bold text-purple-600">{getSubmissionsCount()}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-slate-700 font-medium">Soumissions rendues</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">{getSubmittedCount()}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Star className="h-4 w-4 text-yellow-600" />
                    </div>
                    <span className="text-slate-700 font-medium">Moyenne générale</span>
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
                    <span className="text-slate-700 font-medium">Devoirs en retard</span>
                  </div>
                  <span className="text-2xl font-bold text-red-600">{getOverdueCount()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Notifications */}
      {[...notifications, ...localNotifications].map((notification, index) => (
        <NotificationToast
          key={`${notification.timestamp}-${index}`}
          notification={notification}
          onClose={() => {
            if (index < notifications.length) {
              removeNotification(index)
            } else {
              setLocalNotifications(prev => prev.filter((_, i) => i !== (index - notifications.length)))
            }
          }}
        />
      ))}
    </div>
  )
}
