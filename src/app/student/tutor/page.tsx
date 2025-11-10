'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen, Code, Settings, Play, CheckCircle, XCircle, Sparkles, Zap, Target, Trophy, ChevronRight, Loader2, User, LogOut, Brain, Lightbulb, Rocket, Star, Wand2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { OfflineIndicator } from '@/components/OfflineIndicator'
import { apiClient, ApiUser, Exercise, Feedback, Lesson, UserProgress } from '@/lib/api-client'

const programmingLanguages = [
  { value: 'javascript', label: 'JavaScript', icon: '🟨', color: 'bg-yellow-100 border-yellow-300' },
  { value: 'python', label: 'Python', icon: '🐍', color: 'bg-blue-100 border-blue-300' },
  { value: 'java', label: 'Java', icon: '☕', color: 'bg-orange-100 border-orange-300' },
  { value: 'cpp', label: 'C++', icon: '⚡', color: 'bg-purple-100 border-purple-300' },
  { value: 'csharp', label: 'C#', icon: '🔷', color: 'bg-indigo-100 border-indigo-300' },
  { value: 'typescript', label: 'TypeScript', icon: '🔷', color: 'bg-blue-100 border-blue-300' },
  { value: 'go', label: 'Go', icon: '🐹', color: 'bg-cyan-100 border-cyan-300' },
  { value: 'rust', label: 'Rust', icon: '🦀', color: 'bg-orange-100 border-orange-300' }
]

const subjects = {
  javascript: [
    { value: 'basics', label: 'Basic Syntax & Variables' },
    { value: 'functions', label: 'Functions & Scope' },
    { value: 'arrays', label: 'Arrays & Objects' },
    { value: 'dom', label: 'DOM Manipulation' },
    { value: 'async', label: 'Async Programming' },
    { value: 'es6', label: 'ES6+ Features' }
  ],
  python: [
    { value: 'basics', label: 'Basic Syntax & Variables' },
    { value: 'functions', label: 'Functions & Modules' },
    { value: 'data_structures', label: 'Data Structures' },
    { value: 'oop', label: 'Object-Oriented Programming' },
    { value: 'file_io', label: 'File I/O' },
    { value: 'libraries', label: 'Popular Libraries' }
  ],
  java: [
    { value: 'basics', label: 'Basic Syntax & Variables' },
    { value: 'oop', label: 'Object-Oriented Programming' },
    { value: 'collections', label: 'Collections Framework' },
    { value: 'exception', label: 'Exception Handling' },
    { value: 'threads', label: 'Multithreading' },
    { value: 'spring', label: 'Spring Framework' }
  ],
  cpp: [
    { value: 'basics', label: 'Basic Syntax & Variables' },
    { value: 'pointers', label: 'Pointers & Memory' },
    { value: 'oop', label: 'Object-Oriented Programming' },
    { value: 'stl', label: 'Standard Template Library' },
    { value: 'templates', label: 'Templates' },
    { value: 'memory', label: 'Memory Management' }
  ],
  csharp: [
    { value: 'basics', label: 'Basic Syntax & Variables' },
    { value: 'oop', label: 'Object-Oriented Programming' },
    { value: 'linq', label: 'LINQ' },
    { value: 'async', label: 'Async Programming' },
    { value: 'dotnet', label: '.NET Framework' },
    { value: 'webapi', label: 'Web API Development' }
  ],
  typescript: [
    { value: 'basics', label: 'Basic Syntax & Types' },
    { value: 'interfaces', label: 'Interfaces & Types' },
    { value: 'generics', label: 'Generics' },
    { value: 'decorators', label: 'Decorators' },
    { value: 'advanced', label: 'Advanced Types' },
    { value: 'node', label: 'Node.js with TypeScript' }
  ],
  go: [
    { value: 'basics', label: 'Basic Syntax & Variables' },
    { value: 'goroutines', label: 'Goroutines & Channels' },
    { value: 'interfaces', label: 'Interfaces' },
    { value: 'packages', label: 'Packages & Modules' },
    { value: 'concurrency', label: 'Concurrency Patterns' },
    { value: 'web', label: 'Web Development' }
  ],
  rust: [
    { value: 'basics', label: 'Basic Syntax & Variables' },
    { value: 'ownership', label: 'Ownership & Borrowing' },
    { value: 'traits', label: 'Traits & Generics' },
    { value: 'error', label: 'Error Handling' },
    { value: 'async', label: 'Async Programming' },
    { value: 'web', label: 'Web Development' }
  ]
}

