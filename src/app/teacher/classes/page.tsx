'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft, Users, BookOpen, Calendar, Mail, Loader2, AlertCircle, FileText } from 'lucide-react'

interface Class {
  id: number
  name: string
  level?: string
  teacher_id: number
  students?: Student[]
  subjects?: Subject[]
}

interface Student {
  id: number
  first_name: string
  last_name: string
  email: string
  classe_id: number
}

interface Subject {
  id: number
  name: string
}

export default function TeacherClassesPage() {
  const router = useRouter()
  const [classes, setClasses] = useState<Class[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')

    if (!token || role !== 'TEACHER') {
      router.push('/')
      return
    }

    loadClasses()
  }, [router])

  const loadClasses = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const teacherId = localStorage.getItem('userId')
      const token = localStorage.getItem('token')
      
      if (!teacherId) {
        throw new Error('Teacher ID not found')
      }

      console.log('Loading classes for teacher:', teacherId)
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      
      // Try the new endpoint first (classes where teacher teaches subjects)
      let response = await fetch(`${API_URL}/classes/teacher/${teacherId}/by-subjects`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      let data = [];
      
      if (response.ok) {
        data = await response.json();
        console.log('Classes by subjects data:', data);
      } else {
        // Fallback to the old endpoint (classes where teacher is directly assigned)
        console.log('New endpoint not available, falling back to old endpoint');
        response = await fetch(`${API_URL}/classes/teacher/${teacherId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Server response:', errorText);
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        data = await response.json();
        console.log('Classes by direct assignment data:', data);
      }
      
      setClasses(data)
      
    } catch (error) {
      console.error('Erreur lors du chargement des classes:', error)
      
      // Type-safe error handling
      if (error instanceof Error) {
        setError(`Erreur lors du chargement des classes: ${error.message}`)
      } else if (typeof error === 'string') {
        setError(`Erreur lors du chargement des classes: ${error}`)
      } else {
        setError('Erreur lors du chargement des classes. Vérifiez que le backend est en cours d\'exécution.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewClassCourses = (classItem: Class) => {
    router.push(`/teacher/courses?class=${classItem.id}`)
  }

  const loadStudents = async (classId: number) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const token = localStorage.getItem('token')
      
      console.log('Loading students for class:', classId)
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/classes/${classId}/students`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Students data:', data)
      setStudents(data.students || [])
      
    } catch (error) {
      console.error('Erreur lors du chargement des étudiants:', error)
      
      if (error instanceof Error) {
        setError(`Erreur lors du chargement des étudiants: ${error.message}`)
      } else {
        setError('Erreur lors du chargement des étudiants.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClassSelect = (classItem: Class) => {
    setSelectedClass(classItem)
    loadStudents(classItem.id)
  }

  const handleBackToClasses = () => {
    setSelectedClass(null)
    setStudents([])
    setError(null)
  }

  const handleViewClassHomeworks = (classItem: Class) => {
    router.push(`/teacher/homework?class=${classItem.id}`)
  }

  const getStudentCount = (classItem: Class) => {
    return classItem.students?.length || 0
  }

  const getClassSubjects = (classItem: Class) => {
    if (!classItem.subjects || classItem.subjects.length === 0) {
      return 'Aucune matière'
    }
    return classItem.subjects.map(subject => subject.name).join(', ')
  }

  if (selectedClass) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={handleBackToClasses}
              className="flex items-center gap-2 mb-4 border-slate-700 text-slate-300 hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux classes
            </Button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">{selectedClass.name}</h1>
                <p className="text-slate-400 mt-2">
                  {selectedClass.level && `${selectedClass.level} • `} 
                  {getClassSubjects(selectedClass)}
                </p>
              </div>
              <Button
                onClick={() => handleViewClassHomeworks(selectedClass)}
                className="bg-[#FF6B35] hover:bg-[#FF6B35]/90"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Voir les devoirs
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

          {/* Students List */}
          <Card className="bg-[#1a1f2e] border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                Étudiants ({students.length})
              </CardTitle>
              <CardDescription className="text-slate-400">
                Liste des étudiants de cette classe
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#a855f7]" />
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-50 text-[#a855f7]" />
                  <p className="text-lg font-medium text-white">Aucun étudiant</p>
                  <p className="text-sm mt-2">Aucun étudiant n'est inscrit dans cette classe</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 border border-slate-700 rounded-lg hover:bg-[#0a0e1a]/50 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#a855f7] to-[#FF6B35] flex items-center justify-center text-white font-semibold">
                          {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white group-hover:text-[#a855f7]">
                            {student.first_name} {student.last_name}
                          </h4>
                          <p className="text-sm text-slate-400 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {student.email}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-slate-500">
                        ID: {student.id}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/teacher/dashboard')}
            className="flex items-center gap-2 mb-4 border-slate-700 text-slate-300 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au dashboard
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Mes Classes</h1>
              <p className="text-slate-400 mt-2">Gérez vos classes et consultez les étudiants</p>
            </div>
            <Button
              onClick={loadClasses}
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-white/10"
            >
              <Loader2 className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualiser
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

        {/* Classes Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-[#a855f7]" />
          </div>
        ) : classes.length === 0 ? (
          <Card className="bg-[#1a1f2e] border-slate-800">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="w-16 h-16 text-[#a855f7] opacity-50 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Aucune classe assignée</h3>
              <p className="text-slate-400 text-center mb-4">
                Vous n'êtes actuellement assigné à aucune classe.
              </p>
              <Button
                onClick={loadClasses}
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-white/10"
              >
                <Loader2 className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((classItem) => (
              <Card 
                key={classItem.id}
                className="bg-[#1a1f2e] border-slate-800 hover:border-[#FF6B35] transition-all duration-300 cursor-pointer group"
                onClick={() => handleClassSelect(classItem)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-white group-hover:text-[#FF6B35] transition-colors">
                        {classItem.name}
                      </CardTitle>
                      <CardDescription className="text-slate-400 mt-2">
                        {getClassSubjects(classItem)}
                      </CardDescription>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-[#FF6B35]/20 flex items-center justify-center group-hover:bg-[#FF6B35]/30 transition-colors">
                      <Users className="h-6 w-6 text-[#FF6B35]" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Niveau:</span>
                      <span className="text-white font-medium">{classItem.level || 'Non spécifié'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Étudiants:</span>
                      <span className="text-[#FF6B35] font-bold">{getStudentCount(classItem)}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-slate-700 text-slate-300 hover:bg-white/10"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleClassSelect(classItem)
                      }}
                    >
                      Voir les étudiants
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[#a855f7] hover:bg-[#a855f7]/90"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewClassCourses(classItem)
                      }}
                    >
                      <BookOpen className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[#FF6B35] hover:bg-[#FF6B35]/90"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewClassHomeworks(classItem)
                      }}
                    >
                      <FileText className="h-4 w-4" />
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