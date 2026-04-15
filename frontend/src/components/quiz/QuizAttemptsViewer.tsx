import { useMemo, useState } from "react";
import { useStudentAnswersByAttempt } from "../../hooks/queries";
import type { QuizAttemptApiItem } from "../../types/api-items/quiz-attempt";
import type { QuizQuestion } from "../../types/quiz";
import { QuizResultsPanel } from "./QuizResultsPanel";

type QuizAttemptsViewerProps = {
    questions: QuizQuestion[];
    completedAttempts: QuizAttemptApiItem[];
    isCompleted: boolean;
    initialAttemptId: string;
    onBack: () => void;
};

export function QuizAttemptsViewer({
    questions,
    completedAttempts,
    isCompleted,
    initialAttemptId,
    onBack,
}: QuizAttemptsViewerProps) {
    const [viewAttemptId, setViewAttemptId] = useState(initialAttemptId);

    const selectedAttempt =
        completedAttempts.find((a) => a.id === viewAttemptId) ?? null;

    const { data: answers = [] } = useStudentAnswersByAttempt(viewAttemptId);

    const { totalPossible, finalScore, gradePercent } = useMemo(() => {
        const totalPossible = questions.reduce(
            (sum, question) => sum + question.maxPoints,
            0,
        );
        const earned = questions.reduce((sum, question) => {
            const studentAnswerPoints = answers
                .filter((answer) => answer.questionId === question.questionId)
                .reduce(
                    (total, answer) => total + Number(answer?.points ?? 0),
                    0,
                );
            return sum + studentAnswerPoints;
        }, 0);
        const finalScore = Number(selectedAttempt?.points ?? earned);
        const gradePercent =
            totalPossible > 0
                ? Math.round((finalScore / totalPossible) * 100)
                : 0;
        return { totalPossible, finalScore, gradePercent };
    }, [questions, answers, selectedAttempt]);

    return (
        <QuizResultsPanel
            questions={questions}
            answers={answers}
            isCompleted={isCompleted}
            gradePercent={gradePercent}
            finalScore={finalScore}
            totalPossible={totalPossible}
            completedAttempts={completedAttempts}
            onBackToCurrentQuiz={onBack}
            onViewAttempt={setViewAttemptId}
        />
    );
}
