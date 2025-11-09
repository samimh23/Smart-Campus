'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Upload, Loader2, AlertCircle } from 'lucide-react'

export default function CreateCoursePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const classId = searchParams.get('class')
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      setError('Le titre est obligatoire')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const token = localStorage.getItem('token')
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

      let filePath = null

      // Upload file if exists
      if (file) {
        const formDataFile = new FormData()
        formDataFile.append('file', file)

        const uploadResponse = await fetch(`${API_URL}/courses/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formDataFile
        })

        if (!uploadResponse.ok) {
          throw new Error('Erreur lors du téléchargement du fichier')
        }

        const uploadData = await uploadResponse.json()
        filePath = uploadData.path
      }

      // Create course - using the existing backend structure
      const courseData = {
        title: formData.title,
        description: formData.description,
        filePath: filePath
        // Note: classId is not included since your backend doesn't support it yet
      }

      const courseResponse = await fetch(`${API_URL}/courses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(courseData)
      })

      if (!courseResponse.ok) {
        throw new Error('Erreur lors de la création du cours')
      }

      // Redirect to courses list
      if (classId) {
        router.push(`/teacher/courses?class=${classId}`)
      } else {
        router.push('/teacher/courses')
      }
      
    } catch (error) {
      console.error('Error creating course:', error)
      setError('Erreur lors de la création du cours')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push(classId ? `/teacher/courses?class=${classId}` : '/teacher/courses')}
            className="flex items-center gap-2 mb-4 border-slate-700 text-slate-300 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux cours
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold text-white">Créer un nouveau cours</h1>
            <p className="text-slate-400 mt-2">Ajoutez un nouveau cours à cette classe</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-900/50 border border-red-700 text-red-200 rounded">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          </div>
        )}

        {/* Create Course Form */}
        <Card className="bg-[#1a1f2e] border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Informations du cours</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="text-white text-sm font-medium mb-2 block">
                  Titre du cours *
                </label>
                <Input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Entrez le titre du cours"
                  className="bg-[#0a0e1a] border-slate-700 text-white"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-white text-sm font-medium mb-2 block">
                  Description
                </label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Description du cours (optionnel)"
                  className="bg-[#0a0e1a] border-slate-700 text-white min-h-[100px]"
                  rows={4}
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="text-white text-sm font-medium mb-2 block">
                  Fichier du cours
                </label>
                <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center hover:border-[#a855f7] transition-colors">
                  <Input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 text-[#a855f7] mx-auto mb-2" />
                    <p className="text-white font-medium">
                      {file ? file.name : 'Cliquez pour télécharger un fichier'}
                    </p>
                    <p className="text-slate-400 text-sm mt-1">
                      PDF, Word, PowerPoint, ou texte (max 10MB)
                    </p>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(classId ? `/teacher/courses?class=${classId}` : '/teacher/courses')}
                  className="flex-1 border-slate-700 text-slate-300 hover:bg-white/10"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-[#a855f7] hover:bg-[#a855f7]/90"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Création...
                    </>
                  ) : (
                    'Créer le cours'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}