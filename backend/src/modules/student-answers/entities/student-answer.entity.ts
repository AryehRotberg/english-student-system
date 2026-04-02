export class StudentAnswer {
    id: string;
    attemptId: string;
    questionId: string;
    blankIndex: number;
    selectedOptionId: string | null;
    textAnswer: string | null;
    createdAt: Date;
    points: number | null;
}
