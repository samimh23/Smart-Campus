'use client'

import { useState } from 'react'
import { Sparkles, SendHorizonal, Loader2, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import apiService from '@/apiService/apiService'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'

type Quiz = {
  id: number
  subject: string
  topic: string
  difficulty: string
  language: string
  questions: { question: string; options: string[]; correct_option: number; explanation: string }[]
  done: boolean
  createdAt: string
  updatedAt: string
}

export default function AddQuizPage() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [quiz, setQuiz] = useState<any | null>(null)
  const [language, setLanguage] = useState('en')
  const [difficulty, setDifficulty] = useState('easy')
  const [questionCount, setQuestionCount] = useState(5)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return
    setLoading(true)
    setQuiz(null)

    var msg = prompt + ', language = ' + language + ', difficulty: ' + difficulty + ', number of questions: ' + questionCount;

    try {
      const res = await apiService.post<Quiz>('/quiz', {
        usermsg: msg,
        // language,
        // difficulty,
        // questionCount,
      })
      setQuiz(res)
    } catch (err) {
      console.error(err)
      alert('⚠️ Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleStartQuiz = () => {
    if (!quiz) return
    router.push(`/student/start-quiz/${quiz.id}`)
  }

  // helper
  const selectBtn = (label: string, active: boolean) =>
    clsx(
      'px-4 py-2 rounded-lg border text-xs transition-all duration-200 cursor-pointer select-none',
      active
        ? 'bg-blue-100 border-blue-400 text-blue-700 dark:bg-blue-800 dark:text-blue-100'
        : 'bg-gray-50 border-gray-200 text-slate-600 hover:bg-gray-100 dark:bg-slate-800 dark:text-slate-300'
    )

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-100px)] p-4 bg-gradient-to-br from-indigo-50 via-white to-blue-100 dark:from-slate-900 dark:via-slate-950 dark:to-blue-950 transition-all">
      {!quiz ? (
        // CREATE FORM
        <Card className="max-w-[700px] w-full shadow-xl rounded-2xl border-none bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg animate-fade-in transition-all duration-700">
          <CardHeader className="text-center space-y-3">
            <div className="flex justify-center">
              <Sparkles className="w-10 h-10 text-blue-600 animate-pulse" />
            </div>
            <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-white">
              Create Your Magic Quiz 🪄
            </CardTitle>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Describe your quiz topic, choose options, and let AI do the rest!
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Language */}
              <div className='text-center'>
                <h3 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                  Language
                </h3>
                <div className="flex gap-2 flex-wrap justify-center">
                  {['en', 'fr', 'ar'].map((lang) => (
                    <div
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={selectBtn(lang.toUpperCase(), language === lang)}
                    >
                      {lang.toUpperCase()}
                    </div>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div className='text-center'>
                <h3 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                  Difficulty
                </h3>
                <div className="flex gap-2 flex-wrap justify-center">
                  {['easy', 'medium', 'hard'].map((lvl) => (
                    <div
                      key={lvl}
                      onClick={() => setDifficulty(lvl)}
                      className={selectBtn(lvl, difficulty === lvl)}
                    >
                      {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Number of Questions */}
              <div className='text-center'>
                <h3 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                  Number of Questions
                </h3>
                <div className="flex gap-2 flex-wrap justify-center">
                  {[5, 7, 10].map((num) => (
                    <div
                      key={num}
                      onClick={() => setQuestionCount(num)}
                      className={selectBtn(`${num}`, questionCount === num)}
                    >
                      {num === 10 ? '10+' : num}
                    </div>
                  ))}
                </div>
              </div>


              {/* Prompt */}
              <Textarea
                className="rounded-xl bg-gray-50 p-3 text-base focus:ring-2 focus:ring-blue-500 dark:text-white dark:bg-slate-900/60 transition-all"
                placeholder="e.g. Create a quiz about World War II or React basics..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
              />

              {/* Submit */}
              <Button
                type="submit"
                className="w-full lg:w-[45%] mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-600 hover:to-blue-700 text-white font-medium rounded-xl flex items-center justify-center space-x-2 shadow-md transition-all duration-300"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <SendHorizonal className="w-5 h-5" />
                    <span>Generate Quiz</span>
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        // QUIZ INFO AFTER CREATION
        <Card className="max-w-md w-full shadow-xl rounded-2xl border-none bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg p-6 text-center space-y-4 animate-fade-in transition-all duration-700">
          <div className="flex justify-center">
            <Sparkles className="w-10 h-10 text-blue-600 animate-pulse" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Quiz Ready! 🎉
          </h2>

          {/* BADGES */}
          <div className="flex justify-center gap-2 mt-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-indigo-200 text-indigo-800 dark:bg-indigo-700 dark:text-indigo-100 text-sm font-semibold">
              {quiz.subject}
            </span>
            <span className="px-3 py-1 rounded-full bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-100 text-sm font-semibold">
              {quiz.difficulty}
            </span>
            <span className="px-3 py-1 rounded-full bg-purple-200 text-purple-800 dark:bg-purple-700 dark:text-purple-100 text-sm font-semibold">
              {quiz.questions.length} Questions
            </span>
          </div>

          <p className="text-slate-600 dark:text-slate-300 text-sm mt-2">
            Topic: {quiz.topic} <br />
            Language: {quiz.language}
          </p>

          <Button
            className="mt-4 w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-teal-600 hover:to-green-700 text-white font-medium rounded-xl flex items-center justify-center space-x-2 shadow-lg transition-all duration-300"
            onClick={handleStartQuiz}
          >
            <Play className="w-5 h-5" />
            <span>Start Quiz</span>
          </Button>
        </Card>
      )}
    </div>
  )
}