import { Homework, CreateHomeworkDto, UpdateHomeworkDto } from '@/types/homework';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class HomeworkAPI {
  private async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Une erreur est survenue');
    }

    // Vérifier si la réponse a du contenu avant de la parser
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    }
    
    return null;
  }

  async getAllHomework(): Promise<Homework[]> {
    return this.request('/homework');
  }

  async getMyHomework(): Promise<Homework[]> {
    return this.request('/homework/my-homework');
  }

  async getUpcomingDeadlines(): Promise<Homework[]> {
    return this.request('/homework/upcoming');
  }

  async getHomeworkById(id: number): Promise<Homework> {
    return this.request(`/homework/${id}`);
  }

  async createHomework(data: CreateHomeworkDto): Promise<Homework> {
    return this.request('/homework', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateHomework(id: number, data: UpdateHomeworkDto): Promise<Homework> {
    return this.request(`/homework/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteHomework(id: number): Promise<void> {
    return this.request(`/homework/${id}`, {
      method: 'DELETE',
    });
  }
}

export const homeworkAPI = new HomeworkAPI();

