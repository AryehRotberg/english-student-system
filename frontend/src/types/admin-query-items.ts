export type QuestionAdminItem = {
    id: string;
    question: string;
    questionType: string;
    hints?: string | null;
    audioUrl?: string | null;
    subjectId: string;
    levelId: string | null;
    contentFormat: 'plain' | 'markdown';
    hasImage: boolean;
    source: string | null;
    topicIds: string[];
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
    orderIndex: number | null;
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
