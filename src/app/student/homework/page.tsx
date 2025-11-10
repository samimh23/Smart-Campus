'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calendar, User, BookOpen, FileText, CheckCircle, Clock, Star, Download, Paperclip } from 'lucide-react'
import { Homework, HomeworkSubmission, Grade } from '@/types/homework'
import { homeworkAPI } from '@/lib/homework-api'
import { submissionAPI } from '@/lib/submission-api'
import { SubmissionForm } from '@/components/homework/SubmissionForm'
import { uploadAPI } from '@/lib/upload-api'

export default function StudentHomeworkPage() {
  const router = useRouter()
  const [homeworks, setHomeworks] = useState<Homework[]>([])
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSubmissionForm, setShowSubmissionForm] = useState(false)
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null)
  const [editingSubmission, setEditingSubmission] = useState<HomeworkSubmission | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')

    if (!token || role !== 'STUDENT') {
      router.push('/')
      return
    }

    loadData()
  }, [router])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [homeworksData, submissionsData, gradesData] = await Promise.all([
        homeworkAPI.getAllHomework(),
        submissionAPI.getMySubmissions(),
        submissionAPI.getMyGrades()
      ])
      setHomeworks(homeworksData)
      setSubmissions(submissionsData)
      setGrades(gradesData)
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
      setError('Erreur lors du chargement des données')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date()
  }

  const isDueSoon = (deadline: string) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diffInHours = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60)
    return diffInHours <= 24 && diffInHours > 0
  }

  const getDaysUntilDeadline = (deadline: string) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diffInDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diffInDays
  }

  // Fonctions pour gérer les soumissions
  const getSubmissionForHomework = (homeworkId: number) => {
    return submissions.find(sub => sub.homework_id === homeworkId)
  }

  const getGradeForHomework = (homeworkId: number) => {
    return grades.find(grade => grade.submission.homework_id === homeworkId)
  }

  const handleCreateSubmission = (homework: Homework) => {
    setSelectedHomework(homework)
    setEditingSubmission(null)
    setShowSubmissionForm(true)
  }

  const handleEditSubmission = (homework: Homework) => {
    const submission = getSubmissionForHomework(homework.id)
    if (submission) {
      setSelectedHomework(homework)
      setEditingSubmission(submission)
      setShowSubmissionForm(true)
    }
  }

  const handleSubmitSubmission = async (data: any) => {
    try {
      if (editingSubmission) {
        await submissionAPI.updateSubmission(editingSubmission.id, data)
      } else {
        await submissionAPI.createSubmission(data)
      }
      setShowSubmissionForm(false)
      setSelectedHomework(null)
      setEditingSubmission(null)
      await loadData()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      setError('Erreur lors de la sauvegarde de la soumission')
    }
  }

  const handleSubmitHomework = async (submissionId: number) => {
    try {
      await submissionAPI.submitHomework(submissionId)
      await loadData()
    } catch (error) {
      console.error('Erreur lors de la soumission:', error)
      setError('Erreur lors de la soumission du devoir')
    }
  }

  const handleCancelSubmission = () => {
    setShowSubmissionForm(false)
    setSelectedHomework(null)
    setEditingSubmission(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a855f7]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/student/dashboard')}
            className="flex items-center gap-2 border-slate-700 text-slate-300 hover:bg-white/10 bg-transparent"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au dashboard
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Devoirs</h1>
          <p className="text-slate-400">Consultez tous les devoirs assignés</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-900/50 border border-red-700 text-red-200 rounded">
            {error}
          </div>
        )}

        {showSubmissionForm && selectedHomework ? (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Button
                variant="ghost"
                onClick={handleCancelSubmission}
                className="flex items-center gap-2 border-slate-700 text-slate-300 hover:bg-white/10 bg-transparent"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour aux devoirs
              </Button>
            </div>
            <SubmissionForm
              homeworkId={selectedHomework.id}
              initialData={editingSubmission ? {
                content: editingSubmission.content,
                attachment_url: editingSubmission.attachment_url,
              } : undefined}
              onSubmit={handleSubmitSubmission}
              onCancel={handleCancelSubmission}
              isEditing={!!editingSubmission}
            />
          </div>
        ) : homeworks.length === 0 ? (
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-16 w-16 text-[#a855f7] opacity-50 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Aucun devoir disponible</h3>
              <p className="text-slate-400 text-center">
                Il n'y a actuellement aucun devoir assigné. Vérifiez plus tard.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {homeworks.map((homework) => {
              const daysUntilDeadline = getDaysUntilDeadline(homework.deadline)
              const isOverdueHomework = isOverdue(homework.deadline)
              const isDueSoonHomework = isDueSoon(homework.deadline)
              const submission = getSubmissionForHomework(homework.id)
              const grade = getGradeForHomework(homework.id)

              return (
                <Card key={homework.id} className="bg-slate-900/50 border-slate-800 hover:border-[#a855f7] transition-all">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-xl text-white">{homework.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <User className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-400">
                            {homework.teacher.first_name} {homework.teacher.last_name}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {isOverdueHomework && (
                          <Badge variant="destructive">En retard</Badge>
                        )}
                        {!isOverdueHomework && isDueSoonHomework && (
                          <Badge className="bg-[#FF6B35] hover:bg-[#FF6B35]/90">Bientôt dû</Badge>
                        )}
                        {!isOverdueHomework && !isDueSoonHomework && (
                          <Badge className="bg-slate-700 text-slate-300">À venir</Badge>
                        )}
                        {grade ? (
                          <Badge className="flex items-center gap-1 bg-[#a855f7] hover:bg-[#a855f7]/90">
                            <Star className="h-3 w-3" />
                            {grade.grade}/20
                          </Badge>
                        ) : submission && (
                          <Badge variant={submission.is_submitted ? "default" : "outline"} className="flex items-center gap-1 bg-[#a855f7] hover:bg-[#a855f7]/90 border-slate-700">
                            {submission.is_submitted ? (
                              <>
                                <CheckCircle className="h-3 w-3" />
                                Soumis
                              </>
                            ) : (
                              <>
                                <Clock className="h-3 w-3" />
                                Brouillon
                              </>
                            )}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 mb-4">{homework.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {homework.subject && (
                        <Badge className="bg-[#a855f7]/20 text-[#c084fc] border-[#a855f7]/30">{homework.subject}</Badge>
                      )}
                      {homework.grade_level && (
                        <Badge className="bg-slate-700/50 text-slate-300 border-slate-600">{homework.grade_level}</Badge>
                      )}
                    </div>

                    {/* Afficher le fichier du devoir si disponible */}
                    {(homework as any).attachment_url && (
                      <div className="mb-4 p-3 bg-[#a855f7]/10 border border-[#a855f7]/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Paperclip className="h-5 w-5 text-[#a855f7]" />
                          <span className="text-sm font-medium text-[#c084fc]">Fichier du devoir attaché</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 flex items-center gap-2 border-slate-700 text-slate-300 hover:bg-white/10 bg-transparent"
                          onClick={() => {
                            const fileUrl = (homework as any).attachment_url.startsWith('http') 
                              ? (homework as any).attachment_url 
                              : uploadAPI.getFileUrl((homework as any).attachment_url.replace('/uploads/', ''))
                            window.open(fileUrl, '_blank')
                          }}
                        >
                          <Download className="h-4 w-4" />
                          Télécharger le fichier
                        </Button>
                      </div>
                    )}

                    {grade && (
                      <div className="mb-4 p-4 bg-green-900/30 border border-green-700/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="h-5 w-5 text-green-400" />
                          <span className="font-semibold text-green-300">Note reçue : {grade.grade}/20</span>
                        </div>
                        {grade.feedback && (
                          <p className="text-sm text-green-200">
                            <strong>Commentaire :</strong> {grade.feedback}
                          </p>
                        )}
                        <p className="text-xs text-green-400 mt-2">
                          Noté le: {new Date(grade.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Échéance: {formatDate(homework.deadline)}
                      </span>
                      {!isOverdueHomework && (
                        <span className="ml-4">
                          ({daysUntilDeadline} jour{daysUntilDeadline > 1 ? 's' : ''} restant{daysUntilDeadline > 1 ? 's' : ''})
                        </span>
                      )}
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex gap-2">
                      {!submission ? (
                        <Button 
                          onClick={() => handleCreateSubmission(homework)}
                          className="flex items-center gap-2 bg-[#a855f7] hover:bg-[#a855f7]/90"
                        >
                          <FileText className="h-4 w-4" />
                          Commencer le devoir
                        </Button>
                      ) : !submission.is_submitted ? (
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost"
                            onClick={() => handleEditSubmission(homework)}
                            className="flex items-center gap-2 border-slate-700 text-slate-300 hover:bg-white/10 bg-transparent"
                          >
                            <FileText className="h-4 w-4" />
                            Modifier
                          </Button>
                          <Button 
                            onClick={() => handleSubmitHomework(submission.id)}
                            className="flex items-center gap-2 bg-[#a855f7] hover:bg-[#a855f7]/90"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Soumettre
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-green-400">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">Devoir soumis</span>
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
    </div>
  )
}



