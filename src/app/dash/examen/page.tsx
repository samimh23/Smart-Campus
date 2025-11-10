"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import apiService from "@/apiService/apiService";
import axios from "axios";

export default function ExamPage() {
  const [topic, setTopic] = useState("");
  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function createExam() {
    setLoading(true);
    const res = await apiService.post("/exam", { topic });
    setExam(res);
    setLoading(false);
  }

  if (exam)
    return (
      <div className="p-2 lg:p-6 space-y-6">
        <h1 className="text-3xl font-bold">{exam.exam_title}</h1>
        <p className="text-gray-600">
          Topic: {exam.topic} • Duration: {exam.duration_minutes} mins
        </p>

        {exam.questions.map((q: any, i: number) => (
          <QuestionBox key={i} question={q} />
        ))}
      </div>
    );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-3xl p-10 max-w-lg w-full text-center border border-gray-200 dark:border-gray-700 transition-all duration-300">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
            ✨ Create AI Exam
        </h1>

        <p className="text-gray-600 dark:text-gray-300 mb-6">
            Enter a topic and let AI generate a custom exam for you.
        </p>

        <Input
            placeholder="e.g. French Revolution"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="mb-6 text-center bg-gray-100 dark:bg-gray-700 border-0 focus:ring-2 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-gray-300 rounded-xl py-3 transition-all duration-200"
        />

        <Button
            onClick={createExam}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-indigo-500 hover:to-blue-500 text-white py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0"
        >
            {loading ? "Generating..." : "Generate Exam"}
        </Button>

        {loading && (
            <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm animate-pulse">
            AI is conjuring your exam… ✨
            </p>
        )}
        </div>
    </div>
    );
}

function QuestionBox({ question }: any) {
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<any>(null);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [chatMsg, setChatMsg] = useState("");
  const [showChat, setShowChat] = useState(false);

  async function checkAnswer() {
    const res = await apiService.post("/exam/check", {
      question: question.question,
      expectedAnswer: question.expected_answer,
      studentAnswer: answer,
    });
    setResult(res);
  }

  async function sendChat() {
    const newMessages = [...messages, { role: "user", content: chatMsg }];
    const res = await axios.post("http://localhost:5000/exam/chat", {
      question: question.question,
      messages: newMessages,
    });
    setMessages([...newMessages, { role: "assistant", content: res.data.reply }]);
    setChatMsg("");
  }

  return (
    <Card className="p-2 lg:p-4">
      <CardContent>
        <h2 className="font-semibold mb-2">
          {question.id}. {question.question}
        </h2>
        <Textarea
          placeholder="Write your answer here..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
        <div className="flex gap-3 mt-3">
          <Button onClick={checkAnswer}>Check Answer</Button>
          <Button variant="secondary" onClick={() => setShowChat(!showChat)}>
            Ask AI
          </Button>
        </div>

        {result && (
          <div className="mt-3 p-3 border rounded-md bg-gray-50">
            <p className="font-medium">
              Score: {result.score}/10 •{" "}
              <span
                className={
                  result.is_correct ? "text-green-600" : "text-red-600"
                }
              >
                {result.is_correct ? "Correct" : "Needs Improvement"}
              </span>
            </p>
            <p className="text-gray-700 mt-1">{result.feedback}</p>
            <p className="text-sm text-gray-500">{result.explanation}</p>
          </div>
        )}

        {showChat && (
          <div className="mt-4 border-t pt-3">
            <h4 className="font-semibold mb-2">Ask AI about this question</h4>
            <div className="h-40 overflow-y-auto border p-2 mb-2 rounded-md bg-gray-50">
              {messages.map((m, i) => (
                <p
                  key={i}
                  className={
                    m.role === "user" ? "text-blue-700" : "text-gray-800"
                  }
                >
                  <strong>{m.role === "user" ? "You" : "AI"}:</strong>{" "}
                  {m.content}
                </p>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={chatMsg}
                onChange={(e) => setChatMsg(e.target.value)}
                placeholder="Ask about this question..."
              />
              <Button onClick={sendChat}>Send</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}