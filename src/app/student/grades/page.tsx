'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, Calendar, User, BookOpen, CheckCircle, ArrowLeft } from 'lucide-react'
import { Grade } from '@/types/homework'
import { submissionAPI } from '@/lib/submission-api'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function StudentGradesPage() {
  const router = useRouter()
  const [grades, setGrades] = useState<Grade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')

    if (!token || role !== 'STUDENT') {
      window.location.href = '/'
      return
    }

    loadGrades()
  }, [])

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
    if (grade >= 16) return 'text-green-400'
    if (grade >= 12) return 'text-blue-400'
    if (grade >= 8) return 'text-yellow-400'
    return 'text-red-400'
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
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a855f7]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.push('/student/dashboard')}
            className="flex items-center gap-2 mb-4 border-slate-700 text-slate-300 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au dashboard
          </Button>
          
          <h1 className="text-3xl font-bold text-white mb-2">Mes Notes</h1>
          <p className="text-slate-400">Consultez vos notes et les commentaires de vos enseignants</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 text-red-200 rounded">
            {error}
          </div>
        )}

        {grades.length === 0 ? (
          <Card className="bg-[#1a1f2e] border-slate-800">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Star className="h-16 w-16 text-[#a855f7] opacity-50 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Aucune note disponible</h3>
              <p className="text-slate-400 text-center">
                Vous n'avez pas encore de notes. Vos enseignants noteront vos soumissions.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {grades.map((grade) => (
              <Card key={grade.id} className="bg-[#1a1f2e] border-slate-800 hover:border-[#a855f7] transition-all">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-white">{grade.submission.homework.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-400">
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
                        <Badge variant="default" className="flex items-center gap-1 bg-green-600">
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
                        <div className="text-sm text-slate-400">sur 20</div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-2">Commentaires de l'enseignant :</h4>
                        {grade.feedback ? (
                          <p className="text-slate-300 bg-slate-800/50 p-3 rounded-lg">
                            {grade.feedback}
                          </p>
                        ) : (
                          <p className="text-slate-500 italic">Aucun commentaire</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {grade.submission.homework.subject && (
                      <Badge variant="secondary" className="bg-blue-900/50 text-blue-300">
                        {grade.submission.homework.subject}
                      </Badge>
                    )}
                    {grade.submission.homework.grade_level && (
                      <Badge variant="outline" className="border-slate-600 text-slate-300">
                        {grade.submission.homework.grade_level}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-400">
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
          <Card className="mt-8 bg-[#1a1f2e] border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <BookOpen className="h-5 w-5" />
                Statistiques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-900/20 rounded-lg border border-blue-800/30">
                  <div className="text-2xl font-bold text-blue-400">{grades.length}</div>
                  <div className="text-sm text-blue-300">Notes reçues</div>
                </div>
                <div className="text-center p-4 bg-green-900/20 rounded-lg border border-green-800/30">
                  <div className="text-2xl font-bold text-green-400">
                    {grades.length > 0 ? (grades.reduce((sum, g) => sum + g.grade, 0) / grades.length).toFixed(1) : 0}
                  </div>
                  <div className="text-sm text-green-300">Moyenne générale</div>
                </div>
                <div className="text-center p-4 bg-purple-900/20 rounded-lg border border-purple-800/30">
                  <div className="text-2xl font-bold text-purple-400">
                    {grades.filter(g => g.grade >= 12).length}
                  </div>
                  <div className="text-sm text-purple-300">Notes ≥ 12</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}