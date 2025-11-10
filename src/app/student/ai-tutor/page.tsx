'use client';

import { useState, useEffect } from 'react';
import { Conversation } from '@elevenlabs/client';

export default function AITutorPage() {
  const [conversation, setConversation] = useState<any>(null);
  const [status, setStatus] = useState<'idle' | 'listening' | 'speaking' | 'exam'>('idle');
  const [exam, setExam] = useState<{ topic: string; questions: string[]; answers: string[] } | null>(null);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [results, setResults] = useState<string[]>([]);

  const agentId = "agent_8801k7vxq2qeeaj97p6bcr8hxjmj";

  const startConversation = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const session = await Conversation.startSession({
        agentId,
        connectionType: 'webrtc',
        clientTools: {
          createExamen: async ({ topic, questions, answers }) => {
            console.log('Exam created:', { topic, questions, answers });
            setExam({ topic, questions, answers });
            setStatus('exam');
            setUserAnswers([]);
            // setResults([]);
            return 'exam ready';
          },
        },
        onModeChange: (m) => setStatus(m.mode as any),
        onMessage: (msg) => console.log('Agent message:', msg),
        onConnect: () => console.log('Connected to AI tutor'),
        onDisconnect: () => setStatus('idle'),
        onError: (err) => console.error('Agent error:', err),
      });

      setConversation(session);
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  };

  const handleAnswer = (index: number, answer: string) => {
    if (!exam) return;
    const correct = exam.answers[index].trim().toLowerCase() === answer.trim().toLowerCase();
    setResults((prev) => {
      const newResults = [...prev];
      newResults[index] = correct ? '✅ Correct' : '❌ Incorrect';
      return newResults;
    });
    if (conversation) {
      conversation.sendUserMessage(`My answer for question ${index + 1} is: ${answer}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100 flex flex-col items-center justify-center p-6">
      <div
        className={`relative w-full max-w-3xl bg-white shadow-2xl rounded-3xl border-4 border-indigo-400 transition-all duration-300 p-8 text-center ${
          status === 'speaking' ? 'animate-pulse border-indigo-600' : ''
        }`}
      >
        <h1 className="text-3xl font-bold mb-4 text-indigo-700">🎓 AI Study Tutor</h1>
        <p className="text-gray-600 mb-6">
          {status === 'idle'
            ? 'Click start to begin your tutoring session.'
            : status === 'listening'
            ? 'Listening... Speak your question.'
            : status === 'speaking'
            ? 'AIA is speaking...'
            : status === 'exam'
            ? 'Exam in progress!'
            : ''}
        </p>

        {!exam && (
          <button
            onClick={startConversation}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow-md transition-all"
          >
            🎤 Start Session
          </button>
        )}

        {exam && (
          <div className="mt-8 text-left">
            <h2 className="text-xl font-semibold text-indigo-700 mb-4">
              Topic: {exam.topic}
            </h2>
            {exam.questions.map((q, i) => (
              <div key={i} className="mb-6 p-4 border rounded-xl bg-gray-50">
                <p className="font-medium mb-2">
                  {i + 1}. {q}
                </p>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg"
                  placeholder="Your answer..."
                  onBlur={(e) => handleAnswer(i, e.target.value)}
                />
                {results[i] && (
                  <p
                    className={`mt-2 font-semibold ${
                      results[i].includes('✅') ? 'text-green-600' : 'text-red-500'
                    }`}
                  >
                    {results[i]}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}