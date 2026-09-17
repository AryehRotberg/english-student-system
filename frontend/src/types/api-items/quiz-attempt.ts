// pendingReview: submitted on a teacher-graded quiz; points are not final yet.
export type QuizAttemptStatus = 'inProgress' | 'pendingReview' | 'graded';

export type QuizAttemptApiItem = {
    id: string;
    userId: string;
    quizId: string;
    points: number | null;
    status: QuizAttemptStatus;
    startedAt: string;
    completedAt: string | null;
};
