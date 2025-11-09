const API_URL = 'http://localhost:3000'

export const uploadAPI = {
  uploadFile: async (file: File): Promise<{ url: string; filename: string; originalname: string }> => {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Non authentifié')

    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_URL}/upload/file`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de l\'upload')
    }

    return await response.json()
  },

  getFileUrl: (filename: string): string => {
    return `${API_URL}/uploads/${filename}`
  }
}

