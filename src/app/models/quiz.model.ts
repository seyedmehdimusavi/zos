export interface QuizQuestion {
  question: string;
  answer1: string;
  answer2: string;
  answer3: string;
  answer4: string;
  correctOptionNumber: number;
}


export interface QuizQuestionOneAnswer {
  question: string;
  answer: string;
}

export interface QuizOneAnswer {
  id?: string;
  title: string;
  questions: QuizQuestionOneAnswer[];
  createdAt: Date;
}

export interface Quiz {
  id?: string;
  title: string;
  questions: QuizQuestion[];
  createdAt: Date;
}

export interface QuizResult {
  id?: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
  formattedDate?: string;
  quizTitle?: string;
}
