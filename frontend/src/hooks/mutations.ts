import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { assignmentItemsService } from '../services/assignment-items.service';
import type { AssignmentItemContentType } from '../services/assignments.service';
import { assignmentsService } from '../services/assignments.service';
import { authService } from '../services/auth.service';
import { questionAcceptedAnswersService } from '../services/question-accepted-answers.service';
import { questionChoicesService } from '../services/question-choices.service';
import { questionsService } from '../services/questions.service';
import { quizAttemptsService } from '../services/quiz-attempts.service';
import { quizQuestionsService } from '../services/quiz-questions.service';
import { quizzesService } from '../services/quizzes.service';
import { studentAnswersService } from '../services/student-answers.service';
import { readingsService } from '../services/readings.service';
import { usersService } from '../services/users.service';
import { vocabularyService } from '../services/vocabulary.service';
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
        mutationFn: (payload: { quizId: string; quizTitle: string }) =>
            quizAttemptsService.create({
                ...payload,
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
            queryClient.invalidateQueries({
                queryKey: ['question-accepted-answers'],
            }),
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
            queryClient.invalidateQueries({
                queryKey: ['question-accepted-answers'],
            }),
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
            quizId?: string;
            vocabularyTopicId?: string;
        }) => readingsService.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reading-library'] });
            queryClient.invalidateQueries({ queryKey: ['readings'] });
        },
    });
}

export function useUpdateText() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            ...payload
        }: {
            id: string;
            title?: string;
            content?: string;
            level?: string;
            quizId?: string | null;
            vocabularyTopicId?: string | null;
        }) => readingsService.update(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reading-library'] });
            queryClient.invalidateQueries({ queryKey: ['readings'] });
        },
    });
}

export function useCreateVocabularyTopic() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { topic: string; description?: string }) =>
            vocabularyService.createTopic(payload),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['vocabulary-topics'] }),
    });
}

export function useUpdateVocabularyTopic() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            ...payload
        }: {
            id: string;
            topic?: string;
            description?: string;
        }) => vocabularyService.updateTopic(id, payload),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['vocabulary-topics'] }),
    });
}

export function useCreateVocabularyWord() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: {
            topicId: string;
            word: string;
            meaning?: string;
            example?: string;
            translation?: string;
        }) =>
            vocabularyService
                .createVocabularyWord({
                    word: payload.word,
                    meaning: payload.meaning,
                    example: payload.example,
                    translation: payload.translation,
                })
                .then((vocab) =>
                    vocabularyService.createTopicWord({
                        vocabularyId: vocab.id,
                        topicId: payload.topicId,
                    }),
                ),
        onSuccess: (_data, variables) =>
            queryClient.invalidateQueries({
                queryKey: ['vocabulary-topic-words', variables.topicId],
            }),
    });
}

export function useUpdateVocabularyWord() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            topicId,
            ...payload
        }: {
            id: string;
            topicId: string;
            word?: string;
            meaning?: string;
            example?: string;
            translation?: string;
        }) => vocabularyService.updateVocabularyWord(id, payload),
        onSuccess: (_data, variables) =>
            queryClient.invalidateQueries({
                queryKey: ['vocabulary-topic-words', variables.topicId],
            }),
    });
}

export function useDeleteQuiz() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => quizzesService.remove(id),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['quizzes'] }),
    });
}

export function useDeleteQuestion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => questionsService.remove(id),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['questions'] }),
    });
}

export function useDeleteText() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => readingsService.remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['readings'] });
            queryClient.invalidateQueries({ queryKey: ['reading-library'] });
        },
    });
}

export function useDeleteVocabularyTopic() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => vocabularyService.removeTopic(id),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['vocabulary-topics'] }),
    });
}

export function useDeleteVocabularyWord() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            topicId: _topicId,
        }: {
            id: string;
            topicId: string;
        }) => vocabularyService.removeWord(id),
        onSuccess: (_data, variables) =>
            queryClient.invalidateQueries({
                queryKey: ['vocabulary-topic-words', variables.topicId],
            }),
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

// ─── Assignment mutations ─────────────────────────────────────────────────────

export function useCreateAssignment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: {
            userId: string;
            title: string;
            description: string;
            dueDate: string;
            items?: {
                contentType: AssignmentItemContentType;
                contentId: string;
            }[];
        }) => assignmentsService.create(payload),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['assignments', variables.userId],
            });
            queryClient.invalidateQueries({
                queryKey: ['assignment-items', variables.userId],
            });
        },
    });
}

export function useUpdateAssignment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            ...payload
        }: {
            id: string;
            userId: string;
            title?: string;
            description?: string;
            dueDate?: string;
            isCompleted?: boolean;
        }) =>
            assignmentsService.update(id, {
                title: payload.title,
                description: payload.description,
                dueDate: payload.dueDate,
                isCompleted: payload.isCompleted,
            }),
        onSuccess: (_data, variables) =>
            queryClient.invalidateQueries({
                queryKey: ['assignments', variables.userId],
            }),
    });
}

export function useDeleteAssignment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id }: { id: string; userId: string }) =>
            assignmentsService.remove(id),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['assignments', variables.userId],
            });
            queryClient.invalidateQueries({
                queryKey: ['assignment-items', variables.userId],
            });
        },
    });
}

export function useCreateAssignmentItem() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: {
            userId: string;
            assignmentId: string;
            contentType: AssignmentItemContentType;
            contentId: string;
        }) =>
            assignmentItemsService.create({
                assignmentId: payload.assignmentId,
                contentType: payload.contentType,
                contentId: payload.contentId,
            }),
        onSuccess: (_data, variables) =>
            queryClient.invalidateQueries({
                queryKey: ['assignment-items', variables.userId],
            }),
    });
}

export function useUpdateAssignmentItem() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            ...payload
        }: {
            id: string;
            userId: string;
            contentType?: AssignmentItemContentType;
            contentId?: string;
            isCompleted?: boolean;
        }) =>
            assignmentItemsService.update(id, {
                contentType: payload.contentType,
                contentId: payload.contentId,
                isCompleted: payload.isCompleted,
            }),
        onSuccess: (_data, variables) =>
            queryClient.invalidateQueries({
                queryKey: ['assignment-items', variables.userId],
            }),
    });
}

export function useDeleteAssignmentItem() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id }: { id: string; userId: string }) =>
            assignmentItemsService.remove(id),
        onSuccess: (_data, variables) =>
            queryClient.invalidateQueries({
                queryKey: ['assignment-items', variables.userId],
            }),
    });
}
