import { useQuery } from '@tanstack/react-query';
import { answersService } from '../services/answers.service';
import { assignmentItemsService } from '../services/assignment-items.service';
import { assignmentsService } from '../services/assignments.service';
import { authService } from '../services/auth.service';
import { questionOptionsService } from '../services/question-options.service';
import { questionsService } from '../services/questions.service';
import { quizAttemptsService } from '../services/quiz-attempts.service';
import { quizQuestionsService } from '../services/quiz-questions.service';
import { quizzesService } from '../services/quizzes.service';
import type { StudentAnswerApiItem } from '../services/student-answers.service';
import type { ProgressItem } from '../types/progress';
import { studentAnswersService } from '../services/student-answers.service';
import { textsService } from '../services/texts.service';
import type { AuthUser } from '../types/auth';
import type { DashboardData } from '../types/dashboard';
import type { QuizQuestion, QuizSummary, QuizTopic } from '../types/quiz';
import type { ReadingItem, ReadingLevel } from '../types/reading';
import type { AssignmentTopic, DailyTask } from '../types/task';

type TextApiItem = {
    id: string;
    title: string;
    level: string;
    content?: string;
};

type QuizQuestionApiItem = {
    id: string;
    questionId: string;
    question?: string;
    questionType?: string;
    prompt?: string;
    maxPoints?: number;
};

type AssignmentApiItem = {
    id: string;
    title: string;
    description: string;
    status: 'assigned' | 'completed';
    createdAt: string;
};

type AssignmentTopicApiItem = {
    id: string;
    assignmentId: string;
    assignmentTitle: string;
    assignmentDescription: string;
    status: 'assigned' | 'completed';
    contentType: 'quiz' | 'text' | 'writing';
    contentId: string;
    title: string;
};

type QuizAttemptApiItem = {
    id: string;
    points: number | null;
    startedAt: string;
    completedAt: string | null;
};

type QuestionOptionApiItem = {
    id: string;
    optionText: string;
};

type AnswerApiItem = {
    questionId: string;
    blankIndex: number;
};

function toReadingLevel(value: string): ReadingLevel {
    if (value === 'A2' || value === 'B1' || value === 'B2' || value === 'C1') {
        return value;
    }

    return 'B1';
}

export function useDashboardOverview() {
    return useQuery<DashboardData>({
        queryKey: ['dashboard-overview'],
        queryFn: async () => {
            const user = await authService.me();
            const assignments = (await assignmentsService.listByUser(user.id)) as AssignmentApiItem[];
            const assignmentItems = (await assignmentItemsService.listByUser(user.id)) as AssignmentTopicApiItem[];

            const activeAssignmentItems = assignmentItems.filter((item) => item.status !== 'completed');
            const activeAssignmentIds = new Set(activeAssignmentItems.map((item) => item.assignmentId));

            const tasks: DailyTask[] = assignments
                .filter((assignment) => activeAssignmentIds.has(assignment.id))
                .slice(0, 4)
                .map((assignment) => ({
                id: assignment.id,
                title: assignment.title,
                description: assignment.description ?? 'No description.',
                category: assignment.title.toLowerCase().includes('listen')
                    ? 'listening'
                    : assignment.title.toLowerCase().includes('vocab')
                        ? 'vocabulary'
                        : assignment.title.toLowerCase().includes('grammar')
                            ? 'grammar'
                            : 'reading',
                }));

            const assignmentTopics: AssignmentTopic[] = activeAssignmentItems
                .filter((item) => item.contentType === 'quiz' && Boolean(item.contentId))
                .map((item) => ({
                    id: item.id,
                    assignmentTitle: item.assignmentTitle,
                    assignmentDescription: item.assignmentDescription ?? 'No assignment description.',
                    topicTitle: item.title,
                    contentType: item.contentType,
                    contentId: item.contentId,
                }));

            // Determine which content types are actually assigned to this student.
            const assignedContentTypes = new Set(assignmentItems.map((item) => item.contentType));

            // ── Quiz progress: item status with completed-attempt fallback for legacy rows ──
            const assignedQuizItems = assignmentItems.filter(
                (item) => item.contentType === 'quiz' && Boolean(item.contentId),
            );

            const assignedQuizItemsCompleted = (
                await Promise.all(
                    assignedQuizItems.map(async (item) => {
                        if (item.status === 'completed') {
                            return true;
                        }

                        const attempts = (await quizAttemptsService.listByUserAndQuiz(user.id, item.contentId)) as QuizAttemptApiItem[];
                        return attempts.some((attempt) => attempt.completedAt !== null);
                    }),
                )
            ).filter(Boolean).length;

            const quizProgress = assignedQuizItems.length > 0
                ? Math.round((assignedQuizItemsCompleted / assignedQuizItems.length) * 100)
                : 0;

            // ── Text / writing progress: based on item-level completion status ──
            const progressForType = (type: 'text' | 'writing') => {
                const items = assignmentItems.filter((item) => item.contentType === type);
                const total = items.length;
                const completed = items.filter((item) => item.status === 'completed').length;

                return total > 0 ? Math.round((completed / total) * 100) : 0;
            };

            // Build only the progress bars that are relevant to this student's assignments.
            const progress: ProgressItem[] = [];

            if (assignedContentTypes.has('quiz')) {
                progress.push({ id: 'quiz', label: 'Quiz', percent: quizProgress });
            }

            if (assignedContentTypes.has('text')) {
                progress.push({ id: 'reading', label: 'Reading', percent: progressForType('text') });
            }

            if (assignedContentTypes.has('writing')) {
                progress.push({ id: 'writing', label: 'Writing', percent: progressForType('writing') });
            }

            return {
                studentName: user.name,
                tasks,
                progress,
                assignmentTopics,
                activities: assignments
                    .slice(0, 5)
                    .map((assignment) => ({
                        id: assignment.id,
                        title: `${assignment.status === 'completed' ? 'Completed' : 'Assigned'}: ${assignment.title}`,
                    })),
            };
        },
    });
}

