'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Calendar, CheckCircle, Star, FileText, AlertCircle, Bell, GraduationCap, User, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Homework, HomeworkSubmission, Grade } from '@/types/homework'
import { homeworkAPI } from '@/lib/homework-api'
import { submissionAPI } from '@/lib/submission-api'
import { useNotifications } from '@/hooks/use-notifications'
import { NotificationToast } from '@/components/notifications/NotificationToast'

interface Course {
  id: number
  title: string
  description?: string
  filePath?: string
  teacher: {
    id: number
    first_name: string
    last_name: string
    email: string
  }
  createdAt?: string
  subject?: string
}

export default function StudentDashboard() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [userId, setUserId] = useState<string>('')
  const [recentHomeworks, setRecentHomeworks] = useState<Homework[]>([])
  const [allHomeworks, setAllHomeworks] = useState<Homework[]>([])
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Notifications
  const { notifications, removeNotification, isConnected } = useNotifications(userId, 'STUDENT')
  const [localNotifications, setLocalNotifications] = useState<any[]>([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')
    const storedUserId = localStorage.getItem('userId')

    if (!token || role !== 'STUDENT') {
      router.push('/')
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
      const [homeworksData, submissionsData, gradesData, coursesData] = await Promise.all([
        homeworkAPI.getAllHomework(),
        submissionAPI.getMySubmissions(),
        submissionAPI.getMyGrades(),
        loadStudentCourses()
      ])
      setAllHomeworks(homeworksData)
      setRecentHomeworks(homeworksData.slice(0, 3))
      setSubmissions(submissionsData)
      setGrades(gradesData)
      setCourses(coursesData)
      
      checkForNewHomeworks(homeworksData)
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadStudentCourses = async (): Promise<Course[]> => {
    try {
      const token = localStorage.getItem('token')
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

      const coursesResponse = await fetch(`${API_URL}/courses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!coursesResponse.ok) {
        throw new Error('Erreur lors du chargement des cours')
      }

      return await coursesResponse.json()
    } catch (error) {
      console.error('Error loading courses:', error)
      return []
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
    <div className="min-h-screen bg-[#0a0e1a]">
      <div className="container mx-auto p-6 pb-20 lg:pb-6">
        {/* Header */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8 border border-slate-800">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[#a855f7] to-[#FF6B35] rounded-xl shadow-lg">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Dashboard Étudiant</h1>
                <p className="text-slate-400">Bienvenue, {email || 'Étudiant'}!</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Connection Status */}
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
                  {isConnected ? 'Connecté' : 'Déconnecté'}
                </span>
              </div>
              
              {(notifications.length > 0 || localNotifications.length > 0) && (
                <div className="relative">
                  <Bell className="h-5 w-5 text-[#a855f7] animate-pulse" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {notifications.length + localNotifications.length}
                  </span>
                </div>
              )}
              
              <Button 
                onClick={handleLogout} 
                variant="ghost"
                className="flex items-center gap-2 border border-slate-700 text-slate-300 hover:bg-white/10 hover:border-slate-600 bg-transparent"
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
            className="hover:shadow-xl transition-all duration-300 cursor-pointer bg-slate-900/50 border-slate-800 hover:border-blue-500/50 group backdrop-blur-sm" 
            onClick={() => router.push('/student/homework')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-white">Mes devoirs</CardTitle>
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg group-hover:from-blue-600 group-hover:to-blue-700 transition-all shadow-lg">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{allHomeworks.length}</div>
              <p className="text-sm text-slate-400">
                Devoirs assignés
              </p>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-xl transition-all duration-300 cursor-pointer bg-slate-900/50 border-slate-800 hover:border-purple-500/50 group backdrop-blur-sm" 
            onClick={() => router.push('/student/submissions')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-white">Mes soumissions</CardTitle>
              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg group-hover:from-purple-600 group-hover:to-purple-700 transition-all shadow-lg">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">{getSubmissionsCount()}</div>
              <p className="text-sm text-slate-400">
                Soumissions
              </p>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-xl transition-all duration-300 cursor-pointer bg-slate-900/50 border-slate-800 hover:border-yellow-500/50 group backdrop-blur-sm" 
            onClick={() => router.push('/student/grades')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-white">Mes notes</CardTitle>
              <div className="p-2 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg group-hover:from-yellow-600 group-hover:to-yellow-700 transition-all shadow-lg">
                <Star className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">{getGradesCount()}</div>
              <p className="text-sm text-slate-400">
                Notes reçues
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer bg-slate-900/50 border-slate-800 hover:border-green-500/50 group backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-white">À venir</CardTitle>
              <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg group-hover:from-green-600 group-hover:to-green-700 transition-all shadow-lg">
                <Calendar className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{getUpcomingCount()}</div>
              <p className="text-sm text-slate-400">
                Devoirs à venir
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer bg-slate-900/50 border-slate-800 hover:border-red-500/50 group backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-white">En retard</CardTitle>
              <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg group-hover:from-red-600 group-hover:to-red-700 transition-all shadow-lg">
                <AlertCircle className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">{getOverdueCount()}</div>
              <p className="text-sm text-slate-400">
                Devoirs en retard
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Homeworks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-900/50 border-slate-800 shadow-lg backdrop-blur-sm">
            <CardHeader className="bg-slate-800/50 border-b border-slate-700">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
                    <BookOpen className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-white">Derniers devoirs</CardTitle>
                </div>
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/student/homework')}
                  className="border border-slate-700 text-slate-300 hover:bg-white/10 hover:border-slate-600 bg-transparent"
                >
                  Voir tout
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#a855f7]"></div>
                </div>
              ) : recentHomeworks.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Aucun devoir assigné</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentHomeworks.map((homework) => (
                    <div key={homework.id} className="border border-slate-700 rounded-lg p-4 hover:bg-slate-800/50 transition-colors group bg-slate-800/30">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-white group-hover:text-[#a855f7]">{homework.title}</h4>
                        <div className="flex items-center gap-1">
                          {isOverdue(homework.deadline) ? (
                            <div className="flex items-center gap-1">
                              <AlertCircle className="h-4 w-4 text-red-400" />
                              <span className="text-xs text-red-400 font-medium">En retard</span>
                            </div>
                          ) : isDueSoon(homework.deadline) ? (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-orange-400" />
                              <span className="text-xs text-orange-400 font-medium">Bientôt</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-4 w-4 text-green-400" />
                              <span className="text-xs text-green-400 font-medium">À temps</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-slate-400 mb-3 line-clamp-2">{homework.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Échéance: {formatDate(homework.deadline)}
                        </span>
                        {homework.subject && (
                          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full font-medium border border-blue-500/30">
                            {homework.subject}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button 
                    variant="ghost"
                    className="w-full border border-slate-700 text-slate-300 hover:bg-white/10 hover:border-slate-600 bg-transparent"
                    onClick={() => router.push('/student/homework')}
                  >
                    Voir tous les devoirs
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 shadow-lg backdrop-blur-sm">
            <CardHeader className="bg-slate-800/50 border-b border-slate-700">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-white">Statistiques</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                      <BookOpen className="h-4 w-4 text-blue-400" />
                    </div>
                    <span className="text-slate-300 font-medium">Total des devoirs</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-400">{allHomeworks.length}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
                      <FileText className="h-4 w-4 text-purple-400" />
                    </div>
                    <span className="text-slate-300 font-medium">Soumissions</span>
                  </div>
                  <span className="text-2xl font-bold text-purple-400">{getSubmissionsCount()}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-500/20 rounded-lg border border-green-500/30">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    </div>
                    <span className="text-slate-300 font-medium">Soumissions rendues</span>
                  </div>
                  <span className="text-2xl font-bold text-green-400">{getSubmittedCount()}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                      <Star className="h-4 w-4 text-yellow-400" />
                    </div>
                    <span className="text-slate-300 font-medium">Moyenne générale</span>
                  </div>
                  <span className="text-2xl font-bold text-yellow-400">
                    {getAverageGrade().toFixed(1)}/20
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-500/20 rounded-lg border border-red-500/30">
                      <AlertCircle className="h-4 w-4 text-red-400" />
                    </div>
                    <span className="text-slate-300 font-medium">Devoirs en retard</span>
                  </div>
                  <span className="text-2xl font-bold text-red-400">{getOverdueCount()}</span>
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
