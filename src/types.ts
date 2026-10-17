export interface VocabItem {
  id: string;
  word: string;
  meaning: string;
  topic?: string;
  phonetic?: string;
  example?: string;
  notes?: string;
  createdAt: number;
  stats?: {
    correctCount: number;
    wrongCount: number;
    lastPracticed?: number;
  };
}

export type QuizQuestionType = 'vn-to-en' | 'en-to-vn' | 'multiple-choice' | 'matching';
export type QuizMode = 'mixed' | QuizQuestionType;

export interface UnifiedQuizQuestion {
  id: string;
  type: QuizQuestionType;
  item: VocabItem;
  options?: string[]; // for multiple-choice
  matchingItems?: VocabItem[]; // for matching questions
}

export interface QuizQuestion {
  id: string;
  targetItem: VocabItem;
  mode: QuizQuestionType;
  prompt: string;
  correctAnswer: string;
  options?: string[]; // for multiple-choice
}

export interface QuizResultItem {
  item: VocabItem;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  mode: QuizMode;
}

export interface QuizSessionStats {
  total: number;
  correct: number;
  wrong: number;
  score: number;
  streak: number;
  bestStreak: number;
  results: QuizResultItem[];
}
