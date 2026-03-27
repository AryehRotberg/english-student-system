export class QuizQuestion {
    id: string;
    quizId: string;
    questionId: string;
    question: string;
    questionType: string;
    audioUrl: string | null;
    maxPoints: number;
}