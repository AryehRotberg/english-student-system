export type QuestionAdminItem = {
    id: string;
    question: string;
    questionType: string;
    audioUrl?: string | null;
};

export type QuestionChoiceAdminItem = {
    id: string;
    questionId: string;
    optionText: string;
    isCorrect: boolean;
};

export type QuestionAcceptedAnswerAdminItem = {
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

export type ReadingAdminItem = {
    id: string;
    title: string;
    level: string;
    content: string;
    quizId: string | null;
    quiz: { id: string; title: string } | null;
    vocabularyTopic: { id: string; topic: string } | null;
};
