'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, BookOpen, Download, Calendar, User, FileText, Loader2, AlertCircle, Tag } from 'lucide-react'

interface Course {
  id: number
  title: string
  description?: string
  filePath?: string
  subject?: string
  subjectRelation?: {
    id: number
    name: string
  }
  teacher: {
    id: number
    first_name: string
    last_name: string
    email: string
  }
  createdAt?: string
}

export default function CourseDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const courseId = params.id
  const classId = searchParams.get('class')
  
  const [course, setCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')

    if (!token || role !== 'TEACHER') {
      router.push('/')
      return
    }

    if (courseId) {
      loadCourseDetails()
    }
  }, [courseId, router])

  const loadCourseDetails = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const token = localStorage.getItem('token')
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      
      const response = await fetch(`${API_URL}/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('📚 Course details loaded:', data) // Debug log
      setCourse(data)
      
    } catch (error) {
      console.error('Error loading course details:', error)
      setError('Erreur lors du chargement des détails du cours')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadFile = () => {
    if (!course?.filePath) return
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    const downloadUrl = `${API_URL}${course.filePath}`
    window.open(downloadUrl, '_blank')
  }

  const handleBackToCourses = () => {
    if (classId) {
      router.push(`/teacher/courses?class=${classId}`)
    } else {
      router.push('/teacher/classes')
    }
  }

  // Helper function to get subject name
  const getSubjectName = (): string => {
    if (!course) return 'Non spécifiée'
    return course.subjectRelation?.name || course.subject || 'Non spécifiée'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#a855f7]" />
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] py-8">
        <div className="container mx-auto px-4">
          <Button
            variant="outline"
            onClick={handleBackToCourses}
            className="flex items-center gap-2 mb-4 border-slate-700 text-slate-300 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux cours
          </Button>
          
          <Card className="bg-[#1a1f2e] border-slate-800">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {error || 'Cours non trouvé'}
              </h3>
              <Button
                onClick={handleBackToCourses}
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-white/10"
              >
                Retour aux cours
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={handleBackToCourses}
            className="flex items-center gap-2 mb-4 border-slate-700 text-slate-300 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux cours
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">{course.title}</h1>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-slate-400">Détails du cours</p>
                <div className="flex items-center gap-2 px-3 py-1 bg-[#a855f7]/20 rounded-full">
                  <Tag className="h-3 w-3 text-[#a855f7]" />
                  <span className="text-[#a855f7] text-sm font-medium">
                    {getSubjectName()}
                  </span>
                </div>
              </div>
            </div>
            
            {course.filePath && (
              <Button
                onClick={handleDownloadFile}
                className="bg-[#FF6B35] hover:bg-[#FF6B35]/90"
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card */}
            <Card className="bg-[#1a1f2e] border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 leading-relaxed">
                  {course.description || 'Aucune description disponible pour ce cours.'}
                </p>
              </CardContent>
            </Card>

            {/* File Info Card */}
            {course.filePath && (
              <Card className="bg-[#1a1f2e] border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Fichier attaché
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-3 bg-[#0a0e1a] rounded-lg border border-slate-700">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-[#a855f7]" />
                      <div>
                        <p className="text-white font-medium">Document du cours</p>
                        <p className="text-slate-400 text-sm">
                          {course.filePath.split('/').pop()}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleDownloadFile}
                      size="sm"
                      className="bg-[#FF6B35] hover:bg-[#FF6B35]/90"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Info */}
            <Card className="bg-[#1a1f2e] border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Informations du cours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-400">ID du cours</p>
                    <p className="text-white font-medium">{course.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Matière</p>
                    <p className="text-white font-medium">{getSubjectName()}</p>
                  </div>
                  {course.createdAt && (
                    <div>
                      <p className="text-sm text-slate-400">Créé le</p>
                      <p className="text-white font-medium">
                        {new Date(course.createdAt).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Teacher Info */}
            <Card className="bg-[#1a1f2e] border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Enseignant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-400">Nom complet</p>
                    <p className="text-white font-medium">
                      {course.teacher.first_name} {course.teacher.last_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Email</p>
                    <p className="text-white font-medium break-all">{course.teacher.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-[#1a1f2e] border-slate-800">
              <CardHeader>
                <CardTitle className="text-white text-lg">
                  Actions rapides
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-slate-700 text-slate-300 hover:bg-white/10"
                    onClick={handleBackToCourses}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour à la liste
                  </Button>
                  {course.filePath && (
                    <Button
                      variant="outline"
                      className="w-full justify-start border-slate-700 text-slate-300 hover:bg-white/10"
                      onClick={handleDownloadFile}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger le fichier
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Subject Badge for Mobile */}
        <div className="lg:hidden mt-6">
          <Card className="bg-[#1a1f2e] border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-[#a855f7]" />
                  <span className="text-slate-400">Matière:</span>
                </div>
                <span className="text-[#a855f7] font-medium">
                  {getSubjectName()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}