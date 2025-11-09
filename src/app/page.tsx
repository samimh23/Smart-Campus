'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Users, GraduationCap, LogIn } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')

    if (token && role) {
      // Rediriger vers le dashboard approprié
      if (role === 'TEACHER') {
        router.push('/teacher/dashboard')
      } else if (role === 'STUDENT') {
        router.push('/student/dashboard')
      } else if (role === 'ADMIN') {
        router.push('/admin/dashboard')
      }
    }
  }, [router])

  const handleLogin = () => {
    router.push('/auth')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-4 rounded-full">
              <GraduationCap className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Smart Campus
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Plateforme de gestion éducative intelligente
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
          >
            <LogIn className="h-5 w-5 mr-2" />
            Se connecter
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <BookOpen className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-xl">Gestion des Devoirs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Créez et gérez des devoirs avec des échéances pour vos étudiants.
                Suivez les progrès et organisez votre enseignement.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-xl">Gestion des Utilisateurs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Gérez les comptes enseignants et étudiants avec des rôles 
                et permissions appropriés pour une sécurité optimale.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <GraduationCap className="h-8 w-8 text-purple-600" />
                </div>
              </div>
              <CardTitle className="text-xl">Dashboard Intelligent</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Tableaux de bord personnalisés avec statistiques en temps réel
                et indicateurs visuels pour un suivi optimal.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features List */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Fonctionnalités Principales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">Pour les Enseignants</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Création et gestion des devoirs
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Définition d'échéances et deadlines
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Suivi des statistiques en temps réel
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Interface intuitive et moderne
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">Pour les Étudiants</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Consultation des devoirs assignés
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Indicateurs de statut visuels
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Alertes pour les échéances proches
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Dashboard personnalisé
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500">
          <p>© 2024 Smart Campus. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  )
}


