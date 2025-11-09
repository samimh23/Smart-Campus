'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Star, 
  User, 
  Calendar, 
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Download,
  Paperclip
} from 'lucide-react'
import { HomeworkSubmission, Grade } from '@/types/homework'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { uploadAPI } from '@/lib/upload-api'

interface SubmissionGradingListProps {
  submissions: HomeworkSubmission[]
  grades: Grade[]
  onGrade: (submission: HomeworkSubmission) => void
  onEditGrade: (grade: Grade) => void
  isLoading?: boolean
}

export function SubmissionGradingList({ 
  submissions, 
  grades, 
  onGrade, 
  onEditGrade, 
  isLoading 
}: SubmissionGradingListProps) {
  const getGradeForSubmission = (submissionId: number): Grade | undefined => {
    return grades.find(grade => grade.submission_id === submissionId)
  }

  const getStatusBadge = (submission: HomeworkSubmission) => {
    const grade = getGradeForSubmission(submission.id)
    
    if (grade) {
      return (
        <Badge variant={grade.grade >= 12 ? "default" : "secondary"} className="flex items-center gap-1">
          <Star className="h-3 w-3" />
          {grade.grade}/20 {grade.is_final ? '(Finale)' : '(Brouillon)'}
        </Badge>
      )
    }
    
    if (submission.is_submitted) {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          À noter
        </Badge>
      )
    }
    
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <AlertCircle className="h-3 w-3" />
        Non soumis
      </Badge>
    )
  }

  const getGradeColor = (grade: number) => {
    if (grade >= 16) return 'text-green-600'
    if (grade >= 12) return 'text-blue-600'
    if (grade >= 8) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Soumissions à noter</h2>
        <div className="text-sm text-gray-600">
          {submissions.filter(s => s.is_submitted).length} soumission(s) sur {submissions.length} étudiant(s)
        </div>
      </div>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Aucune soumission pour ce devoir</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {submissions.map((submission) => {
            const grade = getGradeForSubmission(submission.id)
            
            return (
              <Card key={submission.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{submission.homework.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {submission.student.first_name} {submission.student.last_name}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({submission.student.email})
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {getStatusBadge(submission)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-4">
                    {submission.is_late && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        En retard
                      </Badge>
                    )}
                    {submission.submitted_at && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Soumis le: {format(new Date(submission.submitted_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-700 line-clamp-3">{submission.content}</p>
                    {submission.attachment_url && (
                      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Paperclip className="h-4 w-4 text-blue-600" />
                            <span className="text-sm text-blue-800 font-medium">Fichier de soumission attaché</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-2"
                            onClick={() => {
                              const fileUrl = submission.attachment_url.startsWith('http') 
                                ? submission.attachment_url 
                                : uploadAPI.getFileUrl(submission.attachment_url.replace('/uploads/', ''))
                              window.open(fileUrl, '_blank')
                            }}
                          >
                            <Download className="h-4 w-4" />
                            Télécharger
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {grade && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">Note: </span>
                          <span className={`font-bold text-lg ${getGradeColor(grade.grade)}`}>
                            {grade.grade}/20
                          </span>
                          {grade.is_final && (
                            <Badge variant="default" className="ml-2">Finale</Badge>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditGrade(grade)}
                        >
                          Modifier
                        </Button>
                      </div>
                      {grade.feedback && (
                        <div className="mt-2">
                          <span className="font-medium text-sm">Commentaires:</span>
                          <p className="text-sm text-gray-700 mt-1">{grade.feedback}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end">
                    {submission.is_submitted && !grade && (
                      <Button onClick={() => onGrade(submission)} className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Noter
                      </Button>
                    )}
                    {submission.is_submitted && grade && (
                      <Button 
                        variant="outline" 
                        onClick={() => onGrade(submission)}
                        className="flex items-center gap-2"
                      >
                        <Star className="h-4 w-4" />
                        Revoir la note
                      </Button>
                    )}
                    {!submission.is_submitted && (
                      <div className="text-sm text-gray-500 italic">
                        En attente de soumission
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
