"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  BookOpen,
  Users,
  Calendar,
  Star,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowUpRight,
} from "lucide-react"
import type { Homework, HomeworkSubmission, Grade } from "@/types/homework"
import { homeworkAPI } from "@/lib/homework-api"
import { submissionAPI } from "@/lib/submission-api"
import { useNotifications } from "@/hooks/use-notifications"
import { NotificationToast } from "@/components/notifications/NotificationToast"

export default function TeacherDashboard() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [userId, setUserId] = useState<string>("")
  const [recentHomeworks, setRecentHomeworks] = useState<Homework[]>([])
  const [allHomeworks, setAllHomeworks] = useState<Homework[]>([])
  const [allSubmissions, setAllSubmissions] = useState<HomeworkSubmission[]>([])
  const [allGrades, setAllGrades] = useState<Grade[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Notifications
  const { notifications, removeNotification } = useNotifications(userId, "TEACHER")

  useEffect(() => {
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")
    const storedUserId = localStorage.getItem("userId")

    if (!token || role !== "TEACHER") {
      router.push("/")
      return
    } else {
      const storedEmail = localStorage.getItem("email")
      setEmail(storedEmail || "")
      setUserId(storedUserId || "")
      loadDashboardData()
    }
  }, [router])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      const homeworks = await homeworkAPI.getMyHomework()
      setAllHomeworks(homeworks)
      setRecentHomeworks(homeworks.slice(0, 3))

      const submissionsPromises = homeworks.map((hw) => submissionAPI.getHomeworkSubmissions(hw.id).catch(() => []))
      const allSubmissionsData = await Promise.all(submissionsPromises)
      setAllSubmissions(allSubmissionsData.flat())

      const gradesData = await submissionAPI.getTeacherGrades()
      setAllGrades(gradesData)
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTotalSubmissions = () => {
    return allSubmissions.length
  }

  const getSubmittedCount = () => {
    return allSubmissions.filter((s) => s.is_submitted).length
  }

  const getPendingGradingCount = () => {
    return allSubmissions.filter((s) => s.is_submitted).length - allGrades.length
  }

  const getGradedCount = () => {
    return allGrades.length
  }

  const getAverageGrade = () => {
    if (allGrades.length === 0) return 0
    return allGrades.reduce((sum, grade) => sum + grade.grade, 0) / allGrades.length
  }

  const getActiveHomeworks = () => {
    return allHomeworks.filter((h) => h.is_active).length
  }

  const getUpcomingDeadlines = () => {
    return allHomeworks.filter((h) => new Date(h.deadline) > new Date()).length
  }

  const getOverdueHomeworks = () => {
    return allHomeworks.filter((h) => new Date(h.deadline) < new Date()).length
  }

  const stats = [
    {
      title: "Total Devoirs",
      value: allHomeworks.length.toString(),
      change: "+2%",
      icon: BookOpen,
      color: "text-[#a855f7]",
      bgColor: "bg-[#a855f7]/20",
    },
    {
      title: "Soumissions Reçues",
      value: getTotalSubmissions().toString(),
      change: "+5%",
      icon: Users,
      color: "text-[#FF6B35]",
      bgColor: "bg-[#FF6B35]/20",
    },
    {
      title: "À Noter",
      value: getPendingGradingCount().toString(),
      change: "+1%",
      icon: Star,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/20",
    },
    {
      title: "Notées",
      value: getGradedCount().toString(),
      change: "+3%",
      icon: CheckCircle,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/20",
    },
  ]

  return (
    <>
      <style jsx>{`
        .stat-card {
          transition: all 0.3s ease;
          background: #1e293b !important;
          border: 1px solid #334155 !important;
          position: relative;
          overflow: hidden;
        }
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px -5px rgba(255, 107, 53, 0.3), 0 8px 10px -6px rgba(249, 115, 22, 0.2);
          border-color: #FF6B35 !important;
        }
        .stat-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #a855f7 0%, #FF6B35 50%, #10b981 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .stat-card:hover::before {
          opacity: 1;
        }
      `}</style>

      {/* Header */}
      <header className="bg-[#1a1f2e] border-b border-slate-800 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center justify-between p-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Tableau de Bord Enseignant</h1>
            <p className="text-slate-400 mt-1">Bienvenue, {email || "Enseignant"}!</p>
          </div>
        </div>
      </header>

      {/* Content Area */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="stat-card border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-medium ${stat.color}`}>{stat.title}</CardTitle>
                <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-medium">
                  <ArrowUpRight className="w-3 h-3" />
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Homeworks and Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-[#1a1f2e] border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Derniers Devoirs</CardTitle>
              <CardDescription className="text-slate-400">Vos devoirs récemment créés</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#a855f7]" />
                </div>
              ) : recentHomeworks.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50 text-[#a855f7]" />
                  <p className="text-lg font-medium text-white">Aucun devoir créé</p>
                  <p className="text-sm mt-2">Créez votre premier devoir pour commencer</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentHomeworks.map((homework) => (
                    <div
                      key={homework.id}
                      className="border border-slate-700 rounded-lg p-4 hover:bg-[#0a0e1a]/50 transition-colors group bg-[#0a0e1a]/20"
                    >
                      <h4 className="font-semibold text-white group-hover:text-[#a855f7]">{homework.title}</h4>
                      <p className="text-sm text-slate-400 mt-1 line-clamp-2">{homework.description}</p>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-xs text-slate-500 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Échéance: {formatDate(homework.deadline)}
                        </span>
                        {homework.subject && (
                          <span className="text-xs bg-[#a855f7]/30 text-[#c084fc] px-2 py-1 rounded-full font-medium border border-[#a855f7]/20">
                            {homework.subject}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => router.push("/teacher/homework")}
                    className="w-full border border-slate-700 text-slate-300 hover:bg-white/10 bg-transparent py-2 px-4 rounded-lg transition-colors"
                  >
                    Voir tous les devoirs
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#1a1f2e] border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Statistiques</CardTitle>
              <CardDescription className="text-slate-400">Vue d'ensemble de vos activités</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-[#0a0e1a]/30 rounded-lg border border-slate-700">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-[#a855f7]/20 rounded-lg">
                      <BookOpen className="h-4 w-4 text-[#a855f7]" />
                    </div>
                    <span className="text-slate-300 font-medium">Total des devoirs</span>
                  </div>
                  <span className="text-2xl font-bold text-[#a855f7]">{allHomeworks.length}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-[#0a0e1a]/30 rounded-lg border border-slate-700">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-[#FF6B35]/20 rounded-lg">
                      <FileText className="h-4 w-4 text-[#FF6B35]" />
                    </div>
                    <span className="text-slate-300 font-medium">Soumissions reçues</span>
                  </div>
                  <span className="text-2xl font-bold text-[#FF6B35]">{getTotalSubmissions()}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-[#0a0e1a]/30 rounded-lg border border-slate-700">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                    </div>
                    <span className="text-slate-300 font-medium">Soumissions notées</span>
                  </div>
                  <span className="text-2xl font-bold text-emerald-400">{getGradedCount()}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-[#0a0e1a]/30 rounded-lg border border-slate-700">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-[#FF6B35]/20 rounded-lg">
                      <Star className="h-4 w-4 text-[#FF6B35]" />
                    </div>
                    <span className="text-slate-300 font-medium">Moyenne des notes</span>
                  </div>
                  <span className="text-2xl font-bold text-[#FF6B35]">{getAverageGrade().toFixed(1)}/20</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-[#0a0e1a]/30 rounded-lg border border-slate-700">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-500/20 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-red-400" />
                    </div>
                    <span className="text-slate-300 font-medium">Devoirs expirés</span>
                  </div>
                  <span className="text-2xl font-bold text-red-400">{getOverdueHomeworks()}</span>
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
    </>
  )
}