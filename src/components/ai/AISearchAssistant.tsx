// components/AISearchAssistant.tsx
"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Search, Bot, BookOpen, Loader2, Sparkles, AlertCircle, User, MapPin, FileText, Target, X, Zap, Brain, GraduationCap, TrendingUp, Clock } from 'lucide-react'
import { toast } from 'sonner'

interface AISearchAssistantProps {
  subjectId?: number
  subjectName?: string
  className?: string
}

interface AIResponse {
  answer: string;
  source: string;
  teacher: string;
  subject: string;
  location: string;
  summary: string;
  confidence: number;
  courseAnalysis?: string;
  relatedCourses?: Array<{
    title: string;
    teacher: string;
    subject: string;
    relevance: number;
    filePath?: string;
  }>;
  exactMatch?: boolean;
}

export function AISearchAssistant({ subjectId, subjectName, className }: AISearchAssistantProps) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<AIResponse | null>(null)
  const [showAssistant, setShowAssistant] = useState(false)
  const [error, setError] = useState('')

  const testAIConnection = async () => {
    try {
      const token = localStorage.getItem('token')
      const healthResponse = await fetch('http://localhost:3000/ai/health', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await healthResponse.json()
      return data.healthy
    } catch (error) {
      console.error('AI health check failed:', error)
      return false
    }
  }

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error('Please enter a question')
      return
    }

    setLoading(true)
    setResponse(null)
    setError('')
    
    try {
      // Test AI connection first
      const isAIHealthy = await testAIConnection()
      
      if (!isAIHealthy) {
        setError('AI service is currently unavailable. Please try again later.')
        toast.error('AI service is temporarily unavailable')
        return
      }

      const token = localStorage.getItem('token')
      const aiResponse = await fetch('http://localhost:3000/ai/course-search', {
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
      console.log('🤖 AI Response:', data)
      
      if (data.success && data.data) {
        setResponse(data.data)
        setShowAssistant(true)
        toast.success(`AI found information with ${Math.round(data.data.confidence * 100)}% confidence!`)
      } else {
        setError(data.error || 'Failed to get AI response')
        toast.error(data.error || 'AI service error')
      }
    } catch (error) {
      console.error('AI search failed:', error)
      setError('Network error. Please check your connection.')
      toast.error('Network error occurred')
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

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400 bg-green-900/30 border-green-800'
    if (confidence >= 0.5) return 'text-yellow-400 bg-yellow-900/30 border-yellow-800'
    return 'text-red-400 bg-red-900/30 border-red-800'
  }

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'High confidence'
    if (confidence >= 0.5) return 'Medium confidence'
    return 'Low confidence'
  }

  // Function to parse markdown-like analysis into structured data
  const parseCourseAnalysis = (analysis: string) => {
    const sections: { title: string; content: string; icon: React.ReactNode }[] = [];
    
    // Split by **bold** sections which are our headings
    const lines = analysis.split('\n').filter(line => line.trim());
    
    let currentSection = { title: '', content: '' };
    
    lines.forEach(line => {
      if (line.startsWith('**') && line.endsWith('**')) {
        // If we have a previous section, save it
        if (currentSection.title) {
          sections.push({
            ...currentSection,
            icon: getSectionIcon(currentSection.title)
          });
        }
        // Start new section
        currentSection = {
          title: line.replace(/\*\*/g, '').trim(),
          content: ''
        };
      } else if (currentSection.title) {
        // Add content to current section
        currentSection.content += (currentSection.content ? '\n' : '') + line.trim();
      }
    });
    
    // Don't forget the last section
    if (currentSection.title) {
      sections.push({
        ...currentSection,
        icon: getSectionIcon(currentSection.title)
      });
    }
    
    return sections;
  };

  const getSectionIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('content') || lowerTitle.includes('overview')) {
      return <BookOpen className="w-4 h-4" />;
    } else if (lowerTitle.includes('learning') || lowerTitle.includes('objective')) {
      return <GraduationCap className="w-4 h-4" />;
    } else if (lowerTitle.includes('difficulty') || lowerTitle.includes('level')) {
      return <TrendingUp className="w-4 h-4" />;
    } else if (lowerTitle.includes('practical') || lowerTitle.includes('application')) {
      return <Brain className="w-4 h-4" />;
    } else if (lowerTitle.includes('study') || lowerTitle.includes('recommendation')) {
      return <Clock className="w-4 h-4" />;
    } else if (lowerTitle.includes('career') || lowerTitle.includes('relevance')) {
      return <Zap className="w-4 h-4" />;
    }
    return <BookOpen className="w-4 h-4" />;
  };

  const getSectionColor = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('content') || lowerTitle.includes('overview')) {
      return 'from-purple-500/20 to-purple-600/20 border-purple-500/30';
    } else if (lowerTitle.includes('learning') || lowerTitle.includes('objective')) {
      return 'from-blue-500/20 to-blue-600/20 border-blue-500/30';
    } else if (lowerTitle.includes('difficulty') || lowerTitle.includes('level')) {
      return 'from-green-500/20 to-green-600/20 border-green-500/30';
    } else if (lowerTitle.includes('practical') || lowerTitle.includes('application')) {
      return 'from-orange-500/20 to-orange-600/20 border-orange-500/30';
    } else if (lowerTitle.includes('study') || lowerTitle.includes('recommendation')) {
      return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30';
    } else if (lowerTitle.includes('career') || lowerTitle.includes('relevance')) {
      return 'from-red-500/20 to-red-600/20 border-red-500/30';
    }
    return 'from-gray-500/20 to-gray-600/20 border-gray-500/30';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Quick Access Button */}
      {!showAssistant && (
        <Button
          onClick={() => setShowAssistant(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Ask AI Assistant
          <Zap className="w-4 h-4 ml-2" />
        </Button>
      )}

      {/* Main Assistant Interface */}
      {showAssistant && (
        <Card className="border border-gray-700 bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl backdrop-blur-sm">
          <CardContent className="p-6">
            {/* Header with Close Button */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-xl shadow-lg">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white">Smart Campus AI</h3>
                  <p className="text-sm text-gray-400">
                    Ask me anything about {subjectName || 'your courses'} 📚
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAssistant(false)
                  setResponse(null)
                  setQuery('')
                  setError('')
                }}
                className="text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-4 p-4 bg-red-900/20 border border-red-800 rounded-xl">
                <div className="flex items-center gap-3 text-red-400">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}

            {/* Search Input */}
            <div className="flex gap-3 mb-6">
              <Input
                placeholder={`Ask about ${subjectName || 'any subject'}...`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
                disabled={loading}
              />
              <Button 
                onClick={handleSearch} 
                disabled={loading || !query.trim()}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl shadow-lg transition-all duration-300 min-w-[100px]"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>

            {/* Example Queries */}
            <div className="mb-6">
              <p className="text-sm text-gray-400 mb-3 font-medium">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {exampleQueries.map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setQuery(example)
                      setError('')
                    }}
                    className="text-xs bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500 rounded-lg transition-colors"
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>

            {/* AI Response */}
            {response && (
              <div className="mt-6 space-y-6 animate-in fade-in duration-500">
                {/* Confidence & Match Badges */}
                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${getConfidenceColor(response.confidence)}`}>
                    <Target className="w-4 h-4" />
                    <span className="font-medium">
                      {getConfidenceText(response.confidence)} ({Math.round(response.confidence * 100)}%)
                    </span>
                  </div>
                  {response.exactMatch && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-900/30 border border-green-800 text-green-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="font-medium">Exact Match</span>
                    </div>
                  )}
                </div>

                {/* Main Answer */}
                <div className="p-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-2xl border border-purple-500/20 backdrop-blur-sm">
                  <div className="flex items-start gap-4">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg shadow-lg flex-shrink-0">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="font-semibold text-purple-400 text-sm uppercase tracking-wide">
                          AI Response
                        </div>
                        <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                        <div className="text-xs text-gray-400">
                          Smart Campus AI
                        </div>
                      </div>
                      <div className="text-gray-200 leading-relaxed text-base">
                        {response.answer}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Analysis - NEW SECTION */}
                {response.courseAnalysis && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-2 rounded-lg">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-white">Course Analysis</h4>
                        <p className="text-sm text-gray-400">AI-powered insights about the course content</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {parseCourseAnalysis(response.courseAnalysis).map((section, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-xl border bg-gradient-to-br ${getSectionColor(section.title)} backdrop-blur-sm hover:shadow-lg transition-all duration-300`}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="bg-white/10 p-2 rounded-lg">
                              {section.icon}
                            </div>
                            <h5 className="font-semibold text-white text-sm uppercase tracking-wide">
                              {section.title}
                            </h5>
                          </div>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {section.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary */}
                {response.summary && (
                  <div className="p-5 bg-blue-900/20 rounded-xl border border-blue-500/20">
                    <div className="flex items-start gap-3">
                      <BookOpen className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-blue-400 text-sm uppercase tracking-wide mb-2">
                          Quick Summary
                        </div>
                        <div className="text-gray-300 text-sm leading-relaxed">
                          {response.summary}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Source Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                    <div className="flex items-center gap-3 mb-3">
                      <BookOpen className="w-4 h-4 text-purple-400" />
                      <div className="font-semibold text-gray-300 text-sm">Source</div>
                    </div>
                    <div className="text-gray-400 text-sm">{response.source}</div>
                  </div>

                  <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                    <div className="flex items-center gap-3 mb-3">
                      <User className="w-4 h-4 text-blue-400" />
                      <div className="font-semibold text-gray-300 text-sm">Teacher</div>
                    </div>
                    <div className="text-gray-400 text-sm">{response.teacher}</div>
                  </div>

                  <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                    <div className="flex items-center gap-3 mb-3">
                      <BookOpen className="w-4 h-4 text-green-400" />
                      <div className="font-semibold text-gray-300 text-sm">Subject</div>
                    </div>
                    <div className="text-gray-400 text-sm">{response.subject}</div>
                  </div>

                  <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                    <div className="flex items-center gap-3 mb-3">
                      <MapPin className="w-4 h-4 text-orange-400" />
                      <div className="font-semibold text-gray-300 text-sm">Location</div>
                    </div>
                    <div className="text-gray-400 text-sm">{response.location}</div>
                  </div>
                </div>

                {/* Related Courses */}
                {response.relatedCourses && response.relatedCourses.length > 0 && (
                  <div className="p-5 bg-orange-900/20 rounded-xl border border-orange-500/20">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="w-5 h-5 text-orange-400" />
                      <div className="font-semibold text-orange-400 text-sm uppercase tracking-wide">
                        Related Courses ({response.relatedCourses.length})
                      </div>
                    </div>
                    <div className="space-y-3">
                      {response.relatedCourses.map((course, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors group"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-gray-200 group-hover:text-white transition-colors">
                              {course.title}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {course.teacher} • {course.subject} • 
                              <span className={`ml-1 ${
                                course.relevance >= 80 ? 'text-green-400' :
                                course.relevance >= 50 ? 'text-yellow-400' : 'text-red-400'
                              }`}>
                                {course.relevance}% match
                              </span>
                            </div>
                          </div>
                          {course.filePath && (
                            <FileText className="w-4 h-4 text-gray-500 group-hover:text-gray-400 transition-colors" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Search Button */}
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setResponse(null)
                      setQuery('')
                      setError('')
                    }}
                    className="border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white rounded-xl"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    New Search
                  </Button>
                </div>
              </div>
            )}

            {/* Empty State when no response */}
            {!response && !loading && (
              <div className="text-center py-8">
                <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 p-4 rounded-2xl border border-gray-700 inline-block mb-4">
                  <Bot className="w-12 h-12 text-gray-500 mx-auto" />
                </div>
                <h4 className="text-gray-400 font-medium mb-2">Ready to Assist</h4>
                <p className="text-gray-500 text-sm">
                  Ask a question about your courses and I'll help you find the information you need.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}