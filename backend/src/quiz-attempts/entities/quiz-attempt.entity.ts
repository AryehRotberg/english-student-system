export class QuizAttempt {
    id: string;
    userId: string;
    quizId: string
    points: number | null;
    startedAt: Date;
    completedAt: Date | null;
}
