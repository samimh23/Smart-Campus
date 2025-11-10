'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dumbbell, Calendar, Eye, Trash2, Code, Play } from 'lucide-react'
import { apiClient, Exercise } from '@/lib/api-client'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'

export default function MyExercisesPage() {
  const router = useRouter()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [userCode, setUserCode] = useState('')

  useEffect(() => {
    loadExercises()
  }, [])

  const loadExercises = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('💪 Loading exercises from backend...')
      const response = await apiClient.getAllExercises()
      
      if (response.data && Array.isArray(response.data)) {
        console.log('✅ Loaded', response.data.length, 'exercises from backend')
        setExercises(response.data)
      } else if (response.error) {
        console.error('❌ Backend error:', response.error)
        // Fallback to localStorage
        loadFromLocalStorage()
      } else {
        // No exercises in backend, check localStorage
        loadFromLocalStorage()
      }
    } catch (err) {
      console.error('❌ Failed to load exercises:', err)
      // Fallback to localStorage on error
      loadFromLocalStorage()
    } finally {
      setIsLoading(false)
    }
  }

  const loadFromLocalStorage = () => {
    const cachedExercise = localStorage.getItem('cached_exercise')
    const cachedLanguage = localStorage.getItem('cached_language')
    const cachedSubject = localStorage.getItem('cached_subject')
    
    if (cachedExercise && cachedLanguage && cachedSubject) {
      console.log('📦 Loaded exercise from localStorage')
      const exercise = JSON.parse(cachedExercise)
      setExercises([{
        ...exercise,
        language: cachedLanguage,
        subject: cachedSubject,
        createdAt: new Date().toISOString()
      }])
    } else {
      setExercises([])
      setError('No exercises available offline')
    }
  }

  const handleViewExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise)
    setUserCode(exercise.starterCode || '')
  }

  const handleDeleteExercise = (index: number) => {
    const updatedExercises = exercises.filter((_, i) => i !== index)
    setExercises(updatedExercises)
    
    // If it's the cached exercise, remove from localStorage
    if (index === 0) {
      localStorage.removeItem('cached_exercise')
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
            <div className="text-white text-xl">Loading your exercises...</div>
          </div>
        </div>
      </div>
    )
  }

  if (selectedExercise) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-5xl mx-auto">
          <Button
            onClick={() => setSelectedExercise(null)}
            variant="outline"
            className="mb-6 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            ← Back to Exercises
          </Button>

          <Card className="bg-white/10 backdrop-blur-xl border-white/20 text-white">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-3xl font-bold mb-2">
                    {selectedExercise.title}
                  </CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge className="bg-purple-500 text-white">
                      {selectedExercise.language}
                    </Badge>
                    <Badge className="bg-blue-500 text-white">
                      {selectedExercise.subject}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">📝 Description</h3>
                <p className="text-white/90 whitespace-pre-wrap leading-relaxed">
                  {selectedExercise.description}
                </p>
              </div>

              {selectedExercise.expectedOutput && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">✅ Expected Output</h3>
                  <pre className="bg-black/50 p-4 rounded-lg overflow-x-auto">
                    <code className="text-green-400 text-sm">
                      {selectedExercise.expectedOutput}
                    </code>
                  </pre>
                </div>
              )}

              <div>
                <h3 className="text-xl font-semibold mb-3">💻 Your Code</h3>
                <Textarea
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  className="min-h-[300px] font-mono text-sm bg-slate-900/50 border-white/10 text-white"
                  placeholder="Write your solution here..."
                />
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() => router.push('/student/tutor')}
                    className="bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Practice on AI Tutor
                  </Button>
                </div>
              </div>

              {selectedExercise.testCases && selectedExercise.testCases.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">🧪 Test Cases</h3>
                  <div className="space-y-2">
                    {selectedExercise.testCases.map((testCase, idx) => (
                      <Card key={idx} className="bg-slate-900/50 border-white/10">
                        <CardContent className="pt-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-white/70 text-sm mb-1">Input:</p>
                              <pre className="bg-black/50 p-2 rounded text-xs text-green-400">
                                {testCase.input}
                              </pre>
                            </div>
                            <div>
                              <p className="text-white/70 text-sm mb-1">Expected Output:</p>
                              <pre className="bg-black/50 p-2 rounded text-xs text-green-400">
                                {testCase.expectedOutput}
                              </pre>
                            </div>
                          </div>
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
          <h1 className="text-4xl font-bold text-white mb-2">🏋️ My Exercises</h1>
          <p className="text-white/70">Practice with your generated AI exercises</p>
        </div>

        {error && (
          <Alert className="mb-6 bg-red-500/20 border-red-500/50 text-white">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {exercises.length === 0 ? (
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 text-white">
            <CardContent className="py-12 text-center">
              <Dumbbell className="h-16 w-16 mx-auto mb-4 text-white/50" />
              <h3 className="text-xl font-semibold mb-2">No exercises yet</h3>
              <p className="text-white/70 mb-6">
                Generate lessons to unlock practice exercises
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
            {exercises.map((exercise, index) => (
              <Card 
                key={index}
                className="bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/15 transition-all cursor-pointer"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2 line-clamp-2">
                        {exercise.title}
                      </CardTitle>
                      <div className="flex gap-2 mb-2">
                        <Badge className="bg-purple-500 text-white text-xs">
                          {exercise.language}
                        </Badge>
                        <Badge className="bg-blue-500 text-white text-xs">
                          {exercise.subject}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-white/70 text-sm mb-4 line-clamp-3">
                    {exercise.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-white/50 text-xs mb-4">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(exercise.createdAt)}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleViewExercise(exercise)}
                      className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
                      size="sm"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Practice
                    </Button>
                    <Button
                      onClick={() => handleDeleteExercise(index)}
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
