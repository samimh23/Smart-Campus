import { 
  HomeworkSubmission, 
  CreateSubmissionDto, 
  UpdateSubmissionDto,
  Grade,
  CreateGradeDto,
  UpdateGradeDto,
  HomeworkStats
} from '@/types/homework';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class SubmissionAPI {
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

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    }
    
    return null;
  }

  // Soumissions
  async createSubmission(data: CreateSubmissionDto): Promise<HomeworkSubmission> {
    return this.request('/submissions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSubmission(id: number, data: UpdateSubmissionDto): Promise<HomeworkSubmission> {
    return this.request(`/submissions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async submitHomework(id: number): Promise<HomeworkSubmission> {
    return this.request(`/submissions/${id}/submit`, {
      method: 'POST',
    });
  }

  async getMySubmissions(): Promise<HomeworkSubmission[]> {
    return this.request('/submissions/my-submissions');
  }

  async getHomeworkSubmissions(homeworkId: number): Promise<HomeworkSubmission[]> {
    return this.request(`/submissions/homework/${homeworkId}`);
  }

  // Notes
  async createGrade(data: CreateGradeDto): Promise<Grade> {
    return this.request('/submissions/grade', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateGrade(gradeId: number, data: UpdateGradeDto): Promise<Grade> {
    return this.request(`/submissions/grade/${gradeId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getMyGrades(): Promise<Grade[]> {
    return this.request('/submissions/my-grades');
  }

  async getTeacherGrades(): Promise<Grade[]> {
    return this.request('/submissions/teacher-grades');
  }

  async getHomeworkStats(homeworkId: number): Promise<HomeworkStats> {
    return this.request(`/submissions/homework/${homeworkId}/stats`);
  }
}

export const submissionAPI = new SubmissionAPI();
