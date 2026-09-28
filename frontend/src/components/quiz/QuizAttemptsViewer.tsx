import { useMemo } from 'react';
import {
    useAnswerFiles,
    useStudentAnswersByAttempt,
} from '../../hooks/queries';
import type { QuizAttemptApiItem } from '../../types/api-items/quiz-attempt';
import type { QuizQuestion, QuizSummary } from '../../types/quiz';
import { isHandwritten, possiblePoints } from '../../utils/exam';
import { QuizResultsPanel } from './QuizResultsPanel';

type QuizAttemptsViewerProps = {
    questions: QuizQuestion[];
    quiz: QuizSummary | undefined;
    completedAttempts: QuizAttemptApiItem[];
    isCompleted: boolean;
    viewAttemptId: string;
    onViewAttempt: (attemptId: string) => void;
    onBack: () => void;
};

export function QuizAttemptsViewer({
    questions,
    quiz,
    completedAttempts,
    isCompleted,
    viewAttemptId,
    onViewAttempt,
    onBack,
}: QuizAttemptsViewerProps) {
    const selectedAttempt =
        completedAttempts.find((a) => a.id === viewAttemptId) ?? null;

    const { data: answers = [] } = useStudentAnswersByAttempt(viewAttemptId);
    const hasHandwritten = questions.some(isHandwritten);
    const { data: files = [] } = useAnswerFiles(
        hasHandwritten ? viewAttemptId : undefined,
    );

    const { totalPossible, finalScore, gradePercent } = useMemo(() => {
        const totalPossible = possiblePoints(
            questions.map((question) => question.maxPoints),
            quiz?.questionsToAnswer,
        );
        const earned = answers
            .filter((answer) => answer.isCounted !== false)
            .reduce((total, answer) => total + Number(answer.points ?? 0), 0);
        const finalScore = Number(selectedAttempt?.points ?? earned);
        const gradePercent =
            totalPossible > 0
                ? Math.round((finalScore / totalPossible) * 100)
                : 0;
        return { totalPossible, finalScore, gradePercent };
    }, [questions, answers, selectedAttempt, quiz?.questionsToAnswer]);

    return (
        <QuizResultsPanel
            questions={questions}
            answers={answers}
            files={files}
            isCompleted={isCompleted}
            gradePercent={gradePercent}
            finalScore={finalScore}
            totalPossible={totalPossible}
            completedAttempts={completedAttempts}
            isPendingReview={selectedAttempt?.status === 'pendingReview'}
            onBackToCurrentQuiz={onBack}
            onViewAttempt={onViewAttempt}
        />
    );
}