export default function AiTutorWithBackend() {
  const router = useRouter()
  
  // Authentication - use existing project's token
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<ApiUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Learning state
  const [apiKey, setApiKey] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [currentView, setCurrentView] = useState<'setup' | 'learning'>('setup')
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null)
  const [userCode, setUserCode] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
  
  // Track progress per module (language + subject)
  const [moduleProgress, setModuleProgress] = useState<Record<string, {
    lessonsViewed: number
    exercisesAttempted: number
    exercisesCorrect: number
  }>>({})
  
  const [showConfetti, setShowConfetti] = useState(false)
  const [backendStatus, setBackendStatus] = useState<'unknown' | 'online' | 'offline'>('unknown')
  const [generatingStep, setGeneratingStep] = useState<string>('')
  const [generationProgress, setGenerationProgress] = useState(0)

  // Get current module key
  const getCurrentModuleKey = () => `${selectedLanguage}-${selectedSubject}`
  
  // Get current module progress
  const currentProgress = moduleProgress[getCurrentModuleKey()] || {
    lessonsViewed: 0,
    exercisesAttempted: 0,
    exercisesCorrect: 0
  }

  // Code execution state
  const [runOutput, setRunOutput] = useState<{
    stdout: string | null;
    stderr: string | null;
    status: { id: number; description: string } | null;
    time: string | null;
    memory: number | null;
    compileOutput: string | null;
  } | null>(null)
  const [stdinInput, setStdinInput] = useState('')

  // Debug logging
  useEffect(() => {
    console.log('========== PROGRESS DEBUG ==========')
    console.log('Selected Language:', selectedLanguage)
    console.log('Selected Subject:', selectedSubject)
    console.log('Module Key:', getCurrentModuleKey())
    console.log('All Module Progress:', JSON.stringify(moduleProgress, null, 2))
    console.log('Current Module Progress:', JSON.stringify(currentProgress, null, 2))
    console.log('===================================')
  }, [selectedLanguage, selectedSubject, moduleProgress])

  // Load progress when language/subject changes
  useEffect(() => {
    if (selectedLanguage && selectedSubject && isAuthenticated) {
      loadProgressFromBackend()
    }
  }, [selectedLanguage, selectedSubject, isAuthenticated])

  // Load cached lesson/exercise on mount
  useEffect(() => {
    const cachedLesson = localStorage.getItem('cached_lesson')
    const cachedExercise = localStorage.getItem('cached_exercise')
    const cachedLanguage = localStorage.getItem('cached_language')
    const cachedSubject = localStorage.getItem('cached_subject')
    
    if (cachedLesson && cachedLanguage && cachedSubject) {
      console.log('📦 Loading cached lesson from localStorage')
      setCurrentLesson(JSON.parse(cachedLesson))
      setSelectedLanguage(cachedLanguage)
      setSelectedSubject(cachedSubject)
      setCurrentView('learning')
      
      if (cachedExercise) {
        console.log('📦 Loading cached exercise from localStorage')
        setCurrentExercise(JSON.parse(cachedExercise))
      }
    }
  }, [])

  // Check backend health on mount
  useEffect(() => {
    checkBackendHealth()
    checkAuth()
  }, [])

  const checkBackendHealth = async () => {
    try {
      const response = await apiClient.healthCheck()
      if (response.data) {
        setBackendStatus('online')
        console.log('Backend is online:', response.data)
      } else {
        setBackendStatus('offline')
        console.error('Backend health check failed:', response.error)
      }
    } catch (error) {
      setBackendStatus('offline')
      console.error('Backend health check error:', error)
    }
  }

  const checkAuth = async () => {
    // Since we're under /dash, the layout already handles auth
    // Just set authenticated to true and try to load user data
    setIsAuthenticated(true)
    
    try {
      // Try to get user info from backend if available
      const response = await apiClient.getCurrentUser()
      if (response.data) {
        setUser(response.data)
        if (response.data.geminiApiKey) {
          setApiKey(response.data.geminiApiKey)
        }
        await loadProgressFromBackend()
      }
    } catch (error) {
      console.error('Failed to load user data:', error)
      // Still allow access even if backend is down
    } finally {
      setIsLoading(false)
    }
  }

  const loadProgressFromBackend = async () => {
    try {
      console.log('🔄 Loading progress from backend for current selections...')
      
      // Only load progress if language and subject are selected
      if (!selectedLanguage || !selectedSubject) {
        console.log('⚠️ No language/subject selected, skipping progress load')
        return
      }
      
      const response = await apiClient.getProgress(selectedLanguage, selectedSubject)
      console.log('📦 Backend progress response:', response)
      
      if (response.data) {
        const key = `${selectedLanguage}-${selectedSubject}`
        const progressData = {
          lessonsViewed: response.data.progress > 0 ? Math.ceil(response.data.progress / 10) : 0,
          exercisesAttempted: response.data.completedExercises || 0,
          exercisesCorrect: response.data.completedExercises || 0
        }
        
        setModuleProgress(prev => ({
          ...prev,
          [key]: progressData
        }))
        
        console.log(`✅ Loaded progress for ${key}:`, progressData)
      }
    } catch (error) {
      console.error('❌ Failed to load progress from backend:', error)
    }
  }

  const handleUpdateApiKey = async () => {
    if (!apiKey) {
      setError('Please enter a valid Gemini API key')
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      console.log('Updating API key...')
      const response = await apiClient.updateApiKey(apiKey)
      
      if (response.error) {
        console.error('Failed to update API key:', response.error)
        setError(response.error)
      } else {
        console.log('API key updated successfully')
        // Update local user state
        if (user) {
          setUser({ ...user, geminiApiKey: apiKey })
        }
        setSuccessMessage('API key updated successfully!')
        setError(null)
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null)
        }, 3000)
      }
    } catch (error) {
      console.error('Error updating API key:', error)
      setError('Failed to update API key. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartLearning = async () => {
    if (!selectedLanguage || !selectedSubject) {
      setError('Please select programming language and subject')
      return
    }

    // Check if API key is set
    if (!apiKey) {
      setError('Please set your Gemini API key first')
      return
    }

    setError(null)
    setIsGenerating(true)
    setGenerationProgress(0)
    
    try {
      console.log('Starting learning with:', { selectedLanguage, selectedSubject, apiKey: apiKey.substring(0, 10) + '...' })
      
      // Beautiful generation steps
      const steps = [
        { text: 'Connecting to AI tutor...', duration: 800 },
        { text: 'Analyzing your learning preferences...', duration: 1000 },
        { text: 'Crafting personalized content...', duration: 1200 },
        { text: 'Generating interactive examples...', duration: 1000 },
        { text: 'Finalizing your lesson...', duration: 800 }
      ]

      for (let i = 0; i < steps.length; i++) {
        setGeneratingStep(steps[i].text)
        setGenerationProgress(((i + 1) / steps.length) * 100)
        await new Promise(resolve => setTimeout(resolve, steps[i].duration))
      }

      // Generate the actual lesson
      const response = await apiClient.generateLesson(selectedLanguage, selectedSubject)
      
      if (response.data) {
        setGeneratingStep('Lesson ready! 🎉')
        setGenerationProgress(100)
        await new Promise(resolve => setTimeout(resolve, 500))
        
        setCurrentLesson(response.data)
        setCurrentView('learning')
        console.log('Lesson generated successfully:', response.data)
        
        // Reload progress from backend after generating lesson
        console.log('� Reloading progress after lesson generation...')
        await loadProgressFromBackend()
        
        // Reset generation state
        setTimeout(() => {
          setGeneratingStep('')
          setGenerationProgress(0)
        }, 1000)
      } else {
        console.error('Failed to generate lesson:', response.error)
        setError(response.error || 'Failed to generate lesson')
        setGeneratingStep('')
        setGenerationProgress(0)
      }
    } catch (error) {
      console.error('Error in handleStartLearning:', error)
      setError('Failed to connect to the server. Please check your internet connection.')
      setGeneratingStep('')
      setGenerationProgress(0)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateExercise = async () => {
    if (!apiKey || !selectedLanguage || !selectedSubject) return

    setError(null)
    setIsGenerating(true)
    setGenerationProgress(0)
    
    try {
      // Beautiful exercise generation steps
      const exerciseSteps = [
        { text: 'Designing your challenge...', duration: 600 },
        { text: 'Creating starter code...', duration: 800 },
        { text: 'Preparing test cases...', duration: 700 },
        { text: 'Finalizing exercise...', duration: 500 }
      ]

      for (let i = 0; i < exerciseSteps.length; i++) {
        setGeneratingStep(exerciseSteps[i].text)
        setGenerationProgress(((i + 1) / exerciseSteps.length) * 100)
        await new Promise(resolve => setTimeout(resolve, exerciseSteps[i].duration))
      }

      const response = await apiClient.generateExercise(selectedLanguage, selectedSubject)
      
      if (response.data) {
        setGeneratingStep('Exercise ready! 💪')
        setGenerationProgress(100)
        await new Promise(resolve => setTimeout(resolve, 500))
        
        setCurrentExercise(response.data)
        setUserCode(response.data.starterCode)
        setFeedback(null)
        setOutput('')
        
        // Cache exercise to localStorage for offline access
        localStorage.setItem('cached_exercise', JSON.stringify(response.data))
        console.log('💾 Exercise cached to localStorage')
        
        // Reset generation state
        setTimeout(() => {
          setGeneratingStep('')
          setGenerationProgress(0)
        }, 1000)
      } else {
        setError(response.error || 'Failed to generate exercise')
        setGeneratingStep('')
        setGenerationProgress(0)
      }
    } catch (error) {
      console.error('Error generating exercise:', error)
      setError('Failed to connect to the server. Please check your internet connection.')
      setGeneratingStep('')
      setGenerationProgress(0)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmitSolution = async () => {
    if (!userCode || !currentExercise) return

    setError(null)
    setIsGenerating(true)
    try {
      const response = await apiClient.submitSolution(currentExercise.id, userCode)
      
      if (response.data) {
        setFeedback(response.data.feedback)
        
        // Update module-specific progress locally
        const moduleKey = getCurrentModuleKey()
        const isCorrect = response.data.feedback.isCorrect
        
        // Reload progress from backend after exercise submission
        console.log('🔄 Reloading progress after exercise submission...')
        await loadProgressFromBackend()
        
        // Show celebration if correct
        if (isCorrect) {
          setShowConfetti(true)
          setTimeout(() => setShowConfetti(false), 3000)
        }
      } else {
        setError(response.error || 'Failed to evaluate solution')
      }
    } catch (error) {
      setError('Failed to connect to the server. Please check your internet connection.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRunCode = async () => {
    if (!userCode) return
    
    setIsRunning(true)
    setRunOutput(null)
    setError(null)
    
    try {
      const response = await apiClient.runCode({
        language: selectedLanguage,
        code: userCode,
        stdin: stdinInput,
        timeout: 5,
      })
      
      if (response.data) {
        setRunOutput(response.data)
      } else {
        setError(response.error || 'Failed to run code')
      }
    } catch (error) {
      setError('Failed to run code. Make sure Judge0 is running.')
    } finally {
      setIsRunning(false)
    }
  }

  const loadProgress = async () => {
    if (!selectedLanguage || !selectedSubject) return
    
    try {
      const response = await apiClient.getProgress(selectedLanguage, selectedSubject)
      if (response.data) {
        setUserProgress(response.data)
      }
    } catch (error) {
      console.error('Failed to load progress:', error)
    }
  }

  useEffect(() => {
    if (selectedLanguage && selectedSubject && isAuthenticated) {
      loadProgress()
    }
  }, [selectedLanguage, selectedSubject, isAuthenticated])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-slate-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (currentView === 'setup') {
    return (
      <>
        <OfflineIndicator />
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">
        <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] bg-[size:50px_50px]" />
        
        <div className="relative max-w-6xl mx-auto p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl sm:rounded-2xl shadow-lg">
              <Code className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                AI Programming Tutor
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Welcome back, {user?.first_name || 'Student'}!</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Main Setup */}
            <Card className="lg:col-span-2 border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl dark:text-white">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                    <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  Configure Your Learning Session
                </CardTitle>
                <CardDescription className="text-sm sm:text-base dark:text-slate-400">
                  Set up your API key and choose your learning path
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 sm:space-y-8">
                {/* API Key Input */}
                <div className="space-y-3">
                  <Label htmlFor="apiKey" className="text-sm sm:text-base font-medium flex items-center gap-2 dark:text-slate-200">
                    <div className="w-2 h-2 bg-indigo-500 dark:bg-indigo-400 rounded-full" />
                    Gemini API Key
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="Enter your Gemini API key"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="h-10 sm:h-12 text-sm sm:text-base border-2 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors flex-1 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                    <Button 
                      onClick={handleUpdateApiKey}
                      disabled={!apiKey || isLoading}
                      variant="outline"
                      className="px-3 sm:px-4 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                    </Button>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <div className="w-1 h-1 bg-slate-400 dark:bg-slate-500 rounded-full" />
                    Your API key is securely stored in your profile
                  </p>
                </div>

                {/* Language Grid */}
                <div className="space-y-4">
                  <Label className="text-sm sm:text-base font-medium flex items-center gap-2 dark:text-slate-200">
                    <div className="w-2 h-2 bg-indigo-500 dark:bg-indigo-400 rounded-full" />
                    Programming Language
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {programmingLanguages.map((lang) => (
                      <Button
                        key={lang.value}
                        variant={selectedLanguage === lang.value ? "default" : "outline"}
                        onClick={() => setSelectedLanguage(lang.value)}
                        className={`h-14 sm:h-16 flex flex-col items-center justify-center gap-1 sm:gap-2 transition-all hover:scale-105 ${
                          selectedLanguage === lang.value 
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 border-0 shadow-lg text-white' 
                            : `border-2 ${lang.color} dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200 hover:border-indigo-400 dark:hover:border-indigo-500`
                        }`}
                      >
                        <span className="text-xl sm:text-2xl">{lang.icon}</span>
                        <span className="text-xs sm:text-sm font-medium">{lang.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Subject Selection */}
                <div className="space-y-4">
                  <Label className="text-sm sm:text-base font-medium flex items-center gap-2 dark:text-slate-200">
                    <div className="w-2 h-2 bg-indigo-500 dark:bg-indigo-400 rounded-full" />
                    Learning Subject
                  </Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={!selectedLanguage}>
                    <SelectTrigger className="h-10 sm:h-12 text-sm sm:text-base border-2 focus:border-indigo-500 dark:focus:border-indigo-400 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedLanguage && subjects[selectedLanguage as keyof typeof subjects]?.map((subject) => (
                        <SelectItem key={subject.value} value={subject.value} className="text-base">
                          {subject.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Start Button */}
                <Button 
                  onClick={handleStartLearning}
                  disabled={!apiKey || !selectedLanguage || !selectedSubject || isGenerating}
                  className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 dark:from-indigo-600 dark:to-purple-700 dark:hover:from-indigo-700 dark:hover:to-purple-800 transition-all transform hover:scale-[1.02] shadow-lg text-white"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 animate-spin" />
                      <span className="text-sm sm:text-base">Generating Your Personalized Lesson...</span>
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                      <span className="text-sm sm:text-base">Start Learning Journey</span>
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                    </>
                  )}
                </Button>

                {error && (
                  <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50">
                    <AlertDescription className="text-red-700 dark:text-red-300 text-sm">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
                
                {successMessage && (
                  <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/50">
                    <AlertDescription className="text-green-700 dark:text-green-300 text-sm">
                      {successMessage}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Stats Card */}
            <div className="space-y-4 sm:space-y-6">
              <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 text-white">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                    <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
                    {selectedLanguage && selectedSubject ? (
                      <div>
                        <div className="text-xs sm:text-sm font-normal text-indigo-100">
                          {programmingLanguages.find(l => l.value === selectedLanguage)?.label} - {subjects[selectedLanguage as keyof typeof subjects]?.find(s => s.value === selectedSubject)?.label}
                        </div>
                        <div className="text-sm sm:text-base">Module Progress</div>
                      </div>
                    ) : (
                      'Overall Learning Stats'
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedLanguage && selectedSubject ? (
                    // Show module-specific progress
                    <>
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div className="text-center bg-white/10 dark:bg-white/5 rounded-lg p-3">
                          <div className="text-2xl sm:text-3xl font-bold mb-1">{currentProgress.lessonsViewed}</div>
                          <div className="text-xs text-indigo-100">Lessons Studied</div>
                        </div>
                        <div className="text-center bg-white/10 dark:bg-white/5 rounded-lg p-3">
                          <div className="text-2xl sm:text-3xl font-bold mb-1">{currentProgress.exercisesCorrect}/{currentProgress.exercisesAttempted}</div>
                          <div className="text-xs text-indigo-100">Exercises Solved</div>
                        </div>
                      </div>
                      {currentProgress.exercisesAttempted > 0 && (
                        <>
                          <Progress value={(currentProgress.exercisesCorrect / currentProgress.exercisesAttempted) * 100} className="h-2 bg-indigo-400 dark:bg-indigo-500" />
                          <div className="text-sm text-indigo-100 text-center">
                            {Math.round((currentProgress.exercisesCorrect / currentProgress.exercisesAttempted) * 100)}% Success Rate
                          </div>
                        </>
                      )}
                      {currentProgress.exercisesAttempted === 0 && currentProgress.lessonsViewed === 0 && (
                        <div className="text-sm text-indigo-100 text-center py-2 bg-indigo-600/30 rounded">
                          ✨ Start learning to track your progress!
                        </div>
                      )}
                      {currentProgress.exercisesAttempted === 0 && currentProgress.lessonsViewed > 0 && (
                        <div className="text-sm text-indigo-100 text-center py-2">
                          Complete exercises to see your success rate
                        </div>
                      )}
                    </>
                  ) : (
                    // Show overall stats across all modules
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold mb-1">
                            {Object.values(moduleProgress).reduce((sum, mod) => sum + mod.lessonsViewed, 0)}
                          </div>
                          <div className="text-xs text-indigo-100">Total Lessons</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold mb-1">
                            {Object.values(moduleProgress).reduce((sum, mod) => sum + mod.exercisesCorrect, 0)}/
                            {Object.values(moduleProgress).reduce((sum, mod) => sum + mod.exercisesAttempted, 0)}
                          </div>
                          <div className="text-xs text-indigo-100">Total Exercises</div>
                        </div>
                      </div>
                      {Object.keys(moduleProgress).length > 0 ? (
                        <>
                          <div className="text-sm text-indigo-100 text-center py-2">
                            <div className="font-semibold mb-1">
                              {Object.keys(moduleProgress).length} Module{Object.keys(moduleProgress).length !== 1 ? 's' : ''} Started
                            </div>
                            <div className="text-xs opacity-80">
                              Select a module above to see detailed progress
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <div className="text-5xl mb-3">🚀</div>
                          <div className="text-sm text-indigo-100">
                            Select a language and topic above to start your learning journey!
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <User className="w-5 h-5 text-indigo-600" />
                    Profile Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <div className="text-slate-500">Name</div>
                    <div className="font-medium">{user?.first_name} {user?.last_name}</div>
                  </div>
                  <div className="text-sm">
                    <div className="text-slate-500">Email</div>
                    <div className="font-medium">{user?.email}</div>
                  </div>
                  <div className="text-sm">
                    <div className="text-slate-500">API Key Status</div>
                    <div className="font-medium">
                      {user?.geminiApiKey ? (
                        <Badge variant="secondary" className="text-green-700 bg-green-100">Configured</Badge>
                      ) : (
                        <Badge variant="outline" className="text-orange-700 border-orange-300">Not Set</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      </>
    )
  }

  // Learning view (similar to original but with backend integration)
  return (
    <>
      <OfflineIndicator />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] bg-[size:50px_50px]" />
      
      <div className="relative max-w-7xl mx-auto p-3 sm:p-4 lg:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 lg:mb-8 gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={() => setCurrentView('setup')}
              className="flex items-center gap-1.5 h-9 px-3 text-sm"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              <span className="hidden sm:inline">Back to Setup</span>
              <span className="sm:hidden">Back</span>
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 truncate">
                {currentLesson?.title || 'Smart Campus'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 truncate">
                {selectedLanguage} • {subjects[selectedLanguage as keyof typeof subjects]?.find(s => s.value === selectedSubject)?.label}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-left sm:text-right">
              <div className="text-xs sm:text-sm text-slate-500">Success Rate</div>
              <div className="font-bold text-sm sm:text-base">
                {currentProgress.exercisesAttempted > 0 
                  ? `${Math.round((currentProgress.exercisesCorrect / currentProgress.exercisesAttempted) * 100)}%`
                  : '—'}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Lesson Content */}
          <Card className="border-0 shadow-lg sm:shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                Lesson Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              {currentLesson ? (
                <>
                  <div className="mb-4 sm:mb-6">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-1.5 sm:p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg">
                        <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                      </div>
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {currentLesson.title}
                      </h3>
                    </div>
                    
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-indigo-100">
                      <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                        <span className="text-xs sm:text-sm font-semibold text-indigo-700 uppercase tracking-wide">Concept Overview</span>
                      </div>
                      <div className="prose prose-slate max-w-none">
                        <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                          {currentLesson.content}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-1.5 sm:p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
                        <Code className="w-5 h-5 text-green-600" />
                      </div>
                      <h4 className="text-xl font-semibold text-slate-800">Interactive Examples</h4>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        {currentLesson.examples.length} Examples
                      </Badge>
                    </div>
                    
                    <div className="space-y-4">
                      {currentLesson.examples.map((example, index) => (
                        <div key={index} className="group relative">
                          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                          <div className="relative bg-slate-900 text-slate-100 p-6 rounded-lg overflow-x-auto border border-slate-700">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-sm font-bold">
                                  {index + 1}
                                </div>
                                <span className="text-sm text-slate-400">Example {index + 1}</span>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-slate-400 hover:text-white hover:bg-slate-800"
                                onClick={() => {
                                  navigator.clipboard.writeText(example);
                                  // You could add a toast notification here
                                }}
                              >
                                Copy
                              </Button>
                            </div>
                            <pre className="text-sm font-mono leading-relaxed">
                              <code className="text-green-400">{example}</code>
                            </pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <BookOpen className="w-10 h-10 text-slate-400" />
                  </div>
                  <p className="text-slate-500 text-lg">No lesson loaded yet</p>
                  <p className="text-slate-400 text-sm mt-2">Generate a lesson to start learning!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Exercise Section */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-3">
                  <Code className="w-5 h-5 text-indigo-600" />
                  Practice Exercise
                </CardTitle>
                <Button 
                  onClick={handleGenerateExercise}
                  disabled={isGenerating}
                  variant="outline"
                  size="sm"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'New Exercise'
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentExercise ? (
                <>
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg">
                        <Target className="w-5 h-5 text-orange-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-800">{currentExercise.title}</h3>
                      <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                        Challenge
                      </Badge>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-5 h-5 text-orange-500" />
                        <span className="text-sm font-semibold text-orange-700 uppercase tracking-wide">Your Mission</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{currentExercise.description}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <Label htmlFor="codeEditor" className="text-base font-medium mb-3 flex items-center gap-2">
                      <div className="p-1 bg-slate-100 rounded">
                        <Code className="w-4 h-4 text-slate-600" />
                      </div>
                      Your Solution
                    </Label>
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                      <div className="relative bg-slate-900 text-slate-100 p-6 rounded-lg border border-slate-700">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              <div className="w-3 h-3 bg-red-500 rounded-full" />
                              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                              <div className="w-3 h-3 bg-green-500 rounded-full" />
                            </div>
                            <span className="text-xs text-slate-400 font-mono">solution.{selectedLanguage === 'javascript' ? 'js' : selectedLanguage === 'python' ? 'py' : 'txt'}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-slate-400 hover:text-white hover:bg-slate-800"
                            onClick={() => {
                              navigator.clipboard.writeText(userCode);
                            }}
                          >
                            Copy
                          </Button>
                        </div>
                        <textarea
                          id="codeEditor"
                          value={userCode}
                          onChange={(e) => setUserCode(e.target.value)}
                          className="w-full h-64 bg-transparent text-sm font-mono resize-none outline-none leading-relaxed"
                          placeholder="Write your solution here..."
                          spellCheck={false}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Run Code Section */}
                  <div className="mb-4 space-y-3">
                    <Label htmlFor="stdin" className="text-sm font-medium flex items-center gap-2">
                      <Code className="w-3 h-3" />
                      Input (stdin)
                    </Label>
                    <Input
                      id="stdin"
                      value={stdinInput}
                      onChange={(e) => setStdinInput(e.target.value)}
                      placeholder="Optional input for your program..."
                      className="font-mono text-sm"
                    />
                    
                    <Button
                      onClick={handleRunCode}
                      disabled={!userCode || isRunning || isGenerating}
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      {isRunning ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Run Code
                        </>
                      )}
                    </Button>

                    {runOutput && (
                      <div className="mt-3 border rounded-lg overflow-hidden">
                        <div className="bg-slate-50 dark:bg-slate-900 p-3 border-b">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium">Output</span>
                            <div className="flex gap-3 text-slate-600 dark:text-slate-400">
                              {runOutput.time && <span>Time: {runOutput.time}s</span>}
                              {runOutput.memory && <span>Memory: {runOutput.memory} KB</span>}
                              <span className={`font-medium ${runOutput.status?.id === 3 ? 'text-green-600' : 'text-orange-600'}`}>
                                {runOutput.status?.description}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 bg-slate-900 text-slate-100 font-mono text-sm">
                          {runOutput.stdout && (
                            <div>
                              <div className="text-green-400 text-xs mb-1">stdout:</div>
                              <pre className="whitespace-pre-wrap">{runOutput.stdout}</pre>
                            </div>
                          )}
                          {runOutput.stderr && (
                            <div className="mt-2">
                              <div className="text-red-400 text-xs mb-1">stderr:</div>
                              <pre className="whitespace-pre-wrap text-red-300">{runOutput.stderr}</pre>
                            </div>
                          )}
                          {runOutput.compileOutput && (
                            <div className="mt-2">
                              <div className="text-yellow-400 text-xs mb-1">compile output:</div>
                              <pre className="whitespace-pre-wrap text-yellow-300">{runOutput.compileOutput}</pre>
                            </div>
                          )}
                          {!runOutput.stdout && !runOutput.stderr && !runOutput.compileOutput && (
                            <span className="text-slate-500 italic">No output</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      onClick={handleSubmitSolution}
                      disabled={!userCode || isGenerating}
                      className="flex-1 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all transform hover:scale-[1.02] shadow-lg"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Evaluating...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Submit Solution
                        </>
                      )}
                    </Button>
                  </div>

                  {feedback && (
                    <Alert className={feedback.isCorrect ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}>
                      <div className="flex items-start gap-3">
                        {feedback.isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <AlertDescription className={feedback.isCorrect ? "text-green-700" : "text-orange-700"}>
                            <div className="font-medium mb-2">{feedback.message}</div>
                            {feedback.suggestions.length > 0 && (
                              <div className="mt-3">
                                <div className="font-medium mb-1">Suggestions:</div>
                                <ul className="list-disc list-inside text-sm space-y-1">
                                  {feedback.suggestions.map((suggestion, index) => (
                                    <li key={index}>{suggestion}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {feedback.improvements.length > 0 && (
                              <div className="mt-3">
                                <div className="font-medium mb-1">Areas for improvement:</div>
                                <ul className="list-disc list-inside text-sm space-y-1">
                                  {feedback.improvements.map((improvement, index) => (
                                    <li key={index}>{improvement}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </AlertDescription>
                        </div>
                      </div>
                    </Alert>
                  )}

                  {error && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-700">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <Code className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500 mb-4">No exercise loaded yet</p>
                  <Button 
                    onClick={handleGenerateExercise}
                    disabled={isGenerating}
                    variant="outline"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Generate Exercise'
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {isGenerating && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-slate-200">
            <div className="text-center">
              {/* Animated Brain Icon */}
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Brain className="w-10 h-10 text-white animate-pulse" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="w-6 h-6 text-yellow-500 animate-spin" />
                </div>
              </div>

              <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                AI Tutor is Working
              </h3>
              
              <p className="text-slate-600 mb-6 min-h-[2rem] flex items-center justify-center">
                {generatingStep && (
                  <span className="flex items-center gap-2">
                    <Wand2 className="w-4 h-4 animate-pulse" />
                    {generatingStep}
                  </span>
                )}
              </p>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
                <p className="text-sm text-slate-500 mt-2">{Math.round(generationProgress)}% Complete</p>
              </div>

              {/* Floating Elements */}
              <div className="flex justify-center gap-4 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '0s' }}>
                  <Lightbulb className="w-4 h-4 text-blue-600" />
                </div>
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '0.2s' }}>
                  <Star className="w-4 h-4 text-purple-600" />
                </div>
                <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '0.4s' }}>
                  <Rocket className="w-4 h-4 text-pink-600" />
                </div>
              </div>

              <p className="text-xs text-slate-400">
                Creating a personalized learning experience just for you...
              </p>
            </div>
          </div>
        </div>
      )}

      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
          <div className="text-6xl animate-bounce">🎉</div>
        </div>
      )}
    </div>
    </>
  )
}