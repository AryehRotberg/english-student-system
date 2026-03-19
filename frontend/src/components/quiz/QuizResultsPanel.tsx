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
    const pointsByQuestionId = new Map(
        answers.map((answer) => [
            answer.questionId,
            Number(answer.points ?? 0),
        ]),
    );

    return (
        <section className={styles.completedPanel}>
            <h2>{isCompleted ? "Quiz completed" : "Quiz results"}</h2>
            <p>
                {isCompleted
                    ? `You answered all ${questions.length} questions.`
                    : "Review a previous attempt result."}
            </p>

            <div className={styles.scoreSummary}>
                <p className={styles.gradeLabel}>Grade: {gradePercent}%</p>
                <p>
                    Score: {finalScore.toFixed(2)} / {totalPossible.toFixed(2)}
                </p>
            </div>

            <ul className={styles.resultList}>
                {questions.map((question) => {
                    const points =
                        pointsByQuestionId.get(question.questionId) ?? 0;
                    const isCorrect = points >= question.maxPoints;

                    return (
                        <li className={styles.resultRow} key={question.id}>
                            <div>
                                <span className={styles.resultQuestion}>
                                    Question {question.questionNumber}
                                </span>
                                <p className={styles.resultPrompt}>
                                    {question.prompt}
                                </p>
                            </div>
                            <span
                                className={
                                    isCorrect ? styles.correct : styles.wrong
                                }
                            >
                                {isCorrect ? "Correct" : "Wrong"}
                            </span>
                        </li>
                    );
                })}
            </ul>

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
