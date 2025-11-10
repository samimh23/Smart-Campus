'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Star, Calendar, User, BookOpen, CheckCircle } from 'lucide-react'
import { Grade } from '@/types/homework'
import { submissionAPI } from '@/lib/submission-api'

export default function StudentGradesPage() {
  const router = useRouter()
  const [grades, setGrades] = useState<Grade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')

    if (!token || role !== 'STUDENT') {
      router.push('/')
      return
    }

    loadGrades()
  }, [router])

  const loadGrades = async () => {
    try {
      setIsLoading(true)
      const data = await submissionAPI.getMyGrades()
      setGrades(data)
    } catch (error) {
      console.error('Erreur lors du chargement des notes:', error)
      setError('Erreur lors du chargement des notes')
    } finally {
      setIsLoading(false)
    }
  }

  const getGradeColor = (grade: number) => {
    if (grade >= 16) return 'text-green-600'
    if (grade >= 12) return 'text-blue-600'
    if (grade >= 8) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getGradeBadgeVariant = (grade: number) => {
    if (grade >= 16) return 'default'
    if (grade >= 12) return 'secondary'
    if (grade >= 8) return 'outline'
    return 'destructive'
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/student/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au dashboard
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Notes</h1>
          <p className="text-gray-600">Consultez vos notes et les commentaires de vos enseignants</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {grades.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Star className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune note disponible</h3>
              <p className="text-gray-500 text-center">
                Vous n'avez pas encore de notes. Vos enseignants noteront vos soumissions.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {grades.map((grade) => (
              <Card key={grade.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{grade.submission.homework.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {grade.teacher.first_name} {grade.teacher.last_name}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge 
                        variant={getGradeBadgeVariant(grade.grade)}
                        className="flex items-center gap-1"
                      >
                        <Star className="h-3 w-3" />
                        {grade.grade}/20
                      </Badge>
                      {grade.is_final && (
                        <Badge variant="default" className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Finale
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-center">
                        <div className={`text-4xl font-bold ${getGradeColor(grade.grade)}`}>
                          {grade.grade}
                        </div>
                        <div className="text-sm text-gray-500">sur 20</div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">Commentaires de l'enseignant :</h4>
                        {grade.feedback ? (
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                            {grade.feedback}
                          </p>
                        ) : (
                          <p className="text-gray-500 italic">Aucun commentaire</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {grade.submission.homework.subject && (
                      <Badge variant="secondary">{grade.submission.homework.subject}</Badge>
                    )}
                    {grade.submission.homework.grade_level && (
                      <Badge variant="outline">{grade.submission.homework.grade_level}</Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Noté le: {formatDate(grade.created_at)}
                    </span>
                    <span className="ml-4">
                      Soumis le: {formatDate(grade.submission.submitted_at || grade.submission.created_at)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Statistiques */}
        {grades.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Statistiques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{grades.length}</div>
                  <div className="text-sm text-blue-700">Notes reçues</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {grades.length > 0 ? (grades.reduce((sum, g) => sum + g.grade, 0) / grades.length).toFixed(1) : 0}
                  </div>
                  <div className="text-sm text-green-700">Moyenne générale</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {grades.filter(g => g.grade >= 12).length}
                  </div>
                  <div className="text-sm text-purple-700">Notes ≥ 12</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
