// components/AISearchAssistant.tsx
"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Search, Bot, BookOpen, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

interface AISearchAssistantProps {
  subjectId?: number
  subjectName?: string
  className?: string
}

export function AISearchAssistant({ subjectId, subjectName, className }: AISearchAssistantProps) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState('')
  const [showAssistant, setShowAssistant] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error('Please enter a question')
      return
    }

    setLoading(true)
    setResponse('')
    
    try {
      const token = localStorage.getItem('token')
      const aiResponse = await fetch('http://localhost:3000/ai/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          query: query.trim(),
          subjectId,
          subjectName
        })
      })
      
      const data = await aiResponse.json()
      
      if (data.success) {
        setResponse(data.answer)
        setShowAssistant(true)
      } else {
        toast.error(data.error || 'Failed to get AI response')
      }
    } catch (error) {
      console.error('AI search failed:', error)
      toast.error('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const exampleQueries = [
    "Explain Pythagoras theorem",
    "What is Newton's first law of motion?",
    "How do I solve quadratic equations?",
    "Explain photosynthesis process",
    "What are arrays in programming?"
  ]

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Quick Access Button */}
      {!showAssistant && (
        <Button
          onClick={() => setShowAssistant(true)}
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Ask AI Assistant
        </Button>
      )}

      {/* Main Assistant Interface */}
      {showAssistant && (
        <Card className="border-2 border-purple-200">
          <CardContent className="p-4">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-2 rounded-full">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Smart Campus AI Assistant</h3>
                <p className="text-sm text-gray-600">
                  Ask me anything about {subjectName || 'your subjects'}! 🎓
                </p>
              </div>
            </div>

            {/* Search Input */}
            <div className="flex gap-2 mb-4">
              <Input
                placeholder={`Ask about ${subjectName || 'any subject'}...`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
                disabled={loading}
              />
              <Button 
                onClick={handleSearch} 
                disabled={loading || !query.trim()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Example Queries */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {exampleQueries.map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setQuery(example)}
                    className="text-xs"
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>

            {/* AI Response */}
            {response && (
              <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
                <div className="flex items-start gap-3">
                  <Bot className="w-5 h-5 text-purple-500 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium text-sm text-purple-600 mb-2">
                      AI Assistant Response
                    </div>
                    <div className="text-sm whitespace-pre-wrap leading-relaxed">
                      {response}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Close Button */}
            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAssistant(false)
                  setResponse('')
                  setQuery('')
                }}
              >
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}