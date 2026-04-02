export type QuizAttemptApiItem = {
    id: string;
    userId: string;
    quizId: string;
    points: number | null;
    startedAt: string;
    completedAt: string | null;
};
