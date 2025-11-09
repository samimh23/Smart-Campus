// app/teacher/courses/create/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Upload, Loader2, AlertCircle } from 'lucide-react'

interface Subject {
  id: number
  name: string
}

interface FileData {
  filename: string
  path: string
  originalFileName: string
  fileSize: number
  fileType: string
}

export default function CreateCoursePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const classId = searchParams.get('class')
  
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [className, setClassName] = useState<string>('')
  const [subjectsLoading, setSubjectsLoading] = useState(true)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject_id: '',
    file: null as File | null,
  })

  const [uploadedFile, setUploadedFile] = useState<FileData | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')

    if (!token || role !== 'TEACHER') {
      router.push('/')
      return
    }

    if (classId) {
      loadSubjects()
      loadClassName()
    } else {
      setError('ID de classe manquant')
    }
  }, [classId, router])

  const loadSubjects = async () => {
    try {
      setSubjectsLoading(true)
      const token = localStorage.getItem('token')
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      
      console.log('🔄 Loading subjects from:', `${API_URL}/courses/subjects/all`)
      
      const response = await fetch(`${API_URL}/courses/subjects/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('📡 Subjects response status:', response.status)
      
      if (response.ok) {
        const subjectsData = await response.json()
        console.log('✅ Subjects loaded:', subjectsData)
        setSubjects(subjectsData)
      } else {
        console.error('❌ Failed to load subjects:', response.status, response.statusText)
        setError('Erreur lors du chargement des matières')
        
        // Fallback: Try the general subjects endpoint
        try {
          const fallbackResponse = await fetch(`${API_URL}/subjects`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json()
            console.log('✅ Subjects loaded from fallback:', fallbackData)
            setSubjects(fallbackData)
          }
        } catch (fallbackError) {
          console.error('❌ Fallback also failed:', fallbackError)
        }
      }
    } catch (error) {
      console.error('❌ Error loading subjects:', error)
      setError('Erreur lors du chargement des matières')
    } finally {
      setSubjectsLoading(false)
    }
  }

  const loadClassName = async () => {
    try {
      const token = localStorage.getItem('token')
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      
      const response = await fetch(`${API_URL}/classes/${classId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const classData = await response.json()
        setClassName(classData.name)
      }
    } catch (error) {
      console.error('Error loading class name:', error)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, file }))
      setUploadedFile(null) // Reset uploaded file when new file is selected
    }
  }

  const uploadFile = async (file: File): Promise<FileData> => {
    setIsUploading(true)
    try {
      const token = localStorage.getItem('token')
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      
      const formDataToSend = new FormData()
      formDataToSend.append('file', file)

      const response = await fetch(`${API_URL}/courses/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend
      })

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement du fichier')
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.title.trim()) {
      setError('Le titre est requis')
      return
    }

    if (!formData.subject_id) {
      setError('Veuillez sélectionner une matière')
      return
    }

    setIsLoading(true)

    try {
      const token = localStorage.getItem('token')
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

      let fileData: FileData | null = null
      
      // Upload file if exists
      if (formData.file) {
        fileData = await uploadFile(formData.file)
        setUploadedFile(fileData)
      }

      // Create course data object
      const courseData: any = {
        title: formData.title,
        description: formData.description,
        subject_id: parseInt(formData.subject_id),
        classIds: classId ? [parseInt(classId)] : [],
      }

      // Add file data if uploaded
      if (fileData) {
        courseData.filePath = fileData.path
        courseData.originalFileName = fileData.originalFileName
        courseData.fileSize = fileData.fileSize
        courseData.fileType = fileData.fileType
      }

      console.log('📤 Creating course with data:', courseData)

      const response = await fetch(`${API_URL}/courses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(courseData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erreur lors de la création du cours')
      }

      // Redirect back to courses list
      router.push(`/teacher/courses?class=${classId}`)
      
    } catch (error: any) {
      console.error('Error creating course:', error)
      setError(error.message || 'Erreur lors de la création du cours')
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
            onClick={() => router.push(`/teacher/courses?class=${classId}`)}
            className="flex items-center gap-2 mb-4 border-slate-700 text-slate-300 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux cours
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold text-white">
              Créer un nouveau cours {className && `pour ${className}`}
            </h1>
            <p className="text-slate-400 mt-2">Remplissez les informations du cours</p>
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
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  Titre du cours *
                </label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Introduction aux algorithmes"
                  className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  Description
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez le contenu de ce cours..."
                  className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 min-h-[100px]"
                />
              </div>

              {/* Subject Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  Matière *
                </label>
                {subjectsLoading ? (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Chargement des matières...
                  </div>
                ) : (
                  <Select 
                    value={formData.subject_id} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, subject_id: value }))}
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                      <SelectValue placeholder="Sélectionnez une matière" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700 text-white">
                      {subjects.length > 0 ? (
                        subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id.toString()}>
                            {subject.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          Aucune matière disponible
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  Fichier du cours (PDF, Word, PowerPoint)
                </label>
                <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center hover:border-[#a855f7] transition-colors">
                  <Input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 text-[#a855f7] mx-auto mb-2" />
                    <p className="text-white font-medium">
                      {formData.file ? formData.file.name : 'Cliquez pour sélectionner un fichier'}
                    </p>
                    <p className="text-slate-400 text-sm mt-1">
                      PDF, Word, PowerPoint, ou fichier texte
                    </p>
                  </label>
                </div>
                {formData.file && (
                  <p className="text-green-400 text-sm">
                    ✓ Fichier sélectionné: {formData.file.name}
                    {uploadedFile && ' (Téléchargé)'}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/teacher/courses?class=${classId}`)}
                  className="flex-1 border-slate-700 text-slate-300 hover:bg-white/10"
                  disabled={isLoading}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#a855f7] hover:bg-[#a855f7]/90"
                  disabled={isLoading || isUploading || subjectsLoading}
                >
                  {(isLoading || isUploading) ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {isUploading ? 'Téléchargement...' : 'Création...'}
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