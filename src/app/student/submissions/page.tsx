'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SubmissionList } from '@/components/homework/SubmissionList'
import { SubmissionForm } from '@/components/homework/SubmissionForm'
import { HomeworkSubmission, CreateSubmissionDto, UpdateSubmissionDto } from '@/types/homework'
import { submissionAPI } from '@/lib/submission-api'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus } from 'lucide-react'

export default function StudentSubmissionsPage() {
  const router = useRouter()
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
      router.push('/')
      return
    }

    loadSubmissions()
  }, [router])

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
        // Mise à jour
        await submissionAPI.updateSubmission(editingSubmission.id, data as UpdateSubmissionDto)
      } else {
        // Création
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
      <div className="min-h-screen bg-[#0a0e1a] py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={handleCancel}
              className="flex items-center gap-2 border-slate-700 text-slate-300 hover:bg-white/10 bg-transparent"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux soumissions
            </Button>
          </div>
          <SubmissionForm
            homeworkId={selectedHomeworkId}
            initialData={editingSubmission ? {
              content: editingSubmission.content,
              attachment_url: editingSubmission.attachment_url,
            } : undefined}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            isEditing={!!editingSubmission}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/student/dashboard')}
            className="flex items-center gap-2 border-slate-700 text-slate-300 hover:bg-white/10 bg-transparent"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au dashboard
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-900/50 border border-red-700 text-red-200 rounded">
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
