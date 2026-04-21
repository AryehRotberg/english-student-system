import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { questionAcceptedAnswersService } from '../services/question-accepted-answers.service';
import { authService } from '../services/auth.service';
import { questionChoicesService } from '../services/question-choices.service';
import { questionsService } from '../services/questions.service';
import { quizAttemptsService } from '../services/quiz-attempts.service';
import { quizQuestionsService } from '../services/quiz-questions.service';
import { quizzesService } from '../services/quizzes.service';
import { studentAnswersService } from '../services/student-answers.service';
import { textsService } from '../services/texts.service';
import { usersService } from '../services/users.service';
import { isUuid } from '../utils/isUuid';

export function useSubmitStudentAnswer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: {
            attemptId: string;
            questionId: string;
            textAnswers?: string[] | null;
            selectedOptionId?: string | null;
            feedback?: string | null;
        }) => {
            if (!isUuid(payload.attemptId)) {
                throw new Error(
                    'Quiz attempt ID is missing or invalid. Set a valid UUID before submitting answers.',
                );
            }

            return studentAnswersService.upsert({
                attemptId: payload.attemptId,
                questionId: payload.questionId,
                textAnswers: payload.textAnswers,
                selectedOptionId: payload.selectedOptionId,
                feedback: payload.feedback,
            });
        },
        onSuccess: async (_data, variables) => {
            await queryClient.invalidateQueries({
                queryKey: ['quiz-attempts'],
            });
            await queryClient.invalidateQueries({
                queryKey: ['student-answers', variables.attemptId],
            });
        },
    });
}

export function useSubmitQuizAttempt() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (attemptId: string) =>
            quizAttemptsService.submitAttempt(attemptId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quiz-attempts'] });
        },
    });
}

export function useStartQuizAttempt() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { quizId: string; userId: string }) =>
            quizAttemptsService.create({
                ...payload,
                points: 0,
                startedAt: new Date().toISOString(),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quiz-attempts'] });
        },
    });
}

// ─── Admin mutations ─────────────────────────────────────────────────────────

export function useCreateQuiz() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { title: string; description?: string }) =>
            quizzesService.create(payload),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['quizzes'] }),
    });
}

export function useCreateQuestion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: {
            question: string;
            questionType: string;
            audioUrl?: string;
        }) => questionsService.create(payload),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['questions'] }),
    });
}

export function useCreateQuestionChoice() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: {
            questionId: string;
            optionText: string;
            isCorrect: boolean;
        }) => questionChoicesService.create(payload),
        onSuccess: (_data, variables) =>
            queryClient.invalidateQueries({
                queryKey: ['question-choices', variables.questionId],
            }),
    });
}

export function useUpdateQuestionChoice() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            optionText,
            isCorrect,
        }: {
            id: string;
            questionId: string;
            optionText?: string;
            isCorrect?: boolean;
        }) => questionChoicesService.update(id, { optionText, isCorrect }),
        onSuccess: (_data, variables) =>
            queryClient.invalidateQueries({
                queryKey: ['question-choices', variables.questionId],
            }),
    });
}

export function useCreateQuestionAcceptedAnswer() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: {
            questionId: string;
            answer: string;
            blankIndex: number;
        }) => questionAcceptedAnswersService.create(payload),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['question-accepted-answers'] }),
    });
}

export function useUpdateQuestionAcceptedAnswer() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            ...payload
        }: {
            id: string;
            answer?: string;
            blankIndex?: number;
        }) => questionAcceptedAnswersService.update(id, payload),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['question-accepted-answers'] }),
    });
}

export function useCreateQuizQuestion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: {
            quizId: string;
            questionId: string;
            maxPoints: number;
        }) => quizQuestionsService.create(payload),
        onSuccess: (_data, variables) =>
            queryClient.invalidateQueries({
                queryKey: ['raw-quiz-questions', variables.quizId],
            }),
    });
}

export function useUpdateQuizQuestion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            ...payload
        }: {
            id: string;
            quizId?: string;
            questionId?: string;
            maxPoints?: number;
        }) => quizQuestionsService.update(id, payload),
        onSuccess: (_data, variables) =>
            queryClient.invalidateQueries({
                queryKey: ['raw-quiz-questions', variables.quizId],
            }),
    });
}

export function useCreateText() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: {
            title: string;
            content: string;
            level: string;
        }) => textsService.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reading-library'] });
            queryClient.invalidateQueries({ queryKey: ['texts'] });
        },
    });
}

// ─── Auth mutations ───────────────────────────────────────────────────────────

export function useRegister() {
    return useMutation({
        mutationFn: async (payload: {
            name: string;
            email: string;
            password: string;
            teacherId: string;
        }) => {
            try {
                return await authService.register(payload);
            } catch (error) {
                if (isAxiosError(error)) {
                    const message =
                        (error.response?.data as { message?: string })
                            ?.message ?? error.message;
                    throw new Error(message);
                }
                throw error;
            }
        },
    });
}

export function useLogin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: { email: string; password: string }) => {
            try {
                return await authService.login(payload);
            } catch (error) {
                if (isAxiosError(error)) {
                    const message =
                        (error.response?.data as { message?: string })
                            ?.message ?? error.message;
                    throw new Error(message);
                }
                throw error;
            }
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['auth-user'] });
            await queryClient.invalidateQueries({
                queryKey: ['dashboard-overview'],
            });
        },
    });
}

// ─── User mutations ───────────────────────────────────────────────────────────

export function useApproveStudent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => usersService.approve(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pending-students'] });
            queryClient.invalidateQueries({ queryKey: ['all-students'] });
        },
    });
}

export function useRemoveStudent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => usersService.remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pending-students'] });
            queryClient.invalidateQueries({ queryKey: ['all-students'] });
        },
    });
}
