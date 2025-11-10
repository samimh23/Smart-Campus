const API_URL = 'http://localhost:3000'

export const aiGradingAPI = {
  autoGradeSubmission: async (submissionId: number) => {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Non authentifié')

    const response = await fetch(`${API_URL}/submissions/${submissionId}/auto-grade`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de la notation automatique')
    }

    return await response.json()
  },
}

