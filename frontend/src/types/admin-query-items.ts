export type QuestionAdminItem = {
    id: string;
    question: string;
    questionType: string;
    audioUrl?: string | null;
};

export type QuestionOptionAdminItem = {
    id: string;
    questionId: string;
    optionText: string;
    isCorrect: boolean;
};

export type AnswerAdminItem = {
    id: string;
    questionId: string;
    answer: string;
    blankIndex: number;
};

export type RawQuizQuestionAdminItem = {
    id: string;
    quizId: string;
    questionId: string;
    question: string;
    questionType: string;
    maxPoints: number;
};

export type TextAdminItem = {
    id: string;
    title: string;
    level: string;
    content: string;
};
