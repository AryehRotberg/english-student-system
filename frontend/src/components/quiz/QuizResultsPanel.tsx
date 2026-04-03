import type { StudentAnswerApiItem } from "../../services/student-answers.service";
import type { QuizAttemptApiItem } from "../../types/api-items/quiz-attempt";
import type { QuizQuestion } from "../../types/quiz";
import { QuizAttemptHistoryPanel } from "./QuizAttemptHistoryPanel";
import styles from "../../pages/Quiz/QuizPage.module.css";

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
    const pointsByQuestionId = new Map<string, number>();
    for (const answer of answers) {
        const currentId = answer.questionId;
        const currentPoints = pointsByQuestionId.get(currentId) ?? 0;
        pointsByQuestionId.set(
            currentId,
            currentPoints + Number(answer.points ?? 0),
        );
    }

    return (
        <section className={styles.completedPanel}>
            <h2>{isCompleted ? "Quiz completed" : "Quiz results"}</h2>
            <p>
                {isCompleted
                    ? `You answered all ${questions.length} questions.`
                    : "Review a previous attempt result."}
            </p>

            <div className={styles.resultGradeHeader}>
                <div
                    className={styles.gradeBadge}
                    data-pass={gradePercent >= 60}
                >
                    {gradePercent}%
                </div>
                <div>
                    <p className={styles.gradeResultTitle}>Quiz Results</p>
                    <p className={styles.gradeResultSub}>
                        Score: <strong>{finalScore.toFixed(2)}</strong> /{" "}
                        {totalPossible.toFixed(2)} points
                    </p>
                </div>
            </div>

            <div className={styles.questionCards}>
                {questions.map((question) => {
                    const points =
                        pointsByQuestionId.get(question.questionId) ?? 0;
                    const isCorrect = points >= question.maxPoints;

                    return (
                        <div
                            className={`${styles.questionCard} ${isCorrect ? styles.questionCardCorrect : styles.questionCardWrong}`}
                            key={question.id}
                        >
                            <div className={styles.questionCardTop}>
                                <span className={styles.questionCardNum}>
                                    Q{question.questionNumber}
                                </span>
                                <span
                                    className={
                                        isCorrect
                                            ? styles.resultCorrectBadge
                                            : styles.resultWrongBadge
                                    }
                                >
                                    {isCorrect ? "Correct" : "Wrong"}
                                </span>
                            </div>
                            <p className={styles.questionCardPrompt}>
                                {question.prompt}
                            </p>
                        </div>
                    );
                })}
            </div>

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
