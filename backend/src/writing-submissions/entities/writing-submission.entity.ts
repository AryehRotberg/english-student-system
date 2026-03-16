export class WritingSubmission {
    id: string;
    taskId: string;
    userId: string;
    content: string;
    feedback: string | null;
    score: number | null;
    submittedAt: Date;
    reviewedAt: Date | null;
}