export interface LearningItem {
  id?: string;
  type: 'word' | 'skill';
  name: string;
  proficiency: number; // 0-100
  lastPracticed?: string | null;
  needsImprovement: boolean;
}

export interface Practice {
  id?: string;
  type: 'essay' | 'multipleChoice';
  prompt: string;
  targetWords: string[];
  targetSkills: string[];
  options?: string[];
  correctAnswer?: string;
}

export interface PracticeResponse {
  type: 'spelling' | 'essay';
  practiceId: string;
  userAnswer: string;
  timestamp: string;
  evaluation: {
    isCorrect: boolean;
    score: number; // 0-100
    feedback: string;
    weaknesses: string[];
    improvementAreas: {
      words: string[];
      skills: string[];
    };
    strengths: {
      words: string[];
      skills: string[];
    };
  };
}
