'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateHomeworkDto, UpdateHomeworkDto } from '@/types/homework'
import { uploadAPI } from '@/lib/upload-api'
import { Upload, FileText, X } from 'lucide-react'

interface HomeworkFormProps {
  initialData?: CreateHomeworkDto | UpdateHomeworkDto
  onSubmit: (data: CreateHomeworkDto | UpdateHomeworkDto) => Promise<void>
  onCancel: () => void
  isEditing?: boolean
}

export function HomeworkForm({ initialData, onSubmit, onCancel, isEditing = false }: HomeworkFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    deadline: initialData?.deadline ? new Date(initialData.deadline).toISOString().slice(0, 16) : '',
    subject: initialData?.subject || '',
    grade_level: initialData?.grade_level || '',
    attachment_url: (initialData as any)?.attachment_url || '',
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

      await onSubmit({ ...formData, attachment_url: uploadedUrl })
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
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        setUploadError('Seuls les fichiers PDF et Word sont acceptés')
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
        <CardTitle>{isEditing ? 'Modifier le devoir' : 'Créer un nouveau devoir'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Titre du devoir"
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Description détaillée du devoir"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="deadline">Date limite *</Label>
            <Input
              id="deadline"
              name="deadline"
              type="datetime-local"
              value={formData.deadline}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subject">Matière</Label>
              <Input
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Ex: Mathématiques, Français..."
              />
            </div>

            <div>
              <Label htmlFor="grade_level">Niveau</Label>
              <Input
                id="grade_level"
                name="grade_level"
                value={formData.grade_level}
                onChange={handleChange}
                placeholder="Ex: 6ème, 3ème, Terminale..."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="attachment">Fichier du devoir (optionnel)</Label>
            <div className="space-y-2">
              <Input
                id="attachment"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
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
                Formats acceptés: PDF, Word (max 10MB)
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isUploading ? 'Upload en cours...' : isSubmitting ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Créer')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}



