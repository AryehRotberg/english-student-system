import { useMutation, useQueryClient } from "@tanstack/react-query";
import { answersService } from "../services/answers.service";
import { authService } from "../services/auth.service";
import { questionOptionsService } from "../services/question-options.service";
import { questionsService } from "../services/questions.service";
import { quizQuestionsService } from "../services/quiz-questions.service";
import { quizzesService } from "../services/quizzes.service";
import { studentAnswersService } from "../services/student-answers.service";
import { textsService } from "../services/texts.service";

function isUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        value,
    );
}

export function useSubmitStudentAnswer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: {
            attemptId: string;
            questionId: string;
            selectedOptionId?: string;
            answers?: string[];
        }) => {
            if (!isUuid(payload.attemptId)) {
                throw new Error(
                    "Quiz attempt ID is missing or invalid. Set a valid UUID before submitting answers.",
                );
            }

            const answerData = payload.selectedOptionId
                ? {
                      questionId: payload.questionId,
                      selectedOptionId: payload.selectedOptionId,
                  }
                : {
                      questionId: payload.questionId,
                      answers: payload.answers ?? [],
                  };

            return studentAnswersService.create({
                attemptId: payload.attemptId,
                questionId: payload.questionId,
                answerData,
            });
        },
        onSuccess: async (_data, variables) => {
            await queryClient.invalidateQueries({
                queryKey: ["quiz-attempts"],
            });
            await queryClient.invalidateQueries({
                queryKey: ["student-answers", variables.attemptId],
            });
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
            queryClient.invalidateQueries({ queryKey: ["quizzes"] }),
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
            queryClient.invalidateQueries({ queryKey: ["questions"] }),
    });
}

export function useCreateQuestionOption() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: {
            questionId: string;
            optionText: string;
            isCorrect: boolean;
        }) => questionOptionsService.create(payload),
        onSuccess: (_data, variables) =>
            queryClient.invalidateQueries({
                queryKey: ["question-options", variables.questionId],
            }),
    });
}

export function useUpdateQuestionOption() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            questionId,
            ...payload
        }: {
            id: string;
            questionId: string;
            optionText?: string;
            isCorrect?: boolean;
        }) => questionOptionsService.update(id, payload),
        onSuccess: (_data, variables) =>
            queryClient.invalidateQueries({
                queryKey: ["question-options", variables.questionId],
            }),
    });
}

export function useCreateAnswer() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: {
            questionId: string;
            answer: string;
            blankIndex: number;
        }) => answersService.create(payload),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ["answers"] }),
    });
}

export function useUpdateAnswer() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            ...payload
        }: {
            id: string;
            questionId?: string;
            answer?: string;
            blankIndex?: number;
        }) => answersService.update(id, payload),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ["answers"] }),
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
                queryKey: ["raw-quiz-questions", variables.quizId],
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
                queryKey: ["raw-quiz-questions", variables.quizId],
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
            queryClient.invalidateQueries({ queryKey: ["reading-library"] });
            queryClient.invalidateQueries({ queryKey: ["texts"] });
        },
    });
}

// ─── Auth mutations ───────────────────────────────────────────────────────────

export function useLogin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: { email: string; password: string }) =>
            authService.login(payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["auth-user"] });
            await queryClient.invalidateQueries({
                queryKey: ["dashboard-overview"],
            });
        },
    });
}
