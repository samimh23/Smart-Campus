'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { HomeworkList } from '@/components/homework/HomeworkList'
import { HomeworkForm } from '@/components/homework/HomeworkForm'
import { Homework, CreateHomeworkDto, UpdateHomeworkDto } from '@/types/homework'
import { homeworkAPI } from '@/lib/homework-api'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function TeacherHomeworkPage() {
  const router = useRouter()
  const [homeworks, setHomeworks] = useState<Homework[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingHomework, setEditingHomework] = useState<Homework | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')

    if (!token || role !== 'TEACHER') {
      router.push('/')
      return
    }

    loadHomeworks()
  }, [router])

  const loadHomeworks = async () => {
    try {
      setIsLoading(true)
      const data = await homeworkAPI.getMyHomework()
      setHomeworks(data)
    } catch (error) {
      console.error('Erreur lors du chargement des devoirs:', error)
      setError('Erreur lors du chargement des devoirs')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingHomework(null)
    setShowForm(true)
  }

  const handleEdit = (homework: Homework) => {
    setEditingHomework(homework)
    setShowForm(true)
  }

  const handleFormSubmit = async (data: CreateHomeworkDto | UpdateHomeworkDto) => {
    try {
      const teacherId = parseInt(localStorage.getItem('teacher_id') || '0')
      
      if (editingHomework) {
        // Mise à jour
        await homeworkAPI.updateHomework(editingHomework.id, data as UpdateHomeworkDto)
      } else {
        // Création
        await homeworkAPI.createHomework({
          ...data as CreateHomeworkDto,
          teacher_id: teacherId
        })
      }

      setShowForm(false)
      setEditingHomework(null)
      await loadHomeworks()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      setError('Erreur lors de la sauvegarde du devoir')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await homeworkAPI.deleteHomework(id)
      await loadHomeworks()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      setError('Erreur lors de la suppression du devoir')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingHomework(null)
  }

  const handleViewSubmissions = (homework: Homework) => {
    // Rediriger vers la page de notation avec l'ID du devoir
    router.push(`/teacher/submissions?homework=${homework.id}`)
  }

  if (showForm) {
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
              Retour à la liste
            </Button>
          </div>
          <HomeworkForm
            initialData={editingHomework ? {
              title: editingHomework.title,
              description: editingHomework.description,
              deadline: editingHomework.deadline,
              subject: editingHomework.subject,
              grade_level: editingHomework.grade_level,
              attachment_url: (editingHomework as any).attachment_url,
            } : undefined}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            isEditing={!!editingHomework}
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

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <HomeworkList
          homeworks={homeworks}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
          onViewSubmissions={handleViewSubmissions}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}



