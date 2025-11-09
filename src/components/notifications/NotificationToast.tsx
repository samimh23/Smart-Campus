'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, BookOpen, Star, FileText, Bell } from 'lucide-react'

interface Notification {
  type: 'new_homework' | 'new_grade' | 'new_submission'
  data: any
  message: string
  timestamp: string
}

interface NotificationToastProps {
  notification: Notification
  onClose: () => void
}

export function NotificationToast({ notification, onClose }: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Wait for animation to complete
    }, 5000) // Auto-close after 5 seconds

    return () => clearTimeout(timer)
  }, [onClose])

  const getIcon = () => {
    switch (notification.type) {
      case 'new_homework':
        return <BookOpen className="h-5 w-5 text-blue-600" />
      case 'new_grade':
        return <Star className="h-5 w-5 text-yellow-600" />
      case 'new_submission':
        return <FileText className="h-5 w-5 text-green-600" />
      default:
        return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  const getBgColor = () => {
    switch (notification.type) {
      case 'new_homework':
        return 'bg-blue-50 border-blue-200'
      case 'new_grade':
        return 'bg-yellow-50 border-yellow-200'
      case 'new_submission':
        return 'bg-green-50 border-green-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isVisible) return null

  return (
    <Card className={`fixed top-4 right-4 z-50 w-80 shadow-lg border-l-4 ${getBgColor()} transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900">
                {notification.type === 'new_homework' && 'Nouveau Devoir'}
                {notification.type === 'new_grade' && 'Note Reçue'}
                {notification.type === 'new_submission' && 'Nouvelle Soumission'}
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsVisible(false)
                  setTimeout(onClose, 300)
                }}
                className="h-6 w-6 p-0 hover:bg-gray-200"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-700 mt-1">
              {notification.message}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatTime(notification.timestamp)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
