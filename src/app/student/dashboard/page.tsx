'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Calendar, CheckCircle, Star, FileText, AlertCircle, Bell, GraduationCap, User } from 'lucide-react'
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
    
    localStorage.setItem('lastVisit', now)
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

  const getGradesCount = () => {
    return grades.length
  }

  const getAverageGrade = () => {
    if (grades.length === 0) return 0
    return grades.reduce((sum, grade) => sum + grade.grade, 0) / grades.length
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <div className="p-6">
        {/* Header - Reduced margin */}
        <div className="bg-[#1a1f2e] rounded-xl shadow-lg p-6 mb-6 border border-slate-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-[#a855f7] rounded-xl">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Dashboard Étudiant</h1>
                <p className="text-slate-400">Bienvenue, {email || 'Étudiant'}!</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
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
            </div>
          </div>
        </div>

        {/* Main Content Grid - No extra spacing */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card 
              className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-blue-900/20 to-blue-800/20 hover:from-blue-800/30 hover:to-blue-700/30 group border border-blue-800/30" 
              onClick={() => router.push('/student/homework')}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-blue-400">Mes devoirs</CardTitle>
                <div className="p-2 bg-blue-600 rounded-lg group-hover:bg-blue-700 transition-colors">
                  <BookOpen className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{allHomeworks.length}</div>
                <p className="text-sm text-blue-300">
                  Devoirs assignés
                </p>
              </CardContent>
            </Card>

            <Card 
              className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-purple-900/20 to-purple-800/20 hover:from-purple-800/30 hover:to-purple-700/30 group border border-purple-800/30" 
              onClick={() => router.push('/student/courses')}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-purple-400">Mes cours</CardTitle>
                <div className="p-2 bg-purple-600 rounded-lg group-hover:bg-purple-700 transition-colors">
                  <GraduationCap className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{courses.length}</div>
                <p className="text-sm text-purple-300">
                  Cours disponibles
                </p>
              </CardContent>
            </Card>

            <Card 
              className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 hover:from-yellow-800/30 hover:to-yellow-700/30 group border border-yellow-800/30" 
              onClick={() => router.push('/student/grades')}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-yellow-400">Mes notes</CardTitle>
                <div className="p-2 bg-yellow-600 rounded-lg group-hover:bg-yellow-700 transition-colors">
                  <Star className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{getGradesCount()}</div>
                <p className="text-sm text-yellow-300">
                  Notes reçues
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-green-900/20 to-green-800/20 hover:from-green-800/30 hover:to-green-700/30 group border border-green-800/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-green-400">À venir</CardTitle>
                <div className="p-2 bg-green-600 rounded-lg group-hover:bg-green-700 transition-colors">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{getUpcomingCount()}</div>
                <p className="text-sm text-green-300">
                  Devoirs à venir
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Content Row - Courses and Homeworks side by side */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Recent Homeworks - Takes 2/3 on large screens */}
            <div className="xl:col-span-2">
              <Card className="border-0 shadow-lg bg-[#1a1f2e] border-slate-700 h-full">
                <CardHeader className="bg-gradient-to-r from-blue-900/20 to-blue-800/20 border-b border-blue-800/30">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-blue-600 rounded-lg">
                        <BookOpen className="h-4 w-4 text-white" />
                      </div>
                      <CardTitle className="text-white">Derniers devoirs</CardTitle>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push('/student/homework')}
                      className="border-blue-700 text-blue-300 hover:bg-blue-900/30"
                    >
                      Voir tout
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
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
                        <div key={homework.id} className="border border-slate-700 rounded-lg p-4 hover:bg-slate-800/50 transition-colors group">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-white group-hover:text-[#a855f7]">{homework.title}</h4>
                            <div className="flex items-center gap-1">
                              {isOverdue(homework.deadline) ? (
                                <div className="flex items-center gap-1">
                                  <AlertCircle className="h-4 w-4 text-red-500" />
                                  <span className="text-xs text-red-400 font-medium">En retard</span>
                                </div>
                              ) : isDueSoon(homework.deadline) ? (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4 text-orange-500" />
                                  <span className="text-xs text-orange-400 font-medium">Bientôt</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <CheckCircle className="h-4 w-4 text-green-500" />
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
                              <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-1 rounded-full font-medium">
                                {homework.subject}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      <Button 
                        variant="outline" 
                        className="w-full border-slate-700 text-slate-300 hover:bg-white/10"
                        onClick={() => router.push('/student/homework')}
                      >
                        Voir tous les devoirs
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Courses Section - Takes 1/3 on large screens */}
            <div className="xl:col-span-1">
              <Card className="border-0 shadow-lg bg-[#1a1f2e] border-slate-700 h-full">
                <CardHeader className="bg-gradient-to-r from-purple-900/20 to-purple-800/20 border-b border-purple-800/30">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-purple-600 rounded-lg">
                        <GraduationCap className="h-4 w-4 text-white" />
                      </div>
                      <CardTitle className="text-white">Mes Cours</CardTitle>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push('/student/courses')}
                      className="border-purple-700 text-purple-300 hover:bg-purple-900/30"
                    >
                      Voir tout
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#a855f7]"></div>
                    </div>
                  ) : courses.length === 0 ? (
                    <div className="text-center py-8">
                      <GraduationCap className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">Aucun cours disponible</p>
                      <Button 
                        variant="outline" 
                        className="mt-4 border-slate-700 text-slate-300 hover:bg-white/10"
                        onClick={() => router.push('/student/courses')}
                      >
                        Parcourir les cours
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center mb-4 p-4 bg-purple-900/20 rounded-lg border border-purple-800/30">
                        <div className="text-2xl font-bold text-white mb-2">{courses.length}</div>
                        <p className="text-sm text-purple-300">Cours disponibles</p>
                      </div>
                      
                      {courses.slice(0, 2).map((course) => (
<div 
  key={course.id}
  className="border border-slate-700 rounded-lg p-4 hover:bg-slate-800/50 transition-colors group cursor-pointer"
  onClick={() => router.push(`/student/courses/${course.id}`)}
>                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-white group-hover:text-[#a855f7] line-clamp-1">
                              {course.title}
                            </h4>
                          </div>
                          <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                            {course.description || 'Aucune description'}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-500 flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              {course.teacher.first_name} {course.teacher.last_name}
                            </span>
                            {course.subject && (
                              <span className="text-xs bg-purple-900/50 text-purple-300 px-2 py-1 rounded-full font-medium">
                                {course.subject}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {courses.length > 2 && (
                        <Button 
                          variant="outline" 
                          className="w-full border-slate-700 text-slate-300 hover:bg-white/10"
                          onClick={() => router.push('/student/courses')}
                        >
                          Voir tous les cours ({courses.length})
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Statistics Card */}
          <Card className="border-0 shadow-lg bg-[#1a1f2e] border-slate-700">
            <CardHeader className="bg-gradient-to-r from-green-900/20 to-green-800/20 border-b border-green-800/30">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-green-600 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-white">Statistiques</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-900/50 rounded-lg">
                      <BookOpen className="h-4 w-4 text-blue-400" />
                    </div>
                    <span className="text-slate-300 font-medium">Total des devoirs</span>
                  </div>
                  <span className="text-2xl font-bold text-white">{allHomeworks.length}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-900/50 rounded-lg">
                      <FileText className="h-4 w-4 text-purple-400" />
                    </div>
                    <span className="text-slate-300 font-medium">Soumissions</span>
                  </div>
                  <span className="text-2xl font-bold text-white">{getSubmissionsCount()}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-900/50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    </div>
                    <span className="text-slate-300 font-medium">Soumissions rendues</span>
                  </div>
                  <span className="text-2xl font-bold text-white">{getSubmittedCount()}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-900/50 rounded-lg">
                      <Star className="h-4 w-4 text-yellow-400" />
                    </div>
                    <span className="text-slate-300 font-medium">Moyenne générale</span>
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {getAverageGrade().toFixed(1)}/20
                  </span>
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