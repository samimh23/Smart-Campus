'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, Clock, BookOpen, Brain } from 'lucide-react'
import { Loader2 } from 'lucide-react'
import apiService from '@/apiService/apiService'

type Quiz = {
  id: string
  subject: string
  topic: string
  difficulty: string
  data: any[]
  done: boolean
  correctAnswer?: number
  wrongAnswer?: number
  spentTime?: number
  createdAt: string
  language?: string
}

export default function QuizListPage() {
  const [quizzes, setQuizzes] = useState<any>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await apiService.get<Quiz>('/quiz')
        setQuizzes(res)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchQuizzes()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin text-slate-500" size={40} />
      </div>
    )
  }

  if (!quizzes.length) {
    return (
      <div className="text-center text-slate-500 py-20">
        No quizzes found. Try creating one!
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 p-4">
      {quizzes.map((quiz) => {
        const totalQuestions = quiz.questions?.length || 0
        const scorePercent = quiz.done
          ? Math.round((quiz.correctAnswer! / totalQuestions) * 100)
          : 0

        return (
          <Card
            key={quiz.id}
            className="relative border border-slate-200 hover:shadow-xl transition-all rounded-2xl overflow-hidden dark:bg-slate-800/80"
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span className="text-lg font-semibold text-slate-800 dark:text-white">
                  {quiz.subject}
                </span>
                <Badge
                  variant={
                    quiz.difficulty === 'easy'
                      ? 'secondary'
                      : quiz.difficulty === 'hard'
                      ? 'destructive'
                      : 'default'
                  }
                >
                  {quiz.difficulty}
                </Badge>
              </CardTitle>
              <p className="text-sm text-slate-500 mt-1">{quiz.topic}</p>
            </CardHeader>

            <CardContent>
              <div className="flex items-center gap-2 mb-3 text-sm text-slate-600">
                <BookOpen size={16} /> {totalQuestions} questions
              </div>

              {quiz.done ? (
                <div>
                  <div className="flex justify-between mb-1 text-xs text-slate-500">
                    <span>Progress</span>
                    <span>{scorePercent}%</span>
                  </div>
                  <Progress value={scorePercent} className="h-2 mb-3" />

                  <div className="flex gap-2 flex-wrap">
                    <div className='bg-green-100 text-green-600 rounded-lg py-1 px-2 text-[10px]'>
                      ✅ {quiz.correctAnswer} Correct
                    </div>
                    <div className='bg-red-100 text-red-600 rounded-lg py-1 px-2 text-[10px]'>
                      ❌ {quiz.wrongAnswer} Wrong
                    </div>
                    <Badge variant="outline">
                      🧠 {totalQuestions} Questions
                    </Badge>
                    {quiz.spentTime && (
                      <Badge variant="secondary">
                        <Clock size={14} className="mr-1" /> {quiz.spentTime}s
                      </Badge>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-2">
                  <Button
                    className="w-full dark:text-white"
                    onClick={() => router.push(`/dash/start-quiz/${quiz.id}`)}
                  >
                    Start Quiz
                  </Button>
                </div>
              )}
            </CardContent>

            <CardFooter className="pt-2 text-xs text-slate-400 flex justify-between">
              <span className="flex items-center gap-1">
                <Brain size={12} /> {quiz.language?.toUpperCase() || 'EN'}
              </span>
              <span>
                {new Date(quiz.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </CardFooter>

            {quiz.done && (
              <div className="absolute top-0 right-0 bg-green-100 text-green-600 text-xs px-3 py-1 rounded-bl-xl font-medium">
                <CheckCircle size={12} className="inline mr-1" /> Done
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}