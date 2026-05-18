import { useQuery } from '@tanstack/react-query';
import type { VocabAudioType } from '../services/audio.service';
import { audioService } from '../services/audio.service';
import { authService } from '../services/auth.service';
import { dashboardService } from '../services/dashboard.service';
import { questionAcceptedAnswersService } from '../services/question-accepted-answers.service';
import { questionChoicesService } from '../services/question-choices.service';
import { questionsService } from '../services/questions.service';
import { quizAttemptsService } from '../services/quiz-attempts.service';
import { quizQuestionsService } from '../services/quiz-questions.service';
import { quizStudyGuidesService } from '../services/quiz-study-guides.service';
import { quizzesService } from '../services/quizzes.service';
import type { QuizFilters } from '../services/quizzes.service';
import type { StudentAnswerApiItem } from '../services/student-answers.service';
import { studentAnswersService } from '../services/student-answers.service';
import { readingsService } from '../services/readings.service';
import { usersService } from '../services/users.service';
import { vocabularyService } from '../services/vocabulary.service';
import type {
    QuestionAcceptedAnswerAdminItem,
    QuestionAdminItem,
    QuestionChoiceAdminItem,
    RawQuizQuestionAdminItem,
    ReadingAdminItem,
} from '../types/admin-query-items';
import type { QuizAttemptApiItem } from '../types/api-items/quiz-attempt';
import type { AuthUser } from '../types/auth';
import type { DashboardData } from '../types/dashboard';
import type { QuizQuestion, QuizStudyGuide, QuizSummary } from '../types/quiz';
import type { ReadingItem } from '../types/reading';
import type {
    VocabularyTopicPreview,
    VocabularyWord,
} from '../types/vocabulary';
export type {
    QuestionAcceptedAnswerAdminItem,
    QuestionAdminItem,
    QuestionChoiceAdminItem,
    RawQuizQuestionAdminItem,
    ReadingAdminItem,
} from '../types/admin-query-items';

export function useDashboardOverview() {
    return useQuery<DashboardData>({
        queryKey: ['dashboard-overview'],
        queryFn: () => dashboardService.getOverview(),
    });
}

export function useReadingLibrary() {
    return useQuery<ReadingItem[]>({
        queryKey: ['reading-library'],
        queryFn: () => readingsService.getReadingLibrary(),
    });
}

export function useText(id?: string) {
    return useQuery({
        queryKey: ['text', id],
        queryFn: () => readingsService.findOne(id!),
        enabled: !!id,
    });
}

export function useAuthUser() {
    return useQuery<AuthUser | null>({
        queryKey: ['auth-user'],
        queryFn: () => authService.getUser(),
        retry: false,
        staleTime: 0,
        refetchOnMount: 'always',
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    });
}

export function useQuizAttempts(quizId?: string, userId?: string) {
    return useQuery<QuizAttemptApiItem[]>({
        queryKey: ['quiz-attempts', quizId, userId],
        enabled: Boolean(userId) && Boolean(quizId),
        queryFn: async () => {
            const attempts = await quizAttemptsService.findByUserIdAndQuizId(
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
        queryKey: ['quiz-questions', quizId],
        enabled: Boolean(quizId),
        queryFn: () => quizQuestionsService.getFullQuiz(quizId),
    });
}

export function useQuizzes(filters: QuizFilters = {}) {
    return useQuery<QuizSummary[]>({
        queryKey: ['quizzes', filters],
        queryFn: () => quizzesService.findAll(filters),
    });
}

export function useQuizStudyGuides(quizId?: string) {
    return useQuery<QuizStudyGuide[]>({
        queryKey: ['quiz-study-guides', quizId],
        enabled: Boolean(quizId),
        queryFn: () => quizStudyGuidesService.findByQuizId(quizId as string),
    });
}

export function useStudentAnswersByAttempt(attemptId?: string) {
    return useQuery<StudentAnswerApiItem[]>({
        queryKey: ['student-answers', attemptId],
        enabled: Boolean(attemptId),
        queryFn: () => studentAnswersService.findByAttempt(attemptId),
    });
}

// ─── Admin queries ───────────────────────────────────────────────────────────

export function useQuestions() {
    return useQuery<QuestionAdminItem[]>({
        queryKey: ['questions'],
        queryFn: () => questionsService.listAdmin(),
    });
}

export function useQuestionChoicesByQuestion(questionId?: string) {
    return useQuery<QuestionChoiceAdminItem[]>({
        queryKey: ['question-choices', questionId],
        enabled: Boolean(questionId),
        queryFn: () => questionChoicesService.findByQuestionIdAdmin(questionId),
    });
}

export function useQuestionAcceptedAnswers() {
    return useQuery<QuestionAcceptedAnswerAdminItem[]>({
        queryKey: ['question-accepted-answers'],
        queryFn: () => questionAcceptedAnswersService.listAdmin(),
    });
}

export function useRawQuizQuestions(quizId?: string) {
    return useQuery<RawQuizQuestionAdminItem[]>({
        queryKey: ['raw-quiz-questions', quizId],
        enabled: Boolean(quizId),
        queryFn: () => quizQuestionsService.findByUserId(quizId),
    });
}

export function useReadings() {
    return useQuery<ReadingAdminItem[]>({
        queryKey: ['readings'],
        queryFn: () => readingsService.listAdmin(),
    });
}

export function useVocabularyTopics() {
    return useQuery<VocabularyTopicPreview[]>({
        queryKey: ['vocabulary-topics'],
        queryFn: () => vocabularyService.listTopicsPreview(),
    });
}

export function useVocabularyTopicWords(topicId?: string) {
    return useQuery<VocabularyWord[]>({
        queryKey: ['vocabulary-topic-words', topicId],
        enabled: Boolean(topicId),
        queryFn: () => vocabularyService.listWordsForTopic(topicId as string),
    });
}

export function useAllStudents() {
    return useQuery<AuthUser[]>({
        queryKey: ['all-students'],
        queryFn: () => usersService.findStudentsByTeacherId(),
    });
}

export function usePendingStudents() {
    return useQuery<AuthUser[]>({
        queryKey: ['pending-students'],
        queryFn: () => usersService.findStudentsByTeacherId(false),
    });
}

export function useTeachers() {
    return useQuery<AuthUser[]>({
        queryKey: ['teachers'],
        queryFn: () => usersService.findAllTeachers(),
    });
}

export function useStudentQuizAttempts(userId?: string) {
    return useQuery<QuizAttemptApiItem[]>({
        queryKey: ['student-quiz-attempts', userId],
        enabled: Boolean(userId),
        queryFn: () => quizAttemptsService.findByUserId(userId as string),
    });
}

function audioQuery(queryKey: unknown[], queryFn: () => Promise<string>) {
    return {
        queryKey,
        queryFn,
        retry: false,
        staleTime: Infinity,
        gcTime: Infinity,
    } as const;
}

export function useVocabAudio(word: string, type: VocabAudioType) {
    return useQuery<string>(
        audioQuery(['vocab-audio', word.toLowerCase(), type], () =>
            audioService.fetchVocabAudio(word, type),
        ),
    );
}

export function useQuestionAudio(questionId: string) {
    return useQuery<string>(
        audioQuery(['question-audio', questionId], () =>
            audioService.fetchQuestionAudio(questionId),
        ),
    );
}
