'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Calendar, Clock, Code, Trash2, Eye } from 'lucide-react'
import { apiClient, Lesson } from '@/lib/api-client'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function MyLessonsPage() {
  const router = useRouter()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)

  useEffect(() => {
    loadLessons()
  }, [])

  const loadLessons = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('📚 Loading lessons from backend...')
      const response = await apiClient.getAllLessons()
      
      if (response.data && Array.isArray(response.data)) {
        console.log('✅ Loaded', response.data.length, 'lessons from backend')
        setLessons(response.data)
      } else if (response.error) {
        console.error('❌ Backend error:', response.error)
        // Fallback to localStorage
        loadFromLocalStorage()
      } else {
        // No lessons in backend, check localStorage
        loadFromLocalStorage()
      }
    } catch (err) {
      console.error('❌ Failed to load lessons:', err)
      // Fallback to localStorage on error
      loadFromLocalStorage()
    } finally {
      setIsLoading(false)
    }
  }

  const loadFromLocalStorage = () => {
    const cachedLesson = localStorage.getItem('cached_lesson')
    const cachedLanguage = localStorage.getItem('cached_language')
    const cachedSubject = localStorage.getItem('cached_subject')
    
    if (cachedLesson && cachedLanguage && cachedSubject) {
      console.log('📦 Loaded lesson from localStorage')
      const lesson = JSON.parse(cachedLesson)
      setLessons([{
        ...lesson,
        language: cachedLanguage,
        subject: cachedSubject,
        createdAt: new Date().toISOString()
      }])
    } else {
      setLessons([])
      setError('No lessons available offline')
    }
  }

  const handleViewLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson)
  }

  const handleDeleteLesson = (index: number) => {
    const updatedLessons = lessons.filter((_, i) => i !== index)
    setLessons(updatedLessons)
    
    // If it's the cached lesson, remove from localStorage
    if (index === 0) {
      localStorage.removeItem('cached_lesson')
      localStorage.removeItem('cached_language')
      localStorage.removeItem('cached_subject')
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recently'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-white text-xl">Loading your lessons...</div>
          </div>
        </div>
      </div>
    )
  }

  if (selectedLesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-5xl mx-auto">
          <Button
            onClick={() => setSelectedLesson(null)}
            variant="outline"
            className="mb-6 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            ← Back to Lessons
          </Button>

          <Card className="bg-white/10 backdrop-blur-xl border-white/20 text-white">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-3xl font-bold mb-2">
                    {selectedLesson.title}
                  </CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge className="bg-purple-500 text-white">
                      {selectedLesson.language}
                    </Badge>
                    <Badge className="bg-blue-500 text-white">
                      {selectedLesson.subject}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">📚 Content</h3>
                <div className="prose prose-invert max-w-none">
                  <p className="text-white/90 whitespace-pre-wrap leading-relaxed">
                    {selectedLesson.content}
                  </p>
                </div>
              </div>

              {selectedLesson.examples && selectedLesson.examples.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">💻 Examples</h3>
                  <div className="space-y-4">
                    {selectedLesson.examples.map((example, idx) => (
                      <Card key={idx} className="bg-slate-900/50 border-white/10">
                        <CardContent className="pt-6">
                          <pre className="bg-black/50 p-4 rounded-lg overflow-x-auto">
                            <code className="text-green-400 text-sm">
                              {example}
                            </code>
                          </pre>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">📚 My Lessons</h1>
          <p className="text-white/70">View all your generated AI lessons</p>
        </div>

        {error && (
          <Alert className="mb-6 bg-red-500/20 border-red-500/50 text-white">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {lessons.length === 0 ? (
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 text-white">
            <CardContent className="py-12 text-center">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-white/50" />
              <h3 className="text-xl font-semibold mb-2">No lessons yet</h3>
              <p className="text-white/70 mb-6">
                Generate your first lesson to get started
              </p>
              <Button
                onClick={() => router.push('/student/tutor')}
                className="bg-purple-500 hover:bg-purple-600 text-white"
              >
                <Code className="mr-2 h-4 w-4" />
                Generate Lesson
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson, index) => (
              <Card 
                key={index}
                className="bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/15 transition-all cursor-pointer"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2 line-clamp-2">
                        {lesson.title}
                      </CardTitle>
                      <div className="flex gap-2 mb-2">
                        <Badge className="bg-purple-500 text-white text-xs">
                          {lesson.language}
                        </Badge>
                        <Badge className="bg-blue-500 text-white text-xs">
                          {lesson.subject}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-white/70 text-sm mb-4 line-clamp-3">
                    {lesson.content.substring(0, 150)}...
                  </p>
                  
                  <div className="flex items-center gap-2 text-white/50 text-xs mb-4">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(lesson.createdAt)}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleViewLesson(lesson)}
                      className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
                      size="sm"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                    <Button
                      onClick={() => handleDeleteLesson(index)}
                      variant="outline"
                      className="bg-red-500/20 border-red-500/50 text-red-300 hover:bg-red-500/30"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
