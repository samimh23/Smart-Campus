'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash2, Edit, Plus, Calendar, User, FileText, Paperclip, Download } from 'lucide-react'
import { Homework } from '@/types/homework'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { uploadAPI } from '@/lib/upload-api'

interface HomeworkListProps {
  homeworks: Homework[]
  onEdit: (homework: Homework) => void
  onDelete: (id: number) => void
  onCreate: () => void
  onViewSubmissions?: (homework: Homework) => void
  isLoading?: boolean
}

export function HomeworkList({ homeworks, onEdit, onDelete, onCreate, onViewSubmissions, isLoading }: HomeworkListProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleDelete = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce devoir ?')) {
      setDeletingId(id)
      try {
        await onDelete(id)
      } finally {
        setDeletingId(null)
      }
    }
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
        <h2 className="text-2xl font-bold">Mes devoirs</h2>
        <Button onClick={onCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nouveau devoir
        </Button>
      </div>

      {homeworks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Aucun devoir créé pour le moment</p>
            <Button onClick={onCreate} className="mt-4">
              Créer votre premier devoir
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {homeworks.map((homework) => (
            <Card key={homework.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{homework.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {homework.teacher.first_name} {homework.teacher.last_name}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {onViewSubmissions && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewSubmissions(homework)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(homework)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(homework.id)}
                      disabled={deletingId === homework.id}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{homework.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {homework.subject && (
                    <Badge variant="secondary">{homework.subject}</Badge>
                  )}
                  {homework.grade_level && (
                    <Badge variant="outline">{homework.grade_level}</Badge>
                  )}
                  <Badge 
                    variant={isOverdue(homework.deadline) ? "destructive" : isDueSoon(homework.deadline) ? "default" : "secondary"}
                  >
                    {isOverdue(homework.deadline) ? 'En retard' : isDueSoon(homework.deadline) ? 'Bientôt dû' : 'À venir'}
                  </Badge>
                </div>

                {/* Afficher le fichier attaché si disponible */}
                {(homework as any).attachment_url && (
                  <div className="mb-3 p-2 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4 text-purple-600" />
                        <span className="text-sm text-purple-800 font-medium">Fichier du devoir attaché</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          const fileUrl = (homework as any).attachment_url.startsWith('http') 
                            ? (homework as any).attachment_url 
                            : uploadAPI.getFileUrl((homework as any).attachment_url.replace('/uploads/', ''))
                          window.open(fileUrl, '_blank')
                        }}
                      >
                        <Download className="h-4 w-4" />
                        Voir
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Échéance: {format(new Date(homework.deadline), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}



