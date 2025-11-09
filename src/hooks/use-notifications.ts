'use client'

import { useState, useEffect, useCallback } from 'react'
import { notificationService } from '@/lib/notifications'

interface Notification {
  type: 'new_homework' | 'new_grade' | 'new_submission'
  data: any
  message: string
  timestamp: string
}

export function useNotifications(userId?: string, role?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (userId && role) {
      console.log('🔔 Connecting to notifications with userId:', userId, 'role:', role);
      // Connecter au service de notifications
      notificationService.connect(userId, role)
      setIsConnected(true)

      // Écouter les nouvelles notifications
      const handleNewHomework = (data: any) => {
        setNotifications(prev => [data, ...prev.slice(0, 4)]) // Garder max 5 notifications
      }

      const handleNewGrade = (data: any) => {
        setNotifications(prev => [data, ...prev.slice(0, 4)])
      }

      const handleNewSubmission = (data: any) => {
        setNotifications(prev => [data, ...prev.slice(0, 4)])
      }

      notificationService.on('new_homework', handleNewHomework)
      notificationService.on('new_grade', handleNewGrade)
      notificationService.on('new_submission', handleNewSubmission)

      return () => {
        notificationService.off('new_homework', handleNewHomework)
        notificationService.off('new_grade', handleNewGrade)
        notificationService.off('new_submission', handleNewSubmission)
        notificationService.disconnect()
        setIsConnected(false)
      }
    }
  }, [userId, role])

  const removeNotification = useCallback((index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index))
  }, [])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  return {
    notifications,
    isConnected,
    removeNotification,
    clearAllNotifications
  }
}
