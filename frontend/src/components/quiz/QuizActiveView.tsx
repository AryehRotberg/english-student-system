import { QuizAttemptHistoryPanel } from '../../components/quiz/QuizAttemptHistoryPanel';
import { QuizCard } from '../../components/quiz/QuizCard';
import type { QuizAttemptApiItem } from '../../types/api-items/quiz-attempt';
import type { QuizQuestion } from '../../types/quiz';

type QuizActiveViewProps = {
    attemptId: string;
    questions: QuizQuestion[];
    answeredQuestionIds: Set<string>;
    completedAttempts: QuizAttemptApiItem[];
    onSubmitted: (isLastQuestion: boolean) => void;
    onViewAttempt: (attemptId: string) => void;
};

export function QuizActiveView({
    attemptId,
    questions,
    answeredQuestionIds,
    completedAttempts,
    onSubmitted,
    onViewAttempt,
}: QuizActiveViewProps) {
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
                onViewAttempt={onViewAttempt}
            />
        </>
    );
}
