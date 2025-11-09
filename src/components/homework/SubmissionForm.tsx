'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateSubmissionDto, UpdateSubmissionDto } from '@/types/homework'
import { uploadAPI } from '@/lib/upload-api'
import { Upload, FileText, X } from 'lucide-react'

interface SubmissionFormProps {
  homeworkId: number
  initialData?: CreateSubmissionDto | UpdateSubmissionDto
  onSubmit: (data: CreateSubmissionDto | UpdateSubmissionDto) => Promise<void>
  onCancel: () => void
  isEditing?: boolean
}

export function SubmissionForm({ 
  homeworkId, 
  initialData, 
  onSubmit, 
  onCancel, 
  isEditing = false 
}: SubmissionFormProps) {
  const [formData, setFormData] = useState({
    content: initialData?.content || '',
    attachment_url: initialData?.attachment_url || '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setUploadError(null)

    try {
      // Upload le fichier d'abord si un fichier est sélectionné
      let uploadedUrl = formData.attachment_url
      if (selectedFile) {
        setIsUploading(true)
        try {
          const uploadResult = await uploadAPI.uploadFile(selectedFile)
          uploadedUrl = uploadResult.url
        } catch (error) {
          setUploadError('Erreur lors de l\'upload du fichier')
          setIsSubmitting(false)
          setIsUploading(false)
          return
        }
        setIsUploading(false)
      }

      const submissionData = {
        homework_id: homeworkId,
        ...formData,
        attachment_url: uploadedUrl
      }
      await onSubmit(submissionData)
    } catch (error) {
      console.error('Erreur lors de la soumission:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Vérifier la taille du fichier (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('Le fichier est trop volumineux (max 10MB)')
        return
      }
      // Vérifier le type de fichier
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/jpg',
        'image/png'
      ]
      if (!allowedTypes.includes(file.type)) {
        setUploadError('Type de fichier non accepté')
        return
      }
      setSelectedFile(file)
      setUploadError(null)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setFormData(prev => ({ ...prev, attachment_url: '' }))
    setUploadError(null)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {isEditing ? 'Modifier ma soumission' : 'Soumettre mon devoir'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="content">Votre travail *</Label>
            <Textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              placeholder="Décrivez votre travail, vos réponses, vos réflexions..."
              rows={8}
              className="resize-none"
            />
          </div>

          <div>
            <Label htmlFor="attachment">Pièce jointe (optionnel)</Label>
            <div className="space-y-2">
              <Input
                id="attachment"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                className="cursor-pointer"
              />
              {selectedFile && (
                <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-800 flex-1">{selectedFile.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {formData.attachment_url && !selectedFile && (
                <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
                  <FileText className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800 flex-1">Fichier déjà attaché</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {uploadError && (
                <p className="text-xs text-red-600">{uploadError}</p>
              )}
              <p className="text-xs text-gray-500">
                Formats acceptés: PDF, DOC, DOCX, TXT, JPG, PNG (max 10MB)
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploading || !formData.content.trim()}>
              {isUploading ? 'Upload en cours...' : isSubmitting ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Soumettre')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
