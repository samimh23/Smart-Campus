export interface Homework {
  due_date: any;
  id: number;
  title: string;
  description: string;
  deadline: string;
  is_active: boolean;
  subject?: string;
  grade_level?: string;
  attachment_url?: string;
  teacher_id: number;
  teacher: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CreateHomeworkDto {
  title: string;
  description: string;
  deadline: string;
  subject?: string;
  grade_level?: string;
  attachment_url?: string;
  teacher_id: number;
}

export interface UpdateHomeworkDto {
  title?: string;
  description?: string;
  deadline?: string;
  subject?: string;
  grade_level?: string;
  attachment_url?: string;
}

// Types pour les soumissions
export interface HomeworkSubmission {
  id: number;
  homework_id: number;
  student_id: number;
  content: string;
  attachment_url?: string;
  is_submitted: boolean;
  submitted_at?: string;
  is_late: boolean;
  created_at: string;
  updated_at: string;
  homework: Homework;
  student: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface CreateSubmissionDto {
  homework_id: number;
  content: string;
  attachment_url?: string;
}

export interface UpdateSubmissionDto {
  content?: string;
  attachment_url?: string;
  is_submitted?: boolean;
}

// Types pour les notes
export interface Grade {
  id: number;
  submission_id: number;
  teacher_id: number;
  grade: number;
  feedback?: string;
  is_final: boolean;
  created_at: string;
  updated_at: string;
  submission: HomeworkSubmission;
  teacher: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface CreateGradeDto {
  submission_id: number;
  grade: number;
  feedback?: string;
  is_final?: boolean;
}

export interface UpdateGradeDto {
  grade?: number;
  feedback?: string;
  is_final?: boolean;
}

// Types pour les statistiques
export interface HomeworkStats {
  total_submissions: number;
  submitted_count: number;
  graded_count: number;
  average_grade: number;
  submissions: HomeworkSubmission[];
  grades: Grade[];
}



