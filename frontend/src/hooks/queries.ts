import { useQuery } from "@tanstack/react-query";
import { answersService } from "../services/answers.service";
import { authService } from "../services/auth.service";
import { dashboardService } from "../services/dashboard.service";
import { questionOptionsService } from "../services/question-options.service";
import { questionsService } from "../services/questions.service";
import { quizAttemptsService } from "../services/quiz-attempts.service";
import { quizQuestionsService } from "../services/quiz-questions.service";
import { quizzesService } from "../services/quizzes.service";
import { usersService } from "../services/users.service";
import type { StudentAnswerApiItem } from "../services/student-answers.service";
import { studentAnswersService } from "../services/student-answers.service";
import { textsService } from "../services/texts.service";
import { vocabularyService } from "../services/vocabulary.service";
import type {
    AnswerAdminItem,
    QuestionAdminItem,
    QuestionOptionAdminItem,
    RawQuizQuestionAdminItem,
    TextAdminItem,
} from "../types/admin-query-items";
import type { QuizAttemptApiItem } from "../types/api-items/quiz-attempt";
import type { AuthUser } from "../types/auth";
import type { DashboardData } from "../types/dashboard";
import type { QuizQuestion, QuizSummary, QuizTopic } from "../types/quiz";
import type { ReadingItem } from "../types/reading";
import type {
    VocabularyTopicPreview,
    VocabularyWord,
} from "../types/vocabulary";
export type {
    AnswerAdminItem,
    QuestionAdminItem,
    QuestionOptionAdminItem,
    RawQuizQuestionAdminItem,
    TextAdminItem,
} from "../types/admin-query-items";

export function useDashboardOverview() {
    return useQuery<DashboardData>({
        queryKey: ["dashboard-overview"],
        queryFn: () => dashboardService.getOverview(),
    });
}

export function useReadingLibrary() {
    return useQuery<ReadingItem[]>({
        queryKey: ["reading-library"],
        queryFn: () => textsService.getReadingLibrary(),
    });
}

export function useAuthUser() {
    return useQuery<AuthUser | null>({
        queryKey: ["auth-user"],
        queryFn: () => authService.getUserOrNull(),
        retry: false,
        staleTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    });
}

export function useQuizAttempts(quizId?: string, userId?: string) {
    return useQuery<QuizAttemptApiItem[]>({
        queryKey: ["quiz-attempts", quizId, userId],
        enabled: Boolean(userId) && Boolean(quizId),
        queryFn: async () => {
            const attempts = await quizAttemptsService.listByUserAndQuiz(
                userId!,
                quizId!,
            );
            return attempts.sort(
                (a, b) =>
                    new Date(b.startedAt).getTime() -
                    new Date(a.startedAt).getTime(),
            );
        },
    });
}

export function useQuizQuestions(quizId?: string) {
    return useQuery<QuizQuestion[]>({
        queryKey: ["quiz-questions", quizId],
        enabled: Boolean(quizId),
        queryFn: () => quizQuestionsService.listForQuiz(quizId),
    });
}

export function useQuizzes() {
    return useQuery<QuizSummary[]>({
        queryKey: ["quizzes"],
        queryFn: () => quizzesService.list(),
    });
}

export function useQuizTopics(quizId?: string) {
    return useQuery<QuizTopic[]>({
        queryKey: ["quiz-topics", quizId],
        enabled: Boolean(quizId),
        queryFn: () => quizzesService.listTopics(quizId as string),
    });
}

export function useStudentAnswersByAttempt(attemptId?: string) {
    return useQuery<StudentAnswerApiItem[]>({
        queryKey: ["student-answers", attemptId],
        enabled: Boolean(attemptId),
        queryFn: () => studentAnswersService.listByAttempt(attemptId),
    });
}

// ─── Admin queries ───────────────────────────────────────────────────────────

export function useQuestions() {
    return useQuery<QuestionAdminItem[]>({
        queryKey: ["questions"],
        queryFn: () => questionsService.listAdmin(),
    });
}

export function useQuestionOptionsByQuestion(questionId?: string) {
    return useQuery<QuestionOptionAdminItem[]>({
        queryKey: ["question-options", questionId],
        enabled: Boolean(questionId),
        queryFn: () => questionOptionsService.listAdminByQuestion(questionId),
    });
}

export function useAnswers() {
    return useQuery<AnswerAdminItem[]>({
        queryKey: ["answers"],
        queryFn: () => answersService.listAdmin(),
    });
}

export function useRawQuizQuestions(quizId?: string) {
    return useQuery<RawQuizQuestionAdminItem[]>({
        queryKey: ["raw-quiz-questions", quizId],
        enabled: Boolean(quizId),
        queryFn: () => quizQuestionsService.listRawAdminByQuiz(quizId),
    });
}

export function useTexts() {
    return useQuery<TextAdminItem[]>({
        queryKey: ["texts"],
        queryFn: () => textsService.listAdmin(),
    });
}

export function useVocabularyTopics() {
    return useQuery<VocabularyTopicPreview[]>({
        queryKey: ["vocabulary-topics"],
        queryFn: () => vocabularyService.listTopicsPreview(),
    });
}

export function useVocabularyTopicWords(topicId?: string) {
    return useQuery<VocabularyWord[]>({
        queryKey: ["vocabulary-topic-words", topicId],
        enabled: Boolean(topicId),
        queryFn: () => vocabularyService.listWordsForTopic(topicId as string),
    });
}

export function useAllStudents() {
    return useQuery<AuthUser[]>({
        queryKey: ["all-students"],
        queryFn: () => usersService.listAllStudents(),
    });
}

export function useStudentQuizAttempts(studentId?: string) {
    return useQuery<QuizAttemptApiItem[]>({
        queryKey: ["student-quiz-attempts", studentId],
        enabled: Boolean(studentId),
        queryFn: () => quizAttemptsService.listByStudentId(studentId as string),
    });
}
