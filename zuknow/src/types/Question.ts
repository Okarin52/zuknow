export interface Question {
  id: string;
  question: string;
  answer: string;
  explanation: string;
  category?: string;
  tags?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestionInput {
  question: string;
  answer: string;
  explanation: string;
  category?: string;
  tags?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface QuestionState {
  questions: Question[];
  currentQuestion?: Question;
  loading: boolean;
  error: string | null;
}
