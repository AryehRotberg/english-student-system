export type QuizAttemptApiItem = {
    id: string;
    quizId?: string;
    points: number | null;
    startedAt: string;
    completedAt: string | null;
};
