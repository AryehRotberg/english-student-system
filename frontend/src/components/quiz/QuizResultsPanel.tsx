import styles from '../../pages/Quiz/QuizPage.module.css';
import type { StudentAnswerApiItem } from '../../services/student-answers.service';
import type { QuizAttemptApiItem } from '../../types/api-items/quiz-attempt';
import type { QuizQuestion } from '../../types/quiz';
import { QuizAttemptHistoryPanel } from './QuizAttemptHistoryPanel';
import { QuizResultsDisplay } from './QuizResultsDisplay';

type Props = {
    questions: QuizQuestion[];
    answers: StudentAnswerApiItem[];
    isCompleted: boolean;
    gradePercent: number;
    finalScore: number;
    totalPossible: number;
    completedAttempts: QuizAttemptApiItem[];
    isPendingReview: boolean;
    onBackToCurrentQuiz: () => void;
    onViewAttempt: (attemptId: string) => void;
};

export function QuizResultsPanel({
    questions,
    answers,
    isCompleted,
    gradePercent,
    finalScore,
    totalPossible,
    completedAttempts,
    isPendingReview,
    onBackToCurrentQuiz,
    onViewAttempt,
}: Props) {
    const completedMessage = isPendingReview
        ? `You answered all ${questions.length} questions. Your teacher will grade this quiz.`
        : `You answered all ${questions.length} questions.`;

    return (
        <section className={styles.completedPanel}>
            <h2>{isCompleted ? 'Quiz completed' : 'Quiz results'}</h2>
            <p>
                {isCompleted
                    ? completedMessage
                    : 'Review a previous attempt result.'}
            </p>

            <QuizResultsDisplay
                questions={questions}
                answers={answers}
                title="Quiz Results"
                finalScore={finalScore}
                totalPossible={totalPossible}
                gradePercent={gradePercent}
                isPendingReview={isPendingReview}
            />

            <button
                className={styles.resumeButton}
                onClick={onBackToCurrentQuiz}
                type="button"
            >
                Back to current quiz
            </button>

            <QuizAttemptHistoryPanel
                attempts={completedAttempts}
                onViewAttempt={onViewAttempt}
            />
        </section>
    );
}
