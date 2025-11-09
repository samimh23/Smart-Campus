'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Trash2, 
  Edit, 
  Plus, 
  Calendar, 
  User, 
  FileText, 
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { HomeworkSubmission } from '@/types/homework'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface SubmissionListProps {
  submissions: HomeworkSubmission[]
  onEdit: (submission: HomeworkSubmission) => void
  onDelete: (id: number) => void
  onSubmit: (id: number) => void
  onCreate: () => void
  isLoading?: boolean
}

export function SubmissionList({ 
  submissions, 
  onEdit, 
  onDelete, 
  onSubmit, 
  onCreate, 
  isLoading 
}: SubmissionListProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleDelete = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette soumission ?')) {
      setDeletingId(id)
      try {
        await onDelete(id)
      } finally {
        setDeletingId(null)
      }
    }
  }

  const handleSubmit = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir soumettre définitivement ce devoir ? Cette action est irréversible.')) {
      await onSubmit(id)
    }
  }

  const getStatusBadge = (submission: HomeworkSubmission) => {
    if (submission.is_submitted) {
      return (
        <Badge variant={submission.is_late ? "destructive" : "default"} className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          {submission.is_late ? 'Soumis en retard' : 'Soumis'}
        </Badge>
      )
    }
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Brouillon
      </Badge>
    )
  }

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date()
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mes soumissions</h2>
        <Button onClick={onCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle soumission
        </Button>
      </div>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Aucune soumission pour le moment</p>
            <Button onClick={onCreate} className="mt-4">
              Créer votre première soumission
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {submissions.map((submission) => (
            <Card key={submission.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{submission.homework.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {submission.homework.teacher.first_name} {submission.homework.teacher.last_name}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!submission.is_submitted && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(submission)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSubmit(submission.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {!submission.is_submitted && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(submission.id)}
                        disabled={deletingId === submission.id}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  {getStatusBadge(submission)}
                  {isOverdue(submission.homework.deadline) && !submission.is_submitted && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      En retard
                    </Badge>
                  )}
                </div>

                <p className="text-gray-700 mb-4 line-clamp-3">{submission.content}</p>
                
                {submission.attachment_url && (
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{submission.attachment_url}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Échéance: {format(new Date(submission.homework.deadline), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                  </span>
                  {submission.submitted_at && (
                    <span className="ml-4">
                      Soumis le: {format(new Date(submission.submitted_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
