export type QuizOption = {
    id: string;
    label: string;
    value: string;
};

export type QuizCategory =
    | 'grammar'
    | 'vocabulary'
    | 'reading'
    | 'listening'
    | 'custom';

export type ProficiencyLevel =
    | 'A1'
    | 'A2'
    | 'B1'
    | 'B2'
    | 'C1'
    | 'C2'
    | 'any';

// auto: answers are graded instantly. teacher: the teacher grades after submission.
export type GradingMode = 'auto' | 'teacher';

export type QuestionType = 'multiple_choice' | 'open_ended' | 'handwritten';

// plain: shown as typed. markdown: Markdown with $LaTeX$ math and code blocks.
export type ContentFormat = 'plain' | 'markdown';

export type QuizSummary = {
    id: string;
    title: string;
    description: string;
    category: QuizCategory;
    // English CEFR level; other subjects use levelId.
    level: ProficiencyLevel;
    gradingMode: GradingMode;
    subjectId: string;
    levelId: string | null;
    // "Answer N of the M questions" (Bagrut style); null means all count.
    questionsToAnswer: number | null;
    timeLimitMinutes: number | null;
};

export type QuizStudyGuide = {
    id: string;
    topic: string;
    explanation: string;
};

export type QuizQuestion = {
    id: string;
    questionId: string;
    prompt: string;
    hints: string;
    questionType: string;
    options: QuizOption[];
    maxPoints: number;
    blankCount: number;
    questionNumber: number;
    totalQuestions: number;
    contentFormat: ContentFormat;
    hasImage: boolean;
};
