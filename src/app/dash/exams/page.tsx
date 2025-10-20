'use client';

import { useEffect, useState } from 'react';
import { Loader2, BookOpen, Clock, CheckCircle } from 'lucide-react';
import apiService from '@/apiService/apiService';

interface Exam {
  id: number;
  exam_title: string;
  subject: string;
  topic?: string;
  difficulty: string;
  language: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  score: number;
  completed: boolean;
  duration_minutes?: number;
  createdAt: string;
}

export default function ExamsPage() {
  const [exams, setExams] = useState<any>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await apiService.get('/exam');
        setExams(res);
      } catch (error) {
        console.error('❌ Error fetching exams:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  if (!exams.length) {
    return (
      <div className="text-center text-gray-600 dark:text-gray-300 mt-20">
        No exams found.
      </div>
    );
  }

  return (
    <div className="min-h-screen  text-gray-900 dark:text-gray-100 p-6 transition-colors duration-300">
      <h1 className="text-3xl font-bold mb-8 text-center">📚 My Exams</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700"
          >
            <div className="p-5">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold truncate">
                  {exam.exam_title || 'Untitled Exam'}
                </h2>
                {exam.completed ? (
                  <CheckCircle className="text-green-500 w-5 h-5" />
                ) : (
                  <BookOpen className="text-blue-500 w-5 h-5" />
                )}
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                <strong>Subject:</strong> {exam.subject}
              </p>
              {exam.topic && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <strong>Topic:</strong> {exam.topic}
                </p>
              )}

              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-3">
                <span>
                  <Clock className="inline w-4 h-4 mr-1" />
                  {exam.duration_minutes ?? 0} min
                </span>
                <span>
                  🧩 {exam.totalQuestions} Qs
                </span>
              </div>

              <div className="mt-4">
                {exam.completed ? (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-500">Score: {exam.score}%</span>
                    <span className="text-gray-500">
                      ✅ {exam.correctAnswers} / ❌ {exam.wrongAnswers}
                    </span>
                  </div>
                ) : (
                  <button
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-sm font-medium transition"
                  >
                    Start Exam
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}