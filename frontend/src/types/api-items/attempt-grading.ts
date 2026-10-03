import type { AnswerFile } from '../../services/answer-files.service';
import type { StudentAnswerApiItem } from '../../services/student-answers.service';
import type { ContentFormat, GradingMode } from '../quiz';
import type { QuizAttemptStatus } from './quiz-attempt';

export type GradingChoice = {
    id: string;
    text: string | null;
    isCorrect: boolean;
};

export type GradingAcceptedAnswer = {
    id: string;
    blankIndex: number;
    answer: string | null;
};

export type GradingQuestion = {
    questionId: string;
    orderIndex: number | null;
    questionText: string;
    questionType: string | null;
    maxPoints: number;
    // Max points per blank for open-ended questions, in blank order.
    blankMaxPoints: number[];
    choices: GradingChoice[];
    acceptedAnswers: GradingAcceptedAnswer[];
    answers: StudentAnswerApiItem[];
    contentFormat: ContentFormat;
    hasImage: boolean;
    // Pages the student uploaded for a handwritten question.
    files: AnswerFile[];
};

export type AttemptGrading = {
    attemptId: string;
    quizId: string;
    quizTitle: string | null;
    gradingMode: GradingMode;
    status: QuizAttemptStatus;
    points: number;
    totalMaxPoints: number;
    questions: GradingQuestion[];
    subjectId: string;
    questionsToAnswer: number | null;
};

export type PendingReviewAttempt = {
    attemptId: string;
    quizId: string;
    quizTitle: string | null;
    studentId: string;
    studentName: string | null;
    completedAt: string | null;
};
