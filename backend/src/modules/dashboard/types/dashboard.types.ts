export interface ProgressMetric {
    id: string;
    label: string;
    percent: number;
}

export interface QuizProgressRow {
    quizId: string;
    assignmentStatus: boolean;
    completedAt: Date | null;
    totalQuestions: number;
    answeredQuestions: number;
}

export interface ContentProgressRow {
    contentType: 'text' | 'writing' | 'quiz' | 'vocabulary';
    totalItems: number;
    completedItems: number;
}
