'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateGradeDto, UpdateGradeDto, HomeworkSubmission } from '@/types/homework'
import { Star, User, Calendar } from 'lucide-react'

interface GradingFormProps {
  submission: HomeworkSubmission
  initialData?: CreateGradeDto | UpdateGradeDto
  onSubmit: (data: CreateGradeDto | UpdateGradeDto) => Promise<void>
  onCancel: () => void
  isEditing?: boolean
}

export function GradingForm({ 
  submission, 
  initialData, 
  onSubmit, 
  onCancel, 
  isEditing = false 
}: GradingFormProps) {
  const [formData, setFormData] = useState({
    grade: initialData?.grade || 0,
    feedback: initialData?.feedback || '',
    is_final: initialData?.is_final || false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const gradeData = {
        submission_id: submission.id,
        ...formData
      }
      await onSubmit(gradeData)
    } catch (error) {
      console.error('Erreur lors de la notation:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value 
    }))
  }

  const getGradeColor = (grade: number) => {
    if (grade >= 16) return 'text-green-600'
    if (grade >= 12) return 'text-blue-600'
    if (grade >= 8) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          {isEditing ? 'Modifier la note' : 'Noter la soumission'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Informations sur la soumission */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Soumission de {submission.student.first_name} {submission.student.last_name}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{submission.student.email}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                Soumis le: {new Date(submission.submitted_at || submission.created_at).toLocaleDateString('fr-FR')}
              </span>
            </div>
          </div>
          <div className="text-sm">
            <strong>Devoir:</strong> {submission.homework.title}
          </div>
        </div>

        {/* Contenu de la soumission */}
        <div className="mb-6">
          <Label className="text-base font-medium">Travail de l'étudiant</Label>
          <div className="mt-2 p-4 bg-white border rounded-lg max-h-60 overflow-y-auto">
            <p className="whitespace-pre-wrap">{submission.content}</p>
            {submission.attachment_url && (
              <div className="mt-4 p-2 bg-blue-50 rounded border-l-4 border-blue-200">
                <strong>Pièce jointe:</strong> {submission.attachment_url}
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="grade">Note (sur 20) *</Label>
              <Input
                id="grade"
                name="grade"
                type="number"
                min="0"
                max="20"
                step="0.5"
                value={formData.grade}
                onChange={handleChange}
                required
                className={`text-lg font-semibold ${getGradeColor(formData.grade)}`}
              />
              <p className="text-xs text-gray-500 mt-1">
                Note entre 0 et 20 (demi-points autorisés)
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="is_final"
                name="is_final"
                type="checkbox"
                checked={formData.is_final}
                onChange={handleChange}
                className="rounded"
              />
              <Label htmlFor="is_final" className="text-sm">
                Note définitive
              </Label>
            </div>
          </div>

          <div>
            <Label htmlFor="feedback">Commentaires et feedback</Label>
            <Textarea
              id="feedback"
              name="feedback"
              value={formData.feedback}
              onChange={handleChange}
              placeholder="Commentaires sur le travail, points forts, axes d'amélioration..."
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Ces commentaires seront visibles par l'étudiant
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting || formData.grade < 0 || formData.grade > 20}>
              {isSubmitting ? 'Enregistrement...' : (isEditing ? 'Modifier la note' : 'Noter')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
