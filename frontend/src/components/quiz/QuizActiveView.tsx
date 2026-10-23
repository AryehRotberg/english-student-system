import { useTranslation } from 'react-i18next';
import { QuizAttemptHistoryPanel } from '../../components/quiz/QuizAttemptHistoryPanel';
import { QuizCard } from '../../components/quiz/QuizCard';
import type { QuizAttemptApiItem } from '../../types/api-items/quiz-attempt';
import type { QuizQuestion } from '../../types/quiz';
import { QuizCountdown } from './QuizCountdown';

type QuizActiveViewProps = {
    attemptId: string;
    startedAt: string;
    timeLimitMinutes: number | null;
    questions: QuizQuestion[];
    answeredQuestionIds: Set<string>;
    completedAttempts: QuizAttemptApiItem[];
    totalPossible: number;
    onSubmitted: (isLastQuestion: boolean) => void;
    // Submits the attempt with the answers saved so far.
    onTimeUp: () => void;
    onViewAttempt: (attemptId: string) => void;
};

export function QuizActiveView({
    attemptId,
    startedAt,
    timeLimitMinutes,
    questions,
    answeredQuestionIds,
    completedAttempts,
    totalPossible,
    onSubmitted,
    onTimeUp,
    onViewAttempt,
}: QuizActiveViewProps) {
    const { t } = useTranslation();
    const firstUnansweredIndex = questions.findIndex(
        (q) => !answeredQuestionIds.has(q.questionId),
    );
    const currentIndex =
        firstUnansweredIndex === -1
            ? questions.length - 1
            : firstUnansweredIndex;
    const currentQuestion = questions[currentIndex];

    return (
        <>
            {timeLimitMinutes ? (
                <QuizCountdown
                    startedAt={startedAt}
                    timeLimitMinutes={timeLimitMinutes}
                    timeUpLabel={t('quiz.timeUpSubmitting')}
                    onTimeUp={onTimeUp}
                />
            ) : null}
            <QuizCard
                key={currentQuestion.id}
                attemptId={attemptId}
                question={currentQuestion}
                onSubmitted={() =>
                    onSubmitted(currentIndex >= questions.length - 1)
                }
                isLastQuestion={currentIndex >= questions.length - 1}
            />
            <QuizAttemptHistoryPanel
                attempts={completedAttempts}
                totalPossible={totalPossible}
                onViewAttempt={onViewAttempt}
            />
        </>
    );
}
