'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import apiService from '@/apiService/apiService'
import { Button } from '@/components/ui/button'
import { CheckCircleIcon, ClockIcon, XCircleIcon } from 'lucide-react'
// import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/solid'

type Question = {
  question: string
  options: string[]
  correct_option: number
  explanation: string
}

type Quiz = {
  id: number
  subject: string
  topic: string
  difficulty: string
  language: string
  questions: Question[]
}

export default function StartQuizPage() {
  const { id } = useParams()
  const router = useRouter()
  const [quiz, setQuiz] = useState<any | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)
  const [timer, setTimer] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const timerRef = useRef<any | null>(null)

  // Fetch quiz
  useEffect(() => {
    async function fetchQuiz() {
      try {
        const res = await apiService.get<Quiz>(`/quiz/${id}`)
        setQuiz(res)
      } catch (err) {
        console.error(err)
      }
    }
    fetchQuiz()
  }, [id])

  // Timer
  useEffect(() => {
    if (!quiz) return
    timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [quiz])

  if (!quiz) return <div className="p-6 text-center">Loading quiz...</div>
  const question = quiz.questions[currentIndex]

  const handleSelect = (index: number) => setSelected(index)

  const handleValidate = () => {
    if (selected === null) return
    const isCorrect = selected === question.correct_option
    if (isCorrect) setCorrectCount((c) => c + 1)
    else setWrongCount((c) => c + 1)
    setAnswered((a) => a + 1)
    setShowExplanation(true)
  }

  const handleNext = () => {
    setSelected(null)
    setShowExplanation(false)
    if (currentIndex + 1 < quiz.questions.length) {
      setCurrentIndex((i) => i + 1)
    } else {
      setShowResults(true)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  const handleFinishQuiz = async () => {
    try {
      await apiService.post(`/quiz/${id}/complete`, {
        correct: correctCount,
        wrong: wrongCount,
        time: timer,
      })
      router.push('/student/quiz')
    } catch (err) {
      console.error('Error submitting results', err)
      router.push('/student/dashboard')
    }
  }

  // Timer formatting
  const minutes = Math.floor(timer / 60)
  const seconds = timer % 60
  const total = quiz.questions.length
  const percentage = Math.round((correctCount / total) * 100)

  // === RESULTS SCREEN ===
  if (showResults) {
    return (
      <div className="min-h-[calc(100vh-100px)] flex flex-col justify-center items-center p-6 bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-950 dark:to-blue-950 animate-fade-in transition-all duration-700">
        <div className="bg-white/90 dark:bg-slate-800/90 p-8 rounded-3xl shadow-lg max-w-md w-full text-center animate-fade-in">
          <h2 className="text-2xl font-bold mb-4">🎉 Quiz Completed!</h2>

          <div className="flex justify-center mb-6">
            <div className="relative inline-flex items-center justify-center w-28 h-28 rounded-full bg-green-100 dark:bg-green-900">
              <span className="text-3xl font-bold text-green-700 dark:text-green-300">{percentage}%</span>
            </div>
          </div>

          <div className="text-left mb-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium">Correct Answers: {correctCount}</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <XCircleIcon className="w-5 h-5 text-red-500" />
              <span className="text-sm font-medium">Wrong Answers: {wrongCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium">
                Time: {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Progress Bars */}
          {/* <div className="space-y-2 mb-6">
            <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-3 bg-green-500 transition-all duration-700"
                style={{ width: `${(correctCount / total) * 100}%` }}
              />
            </div>
            <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-3 bg-red-500 transition-all duration-700"
                style={{ width: `${(wrongCount / total) * 100}%` }}
              />
            </div>
          </div> */}

          <Button onClick={handleFinishQuiz} className="px-6 py-2 font-semibold">
            ✅ Finish Quiz
          </Button>
        </div>
      </div>
    )
  }

  // === QUIZ SCREEN ===
  return (
    <div className="min-h-[calc(100vh-100px)] p-3 lg:p-6 flex flex-col items-center bg-gradient-to-br from-indigo-50 via-white to-blue-100 dark:from-slate-900 dark:via-slate-950 dark:to-blue-950 animate-fade-in transition-all duration-700">
      {/* Quiz Info */}
      <div className="w-full max-w-2xl mb-4 flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="flex gap-2 flex-wrap">
            {/* <span className='flex items-end'>
                <span className='text-3xl text-indigo-600'>{currentIndex + 1}</span><span className='text-xs'>/{quiz.questions.length}</span>
            </span> */}
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

        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
          ⏱ {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')} | ✅ {correctCount} | ❌ {wrongCount}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-2xl h-[5px] bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden mb-6">
        <div
          className="h-[5px] bg-blue-600 dark:bg-blue-500 transition-all duration-500"
          style={{ width: `${((currentIndex) / quiz.questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="w-full max-w-2xl bg-white/90 dark:bg-slate-800/90 rounded-2xl p-3 lg:p-6 shadow-lg animate-fade-in transition-all duration-500">
        <h2
  className="flex items-center gap-3 p-3 sm:p-4 rounded-xl mb-6 
  bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 
  shadow-sm transition-all duration-300 text-slate-800 dark:text-slate-100 
  text-base sm:text-sm font-semibold"
>
  <span className="flex items-center justify-center w-4 h-4 sm:w-10 sm:h-10 
    rounded-full bg-indigo-600 text-sm text-white">
    Q{currentIndex + 1}
  </span>
  <span className="flex-1 leading-snug text-sm md:text-[16px]">{question.question}</span>
</h2>

        <div className="flex flex-col gap-3">
          {question.options.map((opt, i) => {
            // Default styles
            let bg = 'bg-gray-50 dark:bg-slate-700 border-gray-100'
            let spanBg = 'bg-gray-100 text-gray-600'

            // When selected but not validated yet
            if (selected === i && !showExplanation) {
                bg = 'bg-indigo-50 dark:bg-yellow-600 border-indigo-400'
                spanBg = 'bg-indigo-100 text-indigo-600'
            }

            // When validation shown
            if (showExplanation) {
                if (i === question.correct_option) {
                bg = 'bg-green-300 dark:bg-green-600 border-green-400'
                spanBg = 'bg-green-100 text-green-700 dark:text-white'
                } else if (i === selected && i !== question.correct_option) {
                bg = 'bg-red-300 dark:bg-red-600 border-red-400'
                spanBg = 'bg-red-100 text-red-700 dark:text-white'
                }
            }

            return (
                <button
                key={i}
                className={`${bg} flex items-center gap-4 rounded-lg text-sm lg:text-md p-3 border-[3px] text-left hover:scale-[1.02] transition-all duration-200`}
                onClick={() => handleSelect(i)}
                disabled={showExplanation}
                >
                <span
                    className={`flex items-center justify-center rounded-full size-[25px] text-xs font-semibold ${spanBg} transition-all duration-200`}
                >
                    {i + 1}
                </span>
                {opt}
                </button>
            )
            })}
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div className="mt-4 p-3 bg-gray-100 dark:bg-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 animate-fade-in transition-all duration-500">
            💡 {question.explanation}
          </div>
        )}

        {/* Buttons */}
        <div className="mt-4 flex justify-center gap-2">
          {!showExplanation ? (
            <Button onClick={handleValidate} disabled={selected === null}>
              Validate
            </Button>
          ) : (
            <Button onClick={handleNext}>
              {currentIndex + 1 === quiz.questions.length ? 'Get My Result' : 'Next Question'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}