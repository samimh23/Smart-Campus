'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SubmissionGradingList } from '@/components/homework/SubmissionGradingList'
import { GradingForm } from '@/components/homework/GradingForm'
import { HomeworkSubmission, Grade, CreateGradeDto, UpdateGradeDto } from '@/types/homework'
import { submissionAPI } from '@/lib/submission-api'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Star } from 'lucide-react'

export default function TeacherSubmissionsPage() {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showGradingForm, setShowGradingForm] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<HomeworkSubmission | null>(null)
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null)
  const [selectedHomeworkId, setSelectedHomeworkId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')

    if (!token || role !== 'TEACHER') {
      router.push('/')
      return
    }

    // Récupérer l'ID du devoir depuis l'URL
    const urlParams = new URLSearchParams(window.location.search)
    const homeworkId = urlParams.get('homework')
    
    if (homeworkId) {
      loadSubmissions(parseInt(homeworkId))
    } else {
      // Si pas de devoir spécifié, rediriger vers les devoirs
      router.push('/teacher/homework')
    }
  }, [router])

  const loadSubmissions = async (homeworkId: number) => {
    try {
      setIsLoading(true)
      const data = await submissionAPI.getHomeworkSubmissions(homeworkId)
      setSubmissions(data)
      setSelectedHomeworkId(homeworkId)
    } catch (error) {
      console.error('Erreur lors du chargement des soumissions:', error)
      setError('Erreur lors du chargement des soumissions')
    } finally {
      setIsLoading(false)
    }
  }

  const loadGrades = async () => {
    try {
      // Charger les notes pour les soumissions affichées
      const gradePromises = submissions.map(submission => 
        submissionAPI.getMyGrades().then(grades => 
          grades.find(grade => grade.submission_id === submission.id)
        )
      )
      const gradeResults = await Promise.all(gradePromises)
      setGrades(gradeResults.filter(grade => grade !== undefined) as Grade[])
    } catch (error) {
      console.error('Erreur lors du chargement des notes:', error)
    }
  }

  useEffect(() => {
    if (submissions.length > 0) {
      loadGrades()
    }
  }, [submissions])

  const handleGrade = (submission: HomeworkSubmission) => {
    setSelectedSubmission(submission)
    setEditingGrade(null)
    setShowGradingForm(true)
  }

  const handleEditGrade = (grade: Grade) => {
    setEditingGrade(grade)
    setSelectedSubmission(grade.submission)
    setShowGradingForm(true)
  }

  const handleFormSubmit = async (data: CreateGradeDto | UpdateGradeDto) => {
    try {
      if (editingGrade) {
        // Mise à jour
        await submissionAPI.updateGrade(editingGrade.id, data as UpdateGradeDto)
      } else {
        // Création
        await submissionAPI.createGrade(data as CreateGradeDto)
      }

      setShowGradingForm(false)
      setSelectedSubmission(null)
      setEditingGrade(null)
      await loadGrades()
    } catch (error) {
      console.error('Erreur lors de la notation:', error)
      setError('Erreur lors de la notation')
    }
  }

  const handleCancel = () => {
    setShowGradingForm(false)
    setSelectedSubmission(null)
    setEditingGrade(null)
  }

  if (showGradingForm && selectedSubmission) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux soumissions
            </Button>
          </div>
          <GradingForm
            submission={selectedSubmission}
  initialData={editingGrade as any}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            isEditing={!!editingGrade}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/teacher/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au dashboard
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notation des Soumissions</h1>
          <p className="text-gray-600">Consultez et notez les soumissions des étudiants</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <SubmissionGradingList
          submissions={submissions}
          grades={grades}
          onGrade={handleGrade}
          onEditGrade={handleEditGrade}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
