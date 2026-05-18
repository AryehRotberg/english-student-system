export type QuizOption = {
    id: string;
    label: string;
    value: string;
};

export type QuizCategory =
    | 'grammar'
    | 'vocabulary'
    | 'reading'
    | 'listening'
    | 'custom';

export type ProficiencyLevel =
    | 'A1'
    | 'A2'
    | 'B1'
    | 'B2'
    | 'C1'
    | 'C2'
    | 'any';

export type QuizSummary = {
    id: string;
    title: string;
    description: string;
    category: QuizCategory;
    level: ProficiencyLevel;
};

export type QuizStudyGuide = {
    id: string;
    topic: string;
    explanation: string;
};

export type QuizQuestion = {
    id: string;
    questionId: string;
    prompt: string;
    hints: string;
    questionType: string;
    options: QuizOption[];
    maxPoints: number;
    blankCount: number;
    questionNumber: number;
    totalQuestions: number;
};
