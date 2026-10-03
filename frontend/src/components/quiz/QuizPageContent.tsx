import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QuizActiveView } from '../../components/quiz/QuizActiveView';
import { QuizAttemptsViewer } from '../../components/quiz/QuizAttemptsViewer';
import { QuizRetakeScreen } from '../../components/quiz/QuizRetakeScreen';
import { QuizSetupScreen } from '../../components/quiz/QuizSetupScreen';
import {
    useStartQuizAttempt,
    useSubmitQuizAttempt,
} from '../../hooks/mutations';
import {
    useAuthUser,
    useQuizAttempts,
    useQuizQuestions,
    useQuizStudyGuides,
    useStudentAnswersByAttempt,
} from '../../hooks/queries';
import styles from '../../pages/Quiz/QuizPage.module.css';
import type { QuizSummary } from '../../types/quiz';
import { isHandwritten } from '../../utils/exam';
import { HandwrittenExamView } from '../exam/HandwrittenExamView';
import { QuizStudyGuidesSection } from './QuizStudyGuidesSection';

type QuizPageContentProps = {
    quizId: string;
    quizTitle: string;
    quiz: QuizSummary | undefined;
};

export function QuizPageContent({
    quizId,
    quizTitle,
    quiz,
}: QuizPageContentProps) {
    const { t } = useTranslation();
    const [isCompleted, setIsCompleted] = useState(false);
    const [viewAttemptId, setViewAttemptId] = useState<string | null>(null);

    const { data: user } = useAuthUser();
    const { data: questions } = useQuizQuestions(quizId);
    const { data: studyGuides = [] } = useQuizStudyGuides(quizId);

    const { data: attempts = [], isLoading: isAttemptLoading } =
        useQuizAttempts(quizId, user?.id);
    const activeAttempt = attempts.find((a) => a.completedAt === null);
    const attemptId = activeAttempt?.id ?? null;

    const submitAttemptMutation = useSubmitQuizAttempt();
    const startAttemptMutation = useStartQuizAttempt();

    const { data: activeAttemptAnswers = [] } = useStudentAnswersByAttempt(
        attemptId ?? undefined,
    );

    const completedAttempts = attempts.filter(
        (attempt) => attempt.completedAt !== null,
    );
    const isViewingResults = viewAttemptId !== null;

    if (!quizId || !questions || questions.length === 0 || isAttemptLoading) {
        return <p>{t('quiz.loading')}</p>;
    }

    // Any handwritten question turns the attempt into an exam: all questions
    // visible, pages uploaded per question, one submit at the end.
    const isExam = questions.some(isHandwritten);

    const examDetails =
        isExam && quiz ? (
            <ExamRules quiz={quiz} questionCount={questions.length} />
        ) : undefined;

    const handleStartOrRetake = async () => {
        setIsCompleted(false);
        setViewAttemptId(null);
        await startAttemptMutation.mutateAsync({ quizId, quizTitle });
    };

    const submitAttempt = async () => {
        if (!attemptId) {
            return;
        }

        await submitAttemptMutation.mutateAsync(attemptId);

        setIsCompleted(true);
        setViewAttemptId(attemptId);
    };

    const handleQuestionSubmitted = async (isLastQuestion: boolean) => {
        if (isLastQuestion) {
            await submitAttempt();
        }
    };

    const handleViewAttempt = (id: string) => {
        setViewAttemptId(id);
        setIsCompleted(false);
    };

    const handleBackToCurrentQuiz = () => {
        setViewAttemptId(null);
        setIsCompleted(false);
    };

    if (!attemptId && !isViewingResults) {
        if (attempts.length === 0) {
            return (
                <QuizSetupScreen
                    onStart={() => void handleStartOrRetake()}
                    isPending={startAttemptMutation.isPending}
                    details={examDetails}
                />
            );
        }

        return (
            <QuizRetakeScreen
                questionCount={questions.length}
                completedAttempts={completedAttempts}
                isPending={startAttemptMutation.isPending}
                onRetake={() => void handleStartOrRetake()}
                onViewAttempt={handleViewAttempt}
                details={examDetails}
            />
        );
    }

    const savedAnswerQuestionIds = new Set(
        activeAttemptAnswers.map((answer) => answer.questionId),
    );

    return (
        <div className={styles.stack}>
            <QuizStudyGuidesSection quizId={quizId} studyGuides={studyGuides} />

            {isViewingResults ? (
                <QuizAttemptsViewer
                    questions={questions}
                    quiz={quiz}
                    completedAttempts={completedAttempts}
                    isCompleted={isCompleted}
                    viewAttemptId={viewAttemptId}
                    onBack={handleBackToCurrentQuiz}
                    onViewAttempt={handleViewAttempt}
                />
            ) : isExam && activeAttempt ? (
                <HandwrittenExamView
                    attempt={activeAttempt}
                    quiz={quiz}
                    questions={questions}
                    savedAnswerQuestionIds={savedAnswerQuestionIds}
                    isSubmitting={submitAttemptMutation.isPending}
                    submitError={submitAttemptMutation.error}
                    onSubmit={() => void submitAttempt()}
                />
            ) : (
                <QuizActiveView
                    attemptId={attemptId as string}
                    questions={questions}
                    answeredQuestionIds={savedAnswerQuestionIds}
                    completedAttempts={completedAttempts}
                    onSubmitted={(isLastQuestion) =>
                        void handleQuestionSubmitted(isLastQuestion)
                    }
                    onViewAttempt={handleViewAttempt}
                />
            )}
        </div>
    );
}

function ExamRules({
    quiz,
    questionCount,
}: {
    quiz: QuizSummary;
    questionCount: number;
}) {
    const { t } = useTranslation();

    return (
        <>
            <p>{t('exam.instructions')}</p>
            {quiz.questionsToAnswer !== null &&
                quiz.questionsToAnswer < questionCount && (
                    <p>
                        <strong>
                            {t('exam.answerNofM', {
                                required: quiz.questionsToAnswer,
                                total: questionCount,
                            })}
                        </strong>
                    </p>
                )}
            {quiz.timeLimitMinutes ? (
                <p>
                    {t('quizList.timeLimit', {
                        minutes: quiz.timeLimitMinutes,
                    })}
                </p>
            ) : null}
        </>
    );
}
