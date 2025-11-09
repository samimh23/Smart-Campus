// app/teacher/courses/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft, BookOpen, Download, Trash2, Loader2, AlertCircle, Plus } from 'lucide-react'

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
}

export default function TeacherCoursesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const classId = searchParams.get('class')
  
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [className, setClassName] = useState<string>('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')

    if (!token || role !== 'TEACHER') {
      router.push('/')
      return
    }

    if (classId) {
      loadCourses()
      loadClassName()
    } else {
      setError('ID de classe manquant')
      setIsLoading(false)
    }
  }, [classId, router])

  const loadClassName = async () => {
    try {
      const token = localStorage.getItem('token')
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      
      const response = await fetch(`${API_URL}/classes/${classId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const classData = await response.json()
        setClassName(classData.name)
      }
    } catch (error) {
      console.error('Error loading class name:', error)
    }
  }

  const loadCourses = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const token = localStorage.getItem('token')
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      
      const response = await fetch(`${API_URL}/courses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const coursesData = await response.json()
      console.log('📚 Courses loaded:', coursesData) // Debug log
      
      setCourses(coursesData)
      
    } catch (error) {
      console.error('Error loading courses:', error)
      setError('Erreur lors du chargement des cours')
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewCourseDetails = (course: Course) => {
    router.push(`/teacher/courses/${course.id}?class=${classId}`)
  }

  const handleDownloadFile = (filePath: string, fileName: string) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    const downloadUrl = `${API_URL}${filePath}`
    window.open(downloadUrl, '_blank')
  }

  const handleDeleteCourse = async (courseId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      
      const response = await fetch(`${API_URL}/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du cours')
      }
      
      // Remove course from local state
      setCourses(courses.filter(course => course.id !== courseId))
      
    } catch (error) {
      console.error('Error deleting course:', error)
      setError('Erreur lors de la suppression du cours')
    }
  }

  const handleCreateCourse = () => {
    router.push(`/teacher/courses/create?class=${classId}`)
  }

  // Helper function to get subject name
  const getSubjectName = (course: Course): string => {
    return course.subjectRelation?.name || course.subject || 'Non spécifiée'
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/teacher/classes')}
            className="flex items-center gap-2 mb-4 border-slate-700 text-slate-300 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux classes
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Cours {className && `- ${className}`}
              </h1>
              <p className="text-slate-400 mt-2">Gérez les cours de cette classe</p>
            </div>
            <Button
              onClick={handleCreateCourse}
              className="bg-[#a855f7] hover:bg-[#a855f7]/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Cours
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-900/50 border border-red-700 text-red-200 rounded">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          </div>
        )}

        {/* Courses Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-[#a855f7]" />
          </div>
        ) : courses.length === 0 ? (
          <Card className="bg-[#1a1f2e] border-slate-800">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="w-16 h-16 text-[#a855f7] opacity-50 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Aucun cours</h3>
              <p className="text-slate-400 text-center mb-4">
                Aucun cours n'a été créé pour cette classe.
              </p>
              <Button
                onClick={handleCreateCourse}
                className="bg-[#a855f7] hover:bg-[#a855f7]/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer un cours
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card 
                key={course.id}
                className="bg-[#1a1f2e] border-slate-800 hover:border-[#a855f7] transition-all duration-300 group"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-white group-hover:text-[#a855f7] transition-colors line-clamp-2">
                        {course.title}
                      </CardTitle>
                      <CardDescription className="text-slate-400 mt-2 line-clamp-2">
                        {course.description || 'Aucune description'}
                      </CardDescription>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-[#a855f7]/20 flex items-center justify-center group-hover:bg-[#a855f7]/30 transition-colors">
                      <BookOpen className="h-6 w-6 text-[#a855f7]" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Matière:</span>
                      <span className="text-white font-medium">
                        {getSubjectName(course)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Fichier:</span>
                      <span className="text-white font-medium">
                        {course.filePath ? 'Oui' : 'Non'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Enseignant:</span>
                      <span className="text-white font-medium">
                        {course.teacher.first_name} {course.teacher.last_name}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-slate-700 text-slate-300 hover:bg-white/10"
                      onClick={() => handleViewCourseDetails(course)}
                    >
                      Voir détails
                    </Button>
                    
                    {course.filePath && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-700 text-slate-300 hover:bg-white/10"
                        onClick={() => handleDownloadFile(course.filePath!, course.title)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => handleDeleteCourse(course.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}