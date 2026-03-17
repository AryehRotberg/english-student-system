export type QuizQuestionApiItem = {
    id: string;
    questionId: string;
    question?: string;
    questionType?: string;
    prompt?: string;
    maxPoints?: number;
};