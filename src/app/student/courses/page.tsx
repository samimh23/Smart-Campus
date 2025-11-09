'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Download, FileText, User, Calendar, Loader2, AlertCircle, ArrowLeft, Eye } from 'lucide-react'

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

interface Subject {
  id: number
  name: string
  courses: Course[]
}

export default function StudentCoursesPage() {
  const router = useRouter()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')

    if (!token || role !== 'STUDENT') {
      window.location.href = '/'
      return
    }

    loadStudentCourses()
  }, [])

  const loadStudentCourses = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const token = localStorage.getItem('token')
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

      // Get all courses
      const coursesResponse = await fetch(`${API_URL}/courses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!coursesResponse.ok) {
        throw new Error('Erreur lors du chargement des cours')
      }

      const allCourses: Course[] = await coursesResponse.json()

      // Group courses by subject
      const subjectsMap = new Map<string, Subject>()
      
      allCourses.forEach(course => {
        const subjectName = course.subject || 'Général'
        
        if (!subjectsMap.has(subjectName)) {
          subjectsMap.set(subjectName, {
            id: subjectsMap.size + 1,
            name: subjectName,
            courses: []
          })
        }
        
        subjectsMap.get(subjectName)!.courses.push(course)
      })

      const subjectsArray = Array.from(subjectsMap.values())
      setSubjects(subjectsArray)

    } catch (error) {
      console.error('Error loading courses:', error)
      setError('Erreur lors du chargement des cours')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadFile = (filePath: string, fileName: string) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    const downloadUrl = `${API_URL}${filePath}`
    window.open(downloadUrl, '_blank')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  // If no subject selected, show subjects list
  if (!selectedSubject) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Mes Cours</h1>
            <p className="text-slate-400">
              Consultez les cours organisés par matière
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-700 text-red-200 rounded">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                {error}
              </div>
            </div>
          )}

          {/* Subjects Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-[#a855f7]" />
            </div>
          ) : subjects.length === 0 ? (
            <Card className="bg-[#1a1f2e] border-slate-800">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="w-16 h-16 text-[#a855f7] opacity-50 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Aucune matière disponible</h3>
                <p className="text-slate-400 text-center">
                  Aucun cours n'a été partagé avec vous pour le moment.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <Card 
                  key={subject.id}
                  className="bg-[#1a1f2e] border-slate-800 hover:border-[#a855f7] transition-all duration-300 cursor-pointer group"
                  onClick={() => setSelectedSubject(subject)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white group-hover:text-[#a855f7] transition-colors">
                          {subject.name}
                        </CardTitle>
                        <CardDescription className="text-slate-400 mt-2">
                          {subject.courses.length} cours disponible{subject.courses.length > 1 ? 's' : ''}
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
                        <span className="text-slate-400">Total des cours:</span>
                        <span className="text-[#a855f7] font-bold">{subject.courses.length}</span>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-4 border-slate-700 text-slate-300 hover:bg-white/10"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedSubject(subject)
                      }}
                    >
                      Voir les cours
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // If subject selected, show courses for that subject
  return (
    <div className="min-h-screen bg-[#0a0e1a] py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => setSelectedSubject(null)}
            className="flex items-center gap-2 mb-4 border-slate-700 text-slate-300 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux matières
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">{selectedSubject.name}</h1>
              <p className="text-slate-400 mt-2">
                {selectedSubject.courses.length} cours disponible{selectedSubject.courses.length > 1 ? 's' : ''}
              </p>
            </div>
            <Badge variant="secondary" className="bg-[#a855f7] text-white">
              {selectedSubject.courses.length} cours
            </Badge>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 text-red-200 rounded">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          </div>
        )}

        {/* Courses Grid */}
        {selectedSubject.courses.length === 0 ? (
          <Card className="bg-[#1a1f2e] border-slate-800">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="w-16 h-16 text-[#a855f7] opacity-50 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Aucun cours disponible</h3>
              <p className="text-slate-400 text-center">
                Aucun cours n'a été partagé pour cette matière.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedSubject.courses.map((course) => (
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
                    {course.createdAt && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Date:</span>
                        <span className="text-white font-medium">
                          {formatDate(course.createdAt)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    {course.filePath && (
                      <Button
                        size="sm"
                        className="flex-1 bg-[#FF6B35] hover:bg-[#FF6B35]/90"
                        onClick={() => handleDownloadFile(course.filePath!, course.title)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger
                      </Button>
                    )}
                    <Button
  variant="outline"
  size="sm"
  className="flex-1 border-slate-700 text-slate-300 hover:bg-white/10"
  onClick={() => router.push(`/student/courses/${course.id}`)}
>
  <Eye className="h-4 w-4 mr-2" />
  Voir détails
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