export function useReadingLibrary() {
    return useQuery<ReadingItem[]>({
        queryKey: ['reading-library'],
        queryFn: async () => {
            const data = (await textsService.list()) as TextApiItem[];

            if (!Array.isArray(data)) {
                return [];
            }

            return data.map((item) => ({
                id: item.id,
                title: item.title,
                level: toReadingLevel(item.level),
                minutes: Math.min(Math.max(Math.ceil((item.content?.length ?? 800) / 170), 3), 12),
            }));
        },
    });
}

export function useAuthUser() {
    return useQuery<AuthUser | null>({
        queryKey: ['auth-user'],
        queryFn: async () => {
            try {
                return await authService.me();
            } catch {
                return null;
            }
        },
        retry: false,
    });
}

export function useQuizAttemptId(quizId?: string, userId?: string) {
    return useQuery<string>({
        queryKey: ['quiz-attempt-id', quizId, userId],
        enabled: Boolean(userId) && Boolean(quizId),
        queryFn: async () => {
            if (!userId || !quizId) {
                throw new Error('Missing quiz attempt context');
            }

            const attempts = (await quizAttemptsService.listByUserAndQuiz(userId, quizId)) as QuizAttemptApiItem[];

            const inProgressAttempt = attempts
                .filter((attempt) => attempt.completedAt === null)
                .sort(
                    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
                )[0];

            if (inProgressAttempt) {
                return inProgressAttempt.id;
            }

            const createdAttempt = (await quizAttemptsService.create({
                quizId,
                userId,
                points: 0,
                startedAt: new Date().toISOString(),
            })) as { id: string };

            return createdAttempt.id;
        },
    });
}

