export class Question {
    id: string;
    question: string;
    hints: string;
    questionType: string;
    audioUrl: string | null;
    createdAt: Date;
}