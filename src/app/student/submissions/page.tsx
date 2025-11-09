'use client'

import { useState, useEffect } from 'react'
import { SubmissionList } from '@/components/homework/SubmissionList'
import { SubmissionForm } from '@/components/homework/SubmissionForm'
import { HomeworkSubmission, CreateSubmissionDto, UpdateSubmissionDto } from '@/types/homework'
import { submissionAPI } from '@/lib/submission-api'
import { Button } from '@/components/ui/button'

export default function StudentSubmissionsPage() {
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSubmission, setEditingSubmission] = useState<HomeworkSubmission | null>(null)
  const [selectedHomeworkId, setSelectedHomeworkId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')

    if (!token || role !== 'STUDENT') {
      window.location.href = '/'
      return
    }

    loadSubmissions()
  }, [])

  const loadSubmissions = async () => {
    try {
      setIsLoading(true)
      const data = await submissionAPI.getMySubmissions()
      setSubmissions(data)
    } catch (error) {
      console.error('Erreur lors du chargement des soumissions:', error)
      setError('Erreur lors du chargement des soumissions')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = (homeworkId: number) => {
    setSelectedHomeworkId(homeworkId)
    setEditingSubmission(null)
    setShowForm(true)
  }

  const handleEdit = (submission: HomeworkSubmission) => {
    setEditingSubmission(submission)
    setSelectedHomeworkId(submission.homework_id)
    setShowForm(true)
  }

  const handleFormSubmit = async (data: CreateSubmissionDto | UpdateSubmissionDto) => {
    try {
      if (editingSubmission) {
        await submissionAPI.updateSubmission(editingSubmission.id, data as UpdateSubmissionDto)
      } else {
        await submissionAPI.createSubmission(data as CreateSubmissionDto)
      }

      setShowForm(false)
      setEditingSubmission(null)
      setSelectedHomeworkId(null)
      await loadSubmissions()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      setError('Erreur lors de la sauvegarde de la soumission')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await submissionAPI.updateSubmission(id, { is_submitted: false })
      await loadSubmissions()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      setError('Erreur lors de la suppression de la soumission')
    }
  }

  const handleSubmit = async (id: number) => {
    try {
      await submissionAPI.submitHomework(id)
      await loadSubmissions()
    } catch (error) {
      console.error('Erreur lors de la soumission:', error)
      setError('Erreur lors de la soumission du devoir')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingSubmission(null)
    setSelectedHomeworkId(null)
  }

  if (showForm && selectedHomeworkId) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              Retour aux soumissions
            </Button>
          </div>
          <SubmissionForm
            homeworkId={selectedHomeworkId}
            initialData={editingSubmission as any}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            isEditing={!!editingSubmission}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Soumissions</h1>
          <p className="text-gray-600">Gérez vos soumissions de devoirs</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <SubmissionList
          submissions={submissions}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSubmit={handleSubmit}
          onCreate={() => setShowForm(true)}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}