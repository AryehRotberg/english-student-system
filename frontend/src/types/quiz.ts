export type QuizOption = {
  id: string;
  label: string;
  value: string;
};

export type QuizSummary = {
  id: string;
  title: string;
  description: string;
};

export type QuizTopic = {
  id: string;
  topic: string;
  explanation: string;
};

export type QuizQuestion = {
  id: string;
  questionId: string;
  prompt: string;
  questionType: string;
  options: QuizOption[];
  maxPoints: number;
  blankCount: number;
  questionNumber: number;
  totalQuestions: number;
};
