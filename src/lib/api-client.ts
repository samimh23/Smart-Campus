// API Client for NestJS Backend
const NESTJS_API_URL = process.env.NEXT_PUBLIC_NESTJS_API_URL || 'http://localhost:3000';

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  geminiApiKey?: string;
  completedExercises: number;
  totalProgress: number;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  examples: string[];
  language: string;
  subject: string;
  userId: number;
  createdAt: string;
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  starterCode: string;
  expectedOutput?: string;
  testCases?: Array<{ input: string; expectedOutput: string }>;
  language: string;
  subject: string;
  userId: number;
  createdAt: string;
}

export interface Feedback {
  isCorrect: boolean;
  message: string;
  suggestions: string[];
  improvements: string[];
}

export interface UserProgress {
  id: string;
  userId: number;
  language: string;
  subject: string;
  completedExercises: number;
  progress: number;
  lastActivityAt?: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = NESTJS_API_URL) {
    this.baseUrl = baseUrl;
    // Load token from localStorage if available
    // Use 'token' to match your project's auth system
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add authorization header if token exists
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.message || data.error || `HTTP error! status: ${response.status}`,
        };
      }

      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  // Authentication methods
  logout() {
    // Clear token from memory
    this.token = null;
    // Note: Don't clear localStorage here, that's handled by the page component
  }

  // Tutor/AI Learning methods
  async generateLesson(language: string, subject: string): Promise<ApiResponse<Lesson>> {
    return this.request<Lesson>('/tutor/generate-lesson', {
      method: 'POST',
      body: JSON.stringify({ language, subject }),
    });
  }

  async generateExercise(language: string, subject: string): Promise<ApiResponse<Exercise>> {
    return this.request<Exercise>('/tutor/generate-exercise', {
      method: 'POST',
      body: JSON.stringify({ language, subject }),
    });
  }

  async submitSolution(exerciseId: string, userCode: string): Promise<ApiResponse<{
    submission: any;
    feedback: Feedback;
  }>> {
    return this.request('/tutor/submit-solution', {
      method: 'POST',
      body: JSON.stringify({ exerciseId, userCode }),
    });
  }

  async getProgress(language: string, subject: string): Promise<ApiResponse<UserProgress>> {
    return this.request<UserProgress>(`/tutor/progress?language=${language}&subject=${subject}`);
  }

  async updateApiKey(apiKey: string): Promise<ApiResponse<{ message: string }>> {
    return this.request('/tutor/update-api-key', {
      method: 'PUT',
      body: JSON.stringify({ apiKey }),
    });
  }

  // User profile methods
  async getCurrentUser(): Promise<ApiResponse<ApiUser>> {
    return this.request<ApiUser>('/auth/user/me');
  }

  async updateUserProfile(userData: Partial<ApiUser>): Promise<ApiResponse<ApiUser>> {
    return this.request<ApiUser>('/auth/user/me', {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    return this.request<{ status: string }>('/health');
  }

  // Enhanced progress tracking methods
  async getComprehensiveProgress(language?: string, subject?: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (language) params.append('language', language);
    if (subject) params.append('subject', subject);
    
    const queryString = params.toString();
    return this.request(`/tutor/progress/comprehensive${queryString ? `?${queryString}` : ''}`);
  }

  async getLearningAnalytics(timeRange: string = '30d'): Promise<ApiResponse<any>> {
    return this.request(`/tutor/analytics?timeRange=${timeRange}`);
  }

  async trackLessonProgress(lessonId: string, language: string, subject: string): Promise<ApiResponse<any>> {
    return this.request('/tutor/progress/lesson', {
      method: 'POST',
      body: JSON.stringify({ lessonId, language, subject }),
    });
  }

  async trackExerciseProgress(exerciseId: string, isCorrect: boolean, timeSpent?: number): Promise<ApiResponse<any>> {
    return this.request('/tutor/progress/exercise', {
      method: 'POST',
      body: JSON.stringify({ exerciseId, isCorrect, timeSpent }),
    });
  }

  async getAchievements(): Promise<ApiResponse<any>> {
    return this.request('/tutor/achievements');
  }

  async getStreak(): Promise<ApiResponse<any>> {
    return this.request('/tutor/streak');
  }

  async getAllLessons(): Promise<ApiResponse<Lesson[]>> {
    return this.request('/tutor/lessons');
  }

  async getAllExercises(): Promise<ApiResponse<Exercise[]>> {
    return this.request('/tutor/exercises');
  }

  async getSuccessRate(language?: string, timeRange?: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (language) params.append('language', language);
    if (timeRange) params.append('timeRange', timeRange);
    
    const queryString = params.toString();
    return this.request(`/tutor/success-rate${queryString ? `?${queryString}` : ''}`);
  }

  // Code execution methods (Judge0 integration)
  async runCode(options: {
    language: string;
    code: string;
    stdin?: string;
    timeout?: number;
    expectedOutput?: string;
  }): Promise<ApiResponse<{
    stdout: string | null;
    stderr: string | null;
    status: { id: number; description: string };
    time: string | null;
    memory: number | null;
    compileOutput: string | null;
    success?: boolean;
  }>> {
    return this.request('/tutor/run-code', {
      method: 'POST',
      body: JSON.stringify(options),
    });
  }

  async runTests(
    language: string,
    code: string,
    tests: Array<{ stdin: string; expectedOutput: string }>,
  ): Promise<ApiResponse<any[]>> {
    return this.request('/tutor/run-tests', {
      method: 'POST',
      body: JSON.stringify({ language, code, tests }),
    });
  }
}

// Create singleton instance
export const apiClient = new ApiClient();