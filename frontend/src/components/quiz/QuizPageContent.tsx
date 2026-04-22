import { useEffect, useRef, useState } from 'react';
import { QuizActiveView } from '../../components/quiz/QuizActiveView';
import { QuizAttemptsViewer } from '../../components/quiz/QuizAttemptsViewer';
import { QuizRetakeScreen } from '../../components/quiz/QuizRetakeScreen';
import { QuizSetupScreen } from '../../components/quiz/QuizSetupScreen';
import { QuizTopicsSection } from '../../components/quiz/QuizTopicsSection';
import {
    useStartQuizAttempt,
    useSubmitQuizAttempt,
} from '../../hooks/mutations';
import {
    useAuthUser,
    useQuizAttempts,
    useQuizQuestions,
    useQuizTopics,
    useStudentAnswersByAttempt,
} from '../../hooks/queries';
import styles from '../../pages/Quiz/QuizPage.module.css';
import { sendEmailService } from '../../services/send-email.service';

type QuizPageContentProps = {
    quizId: string;
    quizTitle: string;
};

export function QuizPageContent({ quizId, quizTitle }: QuizPageContentProps) {
    const [isCompleted, setIsCompleted] = useState(false);
    const [viewAttemptId, setViewAttemptId] = useState<string | null>(null);

    const hasAutoStarted = useRef(false);

    const { data: user } = useAuthUser();
    const { data: questions } = useQuizQuestions(quizId);
    const { data: topics = [] } = useQuizTopics(quizId);

    const { data: attempts = [], isLoading: isAttemptLoading } =
        useQuizAttempts(quizId, user?.id);
    const activeAttempt = attempts.find((a) => a.completedAt === null);
    const attemptId = activeAttempt?.id ?? null;

    const submitAttemptMutation = useSubmitQuizAttempt();
    const startAttemptMutation = useStartQuizAttempt();

    const { data: activeAttemptAnswers = [] } = useStudentAnswersByAttempt(
        attemptId ?? undefined,
    );

    useEffect(() => {
        if (
            !isAttemptLoading &&
            attempts.length === 0 &&
            user?.id &&
            !hasAutoStarted.current
        ) {
            hasAutoStarted.current = true;
            void startAttemptMutation.mutateAsync({ quizId, quizTitle });
        }
    }, [
        isAttemptLoading,
        attempts.length,
        user?.id,
        startAttemptMutation,
        quizId,
        quizTitle,
    ]);

    const completedAttempts = attempts.filter(
        (attempt) => attempt.completedAt !== null,
    );
    const isViewingResults = viewAttemptId !== null;

    if (!quizId || !questions || questions.length === 0 || isAttemptLoading) {
        return <p>Loading...</p>;
    }

    const handleStartOrRetake = async () => {
        setIsCompleted(false);
        setViewAttemptId(null);
        await startAttemptMutation.mutateAsync({ quizId, quizTitle });
    };

    const handleQuestionSubmitted = async (isLastQuestion: boolean) => {
        if (!isLastQuestion || !attemptId) {
            return;
        }

        await submitAttemptMutation.mutateAsync(attemptId);

        setIsCompleted(true);
        setViewAttemptId(attemptId);

        await sendEmailService.sendCompletionEmail(attemptId);
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
            return <QuizSetupScreen />;
        }

        return (
            <QuizRetakeScreen
                questionCount={questions.length}
                completedAttempts={completedAttempts}
                isPending={startAttemptMutation.isPending}
                onRetake={() => void handleStartOrRetake()}
                onViewAttempt={handleViewAttempt}
            />
        );
    }

    return (
        <div className={styles.stack}>
            <QuizTopicsSection topics={topics} />

            {isViewingResults ? (
                <QuizAttemptsViewer
                    questions={questions}
                    completedAttempts={completedAttempts}
                    isCompleted={isCompleted}
                    initialAttemptId={viewAttemptId}
                    onBack={handleBackToCurrentQuiz}
                />
            ) : (
                <QuizActiveView
                    attemptId={attemptId as string}
                    questions={questions}
                    answeredQuestionIds={
                        new Set(
                            activeAttemptAnswers.map(
                                (answer) => answer.questionId,
                            ),
                        )
                    }
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
