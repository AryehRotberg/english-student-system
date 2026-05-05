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
    onBackToCurrentQuiz,
    onViewAttempt,
}: Props) {
    return (
        <section className={styles.completedPanel}>
            <h2>{isCompleted ? 'Quiz completed' : 'Quiz results'}</h2>
            <p>
                {isCompleted
                    ? `You answered all ${questions.length} questions.`
                    : 'Review a previous attempt result.'}
            </p>

            <QuizResultsDisplay
                questions={questions}
                answers={answers}
                title="Quiz Results"
                finalScore={finalScore}
                totalPossible={totalPossible}
                gradePercent={gradePercent}
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
