export type QuizAttemptApiItem = {
    id: string;
    points: number | null;
    startedAt: string;
    completedAt: string | null;
};