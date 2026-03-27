import { useState } from "react";
import {
    useQuizQuestions,
    useStudentAnswersByAttempt,
    useStudentQuizAttempts,
} from "../../hooks/queries";
import styles from "../../pages/Admin/AdminPage.module.css";
import type { AuthUser } from "../../types/auth";

type Props = {
    student: AuthUser;
    onBack: () => void;
};

export function StudentProgressDetail({ student, onBack }: Props) {
    const { data: attempts = [], isLoading: attemptsLoading } =
        useStudentQuizAttempts(student.id);
    const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(
        null,
    );

    const selectedAttempt = attempts.find((a) => a.id === selectedAttemptId);
    const selectedAttemptQuizId = (selectedAttempt as any)?.quizId;

    const { data: questions = [] } = useQuizQuestions(selectedAttemptQuizId);
    const { data: answers = [] } = useStudentAnswersByAttempt(
        selectedAttemptId || undefined,
    );

    if (attemptsLoading) {
        return (
            <div className={styles.section}>
                <p>Loading student progress...</p>
            </div>
        );
    }

    if (selectedAttempt && selectedAttemptQuizId && questions.length > 0) {
        const totalPossible = questions.reduce(
            (sum, q) => sum + Number(q.maxPoints),
            0,
        );
        const finalScore = Number(selectedAttempt.points ?? 0);
        const gradePercent =
            totalPossible > 0
                ? Math.round((finalScore / totalPossible) * 100)
                : 0;

        const pointsByQuestionId = new Map(
            answers.map((answer) => [
                answer.questionId,
                Number(answer.points ?? 0),
            ]),
        );

        return (
            <div className={styles.section}>
                <button
                    type="button"
                    className={styles.backButton}
                    onClick={() => setSelectedAttemptId(null)}
                >
                    ← Back
                </button>
                <div style={{ marginBottom: "1.5rem" }}>
                    <h3 style={{ marginBottom: "0.5rem" }}>Quiz Results</h3>
                    <p style={{ color: "#6b7280", fontSize: "0.95rem" }}>
                        Grade: <strong>{gradePercent}%</strong> | Score:{" "}
                        <strong>
                            {finalScore.toFixed(2)} / {totalPossible.toFixed(2)}
                        </strong>
                    </p>
                </div>
                <ul className={styles.itemList}>
                    {questions.map((question) => {
                        const points =
                            pointsByQuestionId.get(question.questionId) ?? 0;
                        const isCorrect = points >= question.maxPoints;

                        return (
                            <li className={styles.item} key={question.id}>
                                <div>
                                    <span
                                        style={{
                                            fontWeight: "500",
                                            fontSize: "0.9rem",
                                        }}
                                    >
                                        Question {question.questionNumber}
                                    </span>
                                    <p className={styles.meta}>
                                        {question.prompt}
                                    </p>
                                </div>
                                <span
                                    style={{
                                        fontWeight: "700",
                                        color: isCorrect
                                            ? "#166534"
                                            : "#991b1b",
                                    }}
                                >
                                    {isCorrect ? "Correct" : "Wrong"}
                                </span>
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    }

    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <button
                    type="button"
                    onClick={onBack}
                    className={styles.backButton}
                >
                    ← Back to students
                </button>
                <h3>{student.name}</h3>
            </div>

            <p className={styles.meta}>{student.email}</p>

            <h4 style={{ marginTop: "1.5rem", marginBottom: "0.5rem" }}>
                Quiz Attempts
            </h4>

            <ul className={styles.itemList}>
                {attempts.map((attempt) => {
                    const completedAt = attempt.completedAt
                        ? new Date(attempt.completedAt)
                        : null;

                    return (
                        <li key={attempt.id} className={styles.item}>
                            <div>
                                <strong>
                                    {completedAt
                                        ? completedAt.toLocaleString()
                                        : "Completed attempt"}
                                </strong>
                                <p>
                                    Score:{" "}
                                    {Number(attempt.points ?? 0).toFixed(2)}
                                </p>
                            </div>
                            <button
                                className={styles.viewButton}
                                onClick={() => setSelectedAttemptId(attempt.id)}
                                type="button"
                            >
                                View results
                            </button>
                        </li>
                    );
                })}
                {attempts.length === 0 && (
                    <li className={styles.empty}>No completed attempts yet.</li>
                )}
            </ul>
        </div>
    );
}
