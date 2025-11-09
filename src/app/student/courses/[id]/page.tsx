// app/student/courses/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Download, FileText, User, Calendar, Clock, AlertCircle, Eye } from 'lucide-react'

interface Course {
  id: number
  title: string
  description?: string
  filePath?: string
  originalFileName?: string
  fileSize?: number
  fileType?: string
  teacher: {
    id: number
    first_name: string
    last_name: string
    email: string
  }
  createdAt: string
  subject?: string
}

export default function CourseDetailPage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string
  
  const [course, setCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')

    if (!token || role !== 'STUDENT') {
      window.location.href = '/'
      return
    }

    loadCourseDetail()
  }, [courseId])

  const loadCourseDetail = async () => {
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
        throw new Error('Erreur lors du chargement du cours')
      }

      const courseData: Course = await response.json()
      setCourse(courseData)

    } catch (error) {
      console.error('Error loading course:', error)
      setError('Erreur lors du chargement du cours')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadFile = async () => {
    if (!course?.filePath) return

    try {
      setIsDownloading(true)
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      const downloadUrl = `${API_URL}${course.filePath}`
      
      // Open in new tab for viewing
      window.open(downloadUrl, '_blank')
    } catch (error) {
      console.error('Error downloading file:', error)
      setError('Erreur lors du téléchargement du fichier')
    } finally {
      setIsDownloading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <FileText className="h-6 w-6" />
    
    if (fileType.includes('pdf')) return <FileText className="h-6 w-6 text-red-500" />
    if (fileType.includes('word') || fileType.includes('document')) return <FileText className="h-6 w-6 text-blue-500" />
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return <FileText className="h-6 w-6 text-orange-500" />
    if (fileType.includes('image')) return <FileText className="h-6 w-6 text-green-500" />
    
    return <FileText className="h-6 w-6 text-gray-500" />
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a855f7]"></div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] py-8">
        <div className="container mx-auto px-4">
          <Button
            variant="outline"
            onClick={() => router.push('/student/courses')}
            className="flex items-center gap-2 mb-6 border-slate-700 text-slate-300 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux cours
          </Button>
          
          <Card className="bg-[#1a1f2e] border-slate-800">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Erreur</h3>
              <p className="text-slate-400 text-center">
                {error || 'Cours non trouvé'}
              </p>
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
            onClick={() => router.push('/student/courses')}
            className="flex items-center gap-2 mb-4 border-slate-700 text-slate-300 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux cours
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">{course.title}</h1>
              <p className="text-slate-400 mt-2">
                Détails du cours partagé par votre enseignant
              </p>
            </div>
            {course.subject && (
              <Badge variant="secondary" className="bg-[#a855f7] text-white text-lg px-4 py-2">
                {course.subject}
              </Badge>
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
                  <FileText className="h-5 w-5" />
                  Description du cours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 leading-relaxed">
                  {course.description || 'Aucune description fournie pour ce cours.'}
                </p>
              </CardContent>
            </Card>

            {/* File Information Card */}
            {course.filePath && (
              <Card className="bg-[#1a1f2e] border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Fichier du cours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="flex items-center space-x-4">
                      {getFileIcon(course.fileType)}
                      <div>
                        <h4 className="font-semibold text-white">
                          {course.originalFileName || 'Document du cours'}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                          {course.fileSize && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatFileSize(course.fileSize)}
                            </span>
                          )}
                          {course.fileType && (
                            <span className="bg-slate-700 px-2 py-1 rounded text-xs">
                              {course.fileType.split('/')[1]?.toUpperCase() || 'FILE'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={handleDownloadFile}
                      disabled={isDownloading}
                      className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 flex items-center gap-2"
                    >
                      {isDownloading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Ouverture...
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4" />
                          Ouvrir
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Teacher Information */}
            <Card className="bg-[#1a1f2e] border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Enseignant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg">
                    <div className="w-10 h-10 bg-[#a855f7] rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        {course.teacher.first_name} {course.teacher.last_name}
                      </p>
                      <p className="text-sm text-slate-400">{course.teacher.email}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course Metadata */}
            <Card className="bg-[#1a1f2e] border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Informations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Date de publication:</span>
                    <span className="text-white font-medium">
                      {formatDate(course.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Fichier disponible:</span>
                    <Badge variant={course.filePath ? "default" : "outline"} className={course.filePath ? "bg-green-600" : ""}>
                      {course.filePath ? 'Oui' : 'Non'}
                    </Badge>
                  </div>
                  {course.subject && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Matière:</span>
                      <span className="text-white font-medium">{course.subject}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}