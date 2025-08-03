export interface WordQuizQuestion {
  question: string;
  answer: string;
  hint?: string;
}

export interface WordQuiz {
  id?: string;
  title: string;
  questions: WordQuizQuestion[];
  createdAt: Date;
}

export interface WordQuizResult {
  id?: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
  formattedDate?: string;
  quizTitle?: string;
}
