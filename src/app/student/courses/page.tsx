'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AISearchAssistant } from '@/components/ai/AISearchAssistant'
import { BookOpen, Download, FileText, User, Calendar, Loader2, AlertCircle, ArrowLeft, Eye, Users, School } from 'lucide-react'

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
  subject_id?: number
}

interface Teacher {
  id: number
  first_name: string
  last_name: string
  email: string
}

interface Subject {
  id: number
  name: string
  courses: Course[]
  assignedTeacher?: Teacher
  totalTeachers?: number
  teachers?: Teacher[]
}

interface StudentClass {
  id: number
  name: string
  level?: string
}

export default function StudentCoursesPage() {
  const router = useRouter()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [studentId, setStudentId] = useState<number | null>(null)
  const [studentClass, setStudentClass] = useState<StudentClass | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')
    const storedUserId = localStorage.getItem('userId')

    console.log('🔍 Initializing StudentCoursesPage...')
    console.log('🔑 Auth check:', { token: !!token, role, storedUserId })

    if (!token || role !== 'STUDENT') {
      console.log('🚫 Unauthorized, redirecting to home')
      window.location.href = '/'
      return
    }

    if (storedUserId) {
      const userId = parseInt(storedUserId)
      console.log('👤 Setting student ID:', userId)
      setStudentId(userId)
      loadStudentDataWithFallback(userId)
    } else {
      console.error('❌ No student ID found in localStorage')
      setError('ID étudiant non trouvé. Veuillez vous reconnecter.')
      setIsLoading(false)
    }
  }, [])

  const testAPIConnectivity = async (): Promise<boolean> => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      console.log('🧪 Testing API connectivity to:', API_URL)
      
      const response = await fetch(`${API_URL}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      
      console.log('🌐 API connectivity test result:', response.status)
      return response.ok
    } catch (error) {
      console.error('🚫 API connectivity test failed:', error)
      return false
    }
  }

  const loadStudentDataWithFallback = async (userId: number) => {
  try {
    setIsLoading(true)
    setError(null)
    
    console.log('🔍 Starting to load student data...')
    
    // Test API connectivity first
    const isAPIConnected = await testAPIConnectivity()
    
    if (!isAPIConnected) {
      console.log('🔧 API not connected, using fallback data')
      useFallbackData()
      setIsLoading(false) // ADD THIS
      return
    }

    // Try to load real data
    try {
      const [classData, subjectsData] = await Promise.all([
        loadStudentClass(userId).catch(error => {
          console.error('❌ Error loading class:', error)
          return null
        }),
        loadStudentSubjectsAndCourses(userId).catch(error => {
          console.error('❌ Error loading subjects:', error)
          return []
        })
      ])
      
      console.log('✅ Real data loaded:', { classData, subjectsCount: subjectsData.length })
      
      // If we got real data, use it
      if (subjectsData.length > 0 || classData) {
        setStudentClass(classData)
        setSubjects(subjectsData)
        setIsLoading(false) // ADD THIS
        return
      }
      
      // If no real data, use fallback
      console.log('🔧 No real data found, using fallback')
      useFallbackData()
      
    } catch (realDataError) {
      console.error('💥 Error loading real data:', realDataError)
      useFallbackData()
    }
    
  } catch (error) {
    console.error('💥 Error in loadStudentDataWithFallback:', error)
    useFallbackData()
  } finally {
    // ADD THIS FINALLY BLOCK TO ENSURE LOADING STOPS
    setIsLoading(false)
  }
}

// Also update the useFallbackData function to stop loading:
const useFallbackData = () => {
  const mockClass = { id: 1, name: 'Classe A', level: '1ère Année' }
  const mockSubjects = [
    {
      id: 1,
      name: 'Mathématiques',
      courses: [],
      assignedTeacher: { id: 1, first_name: 'Jean', last_name: 'Dupont', email: 'jean.dupont@ecole.com' }
    },
    {
      id: 2, 
      name: 'Français',
      courses: [],
      assignedTeacher: { id: 2, first_name: 'Marie', last_name: 'Martin', email: 'marie.martin@ecole.com' }
    }
  ]
  
  setStudentClass(mockClass)
  setSubjects(mockSubjects)
  setError('Mode démo: Données de démonstration affichées. Le serveur est inaccessible.')
  setIsLoading(false) // ADD THIS
}

  const loadStudentClass = async (userId: number): Promise<StudentClass | null> => {
    try {
      const token = localStorage.getItem('token')
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

      console.log(`🔄 Fetching class for student ${userId}...`)
      
      const response = await fetch(`${API_URL}/classes/student/${userId}/class`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('📡 Class API Response status:', response.status)

      if (!response.ok) {
        if (response.status === 404) {
          console.log('ℹ️ Student has no class assigned')
          return null
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const classData = await response.json()
      console.log('🏫 Class data received:', classData)
      return classData

    } catch (error) {
      console.error('❌ Error in loadStudentClass:', error)
      throw error
    }
  }

  const loadStudentSubjectsAndCourses = async (userId: number): Promise<Subject[]> => {
  try {
    const token = localStorage.getItem('token')
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

    console.log(`🔄 Fetching subjects for student ${userId}...`)

    // 1. Get student's subjects
    const subjectsResponse = await fetch(`${API_URL}/classes/student/${userId}/subjects`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('📡 Subjects API Response status:', subjectsResponse.status)

    if (!subjectsResponse.ok) {
      if (subjectsResponse.status === 404) {
        console.log('ℹ️ No subjects found for student')
        return []
      }
      throw new Error(`HTTP error! status: ${subjectsResponse.status}`)
    }

    const studentSubjects: Subject[] = await subjectsResponse.json()
    console.log('📚 Student Subjects received:', studentSubjects)

    if (studentSubjects.length === 0) {
      console.log('⚠️ No subjects found, returning empty array')
      return []
    }

    // 2. Get student-specific courses
    let studentCourses: Course[] = []
    
    try {
      console.log(`🎯 Fetching student-specific courses for ${userId}...`)
      const studentCoursesResponse = await fetch(`${API_URL}/courses/student/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('📡 Student courses API Response status:', studentCoursesResponse.status)

      if (studentCoursesResponse.ok) {
        studentCourses = await studentCoursesResponse.json()
        console.log('🎯 Student-specific courses received:', studentCourses.length)
        
        // Log ALL courses to see what we're working with
        console.log('📋 ALL COURSES DETAILS:');
        studentCourses.forEach((course, index) => {
          console.log(`  ${index + 1}. "${course.title}"`);
          console.log(`     - Subject: "${course.subject}"`);
          console.log(`     - Subject ID: ${course.subject_id}`);
          console.log(`     - Teacher: ${course.teacher.first_name} ${course.teacher.last_name}`);
        });
      } else {
        console.log('❌ Student courses endpoint failed, fetching all courses...')
        // Fallback to all courses
        const allCoursesResponse = await fetch(`${API_URL}/courses`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (allCoursesResponse.ok) {
          studentCourses = await allCoursesResponse.json()
          console.log('📖 All courses received as fallback:', studentCourses.length)
        }
      }
    } catch (coursesError) {
      console.error('❌ Error loading courses:', coursesError)
      // Fallback to all courses
      const allCoursesResponse = await fetch(`${API_URL}/courses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (allCoursesResponse.ok) {
        studentCourses = await allCoursesResponse.json()
      }
    }

    console.log('📖 Final courses to match:', studentCourses.length)

    // 3. Match courses to subjects using multiple strategies
    const subjectsWithCourses = studentSubjects.map(subject => {
      console.log(`\n🔍 Matching courses for subject: "${subject.name}" (ID: ${subject.id})`)
      
      const subjectCourses = studentCourses.filter(course => {
        // Strategy 1: Match by subject name (exact match)
        const matchesByName = course.subject === subject.name
        
        // Strategy 2: Match by subject name (case insensitive)
        const matchesByNameCaseInsensitive = course.subject?.toLowerCase() === subject.name.toLowerCase()
        
        // Strategy 3: Match by subject ID if available
        const matchesById = course.subject_id === subject.id
        
        // Strategy 4: Match if course has no subject (assign to all subjects)
        const hasNoSubject = !course.subject
        
        const matches = matchesByName || matchesByNameCaseInsensitive || matchesById
        
        if (matches) {
          console.log(`   ✅ Course "${course.title}" matches subject "${subject.name}"`)
          console.log(`       - Course subject: "${course.subject}"`)
          console.log(`       - Subject name: "${subject.name}"`)
          console.log(`       - Course subject_id: ${course.subject_id}`)
          console.log(`       - Subject ID: ${subject.id}`)
        } else if (hasNoSubject) {
          console.log(`   ℹ️ Course "${course.title}" has no subject assigned`)
        }
        
        return matches
      })
      
      console.log(`✅ Subject "${subject.name}" has ${subjectCourses.length} courses`)
      
      // If no courses matched, try to assign courses with no subject
      if (subjectCourses.length === 0) {
        const coursesWithNoSubject = studentCourses.filter(course => !course.subject)
        if (coursesWithNoSubject.length > 0) {
          console.log(`   🔧 Assigning ${coursesWithNoSubject.length} courses with no subject to "${subject.name}"`)
          return {
            ...subject,
            courses: coursesWithNoSubject
          }
        }
      }
      
      return {
        ...subject,
        courses: subjectCourses
      }
    })

    const totalCourses = subjectsWithCourses.reduce((sum, subject) => sum + subject.courses.length, 0)
    console.log('\n🎯 FINAL RESULT:')
    console.log(`   - Subjects: ${subjectsWithCourses.length}`)
    console.log(`   - Total courses assigned: ${totalCourses}`)
    
    subjectsWithCourses.forEach(subject => {
      console.log(`   - "${subject.name}": ${subject.courses.length} courses`)
      subject.courses.forEach(course => {
        console.log(`        • "${course.title}"`)
      })
    })

    return subjectsWithCourses

  } catch (error) {
    console.error('❌ Error in loadStudentSubjectsAndCourses:', error)
    // Return empty array to prevent breaking the UI
    return []
  }
}

  const handleDownloadFile = (filePath: string, fileName: string) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    const downloadUrl = `${API_URL}${filePath}`
    console.log('📥 Downloading file:', downloadUrl)
    window.open(downloadUrl, '_blank')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  // Helper function to display teacher information
  const renderTeacherInfo = (subject: Subject) => {
    if (subject.assignedTeacher) {
      return (
        <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg">
          <User className="h-4 w-4 text-[#FF6B35]" />
          <div className="flex-1">
            <div className="text-sm font-medium text-white">
              {subject.assignedTeacher.first_name} {subject.assignedTeacher.last_name}
            </div>
            <div className="text-xs text-slate-400">
              Enseignant assigné
            </div>
          </div>
        </div>
      )
    }

    if (subject.teachers && subject.teachers.length > 0) {
      return (
        <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg">
          <Users className="h-4 w-4 text-[#FF6B35]" />
          <div className="flex-1">
            <div className="text-sm font-medium text-white">
              {subject.teachers.map(teacher => 
                `${teacher.first_name} ${teacher.last_name}`
              ).join(', ')}
            </div>
            <div className="text-xs text-slate-400">
              Enseignant{subject.teachers.length > 1 ? 's' : ''} de la matière
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2 p-2 bg-yellow-900/20 rounded-lg border border-yellow-800/30">
        <Users className="h-4 w-4 text-yellow-500" />
        <div className="flex-1">
          <div className="text-sm font-medium text-yellow-300">
            Aucun enseignant assigné
          </div>
          <div className="text-xs text-yellow-400">
            En attente d'assignation
          </div>
        </div>
      </div>
    )
  }

  // If no subject selected, show subjects list
  if (!selectedSubject) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] py-8">
        <div className="container mx-auto px-4">
          {/* Header with Class Information */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Mes Matières</h1>
                <p className="text-slate-400">
                  Consultez les matières de votre classe avec les enseignants assignés
                </p>
              </div>
              
              {/* Class Badge */}
              {studentClass && (
                <Badge className="bg-[#a855f7] text-white px-4 py-2 text-sm">
                  <School className="h-4 w-4 mr-2" />
                  {studentClass.name}
                  {studentClass.level && ` - ${studentClass.level}`}
                </Badge>
              )}
            </div>

            {/* Class Information Card */}
            {studentClass && (
              <Card className="bg-[#1a1f2e] border-slate-800 mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#a855f7] rounded-lg flex items-center justify-center">
                        <School className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Ma Classe</h3>
                        <p className="text-slate-400 text-sm">
                          {studentClass.name}
                          {studentClass.level && ` • ${studentClass.level}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400">Total des matières</p>
                      <p className="text-xl font-bold text-[#a855f7]">{subjects.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No Class Warning */}
            {!studentClass && !isLoading && (
              <Card className="bg-yellow-900/20 border-yellow-800/30 mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    <div>
                      <h3 className="font-semibold text-yellow-300">Aucune classe assignée</h3>
                      <p className="text-yellow-400 text-sm">
                        Vous n'êtes actuellement assigné à aucune classe. Contactez votre administrateur.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* AI Assistant */}
          <AISearchAssistant className="mt-6" />

          {error && (
            <div className="mb-6 p-4 bg-yellow-900/50 border border-yellow-700 text-yellow-200 rounded">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>{error}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 border-yellow-600 text-yellow-300 hover:bg-yellow-800/30"
                onClick={() => studentId && loadStudentDataWithFallback(studentId)}
              >
                Réessayer
              </Button>
            </div>
          )}

          {/* Subjects Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-[#a855f7]" />
              <span className="ml-3 text-slate-400">Chargement des matières...</span>
            </div>
          ) : subjects.length === 0 ? (
            <Card className="bg-[#1a1f2e] border-slate-800">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="w-16 h-16 text-[#a855f7] opacity-50 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {studentClass ? 'Aucune matière disponible' : 'Aucune matière assignée'}
                </h3>
                <p className="text-slate-400 text-center mb-4">
                  {studentClass 
                    ? "Votre classe n'a pas encore de matières assignées."
                    : "Vous devez être assigné à une classe pour voir les matières."
                  }
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="border-slate-700 text-slate-300 hover:bg-white/10"
                    onClick={() => router.push('/student/dashboard')}
                  >
                    Retour au dashboard
                  </Button>
                  <Button
                    variant="outline"
                    className="border-[#a855f7] text-[#a855f7] hover:bg-[#a855f7]/10"
                    onClick={() => studentId && loadStudentDataWithFallback(studentId)}
                  >
                    Actualiser
                  </Button>
                </div>
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
                      {/* Teacher Information */}
                      {renderTeacherInfo(subject)}

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
              
              {/* Show class information */}
              {studentClass && (
                <div className="flex items-center gap-2 mt-2 text-sm text-slate-400">
                  <School className="h-4 w-4" />
                  Classe: {studentClass.name}
                  {studentClass.level && ` • ${studentClass.level}`}
                </div>
              )}
              
              {/* Show teacher information in header */}
              <div className="mt-3">
                {renderTeacherInfo(selectedSubject)}
              </div>
            </div>
            <Badge variant="secondary" className="bg-[#a855f7] text-white">
              {selectedSubject.courses.length} cours
            </Badge>
          </div>
        </div>

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