export function useQuizAttempts(quizId?: string, userId?: string) {
    return useQuery<QuizAttemptApiItem[]>({
        queryKey: ['quiz-attempts', quizId, userId],
        enabled: Boolean(userId) && Boolean(quizId),
        queryFn: async () => {
            if (!userId || !quizId) {
                return [];
            }

            const attempts = (await quizAttemptsService.listByUserAndQuiz(userId, quizId)) as QuizAttemptApiItem[];

            return attempts.sort(
                (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
            );
        },
    });
}

export function useQuizQuestions(quizId?: string) {
    return useQuery<QuizQuestion[]>({
        queryKey: ['quiz-questions', quizId],
        enabled: Boolean(quizId),
        queryFn: async () => {
            if (!quizId) {
                return [];
            }

            const data = (await quizQuestionsService.listByQuiz(quizId)) as QuizQuestionApiItem[];

            if (!Array.isArray(data) || data.length === 0) {
                throw new Error('No quiz questions found for this quiz.');
            }

            const allAnswers = (await answersService.list()) as AnswerApiItem[];

            const questions = await Promise.all(
                data.map(async (question, index) => {
                    const optionData = (await questionOptionsService.listByQuestion(question.questionId)) as QuestionOptionApiItem[];
                    const questionAnswers = allAnswers.filter((answer) => answer.questionId === question.questionId);
                    const blankCount = questionAnswers.reduce((max, answer) => Math.max(max, Number(answer.blankIndex)), 0);

                    return {
                        id: question.id,
                        questionId: question.questionId,
                        prompt: question.question ?? question.prompt ?? 'Question text not available.',
                        questionType: question.questionType ?? (optionData.length > 0 ? 'multiple_choice' : 'open_ended'),
                        maxPoints: Number(question.maxPoints ?? 0),
                        questionNumber: index + 1,
                        totalQuestions: data.length,
                        blankCount,
                        options: optionData.map((option) => ({
                            id: option.id,
                            value: option.optionText,
                            label: option.optionText,
                        })),
                    };
                }),
            );

            return questions;
        },
    });
}

export function useQuizzes() {
    return useQuery<QuizSummary[]>({
        queryKey: ['quizzes'],
        queryFn: async () => {
            const quizzes = (await quizzesService.list()) as QuizSummary[];
            return Array.isArray(quizzes) ? quizzes : [];
        },
    });
}

export function useQuizTopics(quizId?: string) {
    return useQuery<QuizTopic[]>({
        queryKey: ['quiz-topics', quizId],
        enabled: Boolean(quizId),
        queryFn: async () => {
            if (!quizId) {
                return [];
            }

            const topics = (await quizzesService.listTopics(quizId)) as QuizTopic[];
            return Array.isArray(topics) ? topics : [];
        },
    });
}

export function useStudentAnswersByAttempt(attemptId?: string) {
    return useQuery<StudentAnswerApiItem[]>({
        queryKey: ['student-answers', attemptId],
        enabled: Boolean(attemptId),
        queryFn: async () => {
            if (!attemptId) {
                return [];
            }

            const answers = await studentAnswersService.list();
            return answers.filter((answer) => answer.attemptId === attemptId);
        },
    });
}

// ─── Admin queries ───────────────────────────────────────────────────────────

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

export function useQuestions() {
    return useQuery<QuestionAdminItem[]>({
        queryKey: ['questions'],
        queryFn: async () => {
            const data = await questionsService.list();
            return Array.isArray(data) ? (data as QuestionAdminItem[]) : [];
        },
    });
}

export function useQuestionOptionsByQuestion(questionId?: string) {
    return useQuery<QuestionOptionAdminItem[]>({
        queryKey: ['question-options', questionId],
        enabled: Boolean(questionId),
        queryFn: async () => {
            if (!questionId) return [];
            const data = await questionOptionsService.listByQuestion(questionId);
            return Array.isArray(data) ? (data as QuestionOptionAdminItem[]) : [];
        },
    });
}

export function useAnswers() {
    return useQuery<AnswerAdminItem[]>({
        queryKey: ['answers'],
        queryFn: async () => {
            const data = await answersService.list();
            return Array.isArray(data) ? (data as AnswerAdminItem[]) : [];
        },
    });
}

export function useRawQuizQuestions(quizId?: string) {
    return useQuery<RawQuizQuestionAdminItem[]>({
        queryKey: ['raw-quiz-questions', quizId],
        enabled: Boolean(quizId),
        queryFn: async () => {
            if (!quizId) return [];
            const data = await quizQuestionsService.listByQuiz(quizId);
            return Array.isArray(data) ? (data as RawQuizQuestionAdminItem[]) : [];
        },
    });
}

export function useTexts() {
    return useQuery<TextAdminItem[]>({
        queryKey: ['texts'],
        queryFn: async () => {
            const data = await textsService.list();
            return Array.isArray(data) ? (data as TextAdminItem[]) : [];
        },
    });
}
