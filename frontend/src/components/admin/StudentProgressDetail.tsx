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

        const pointsByQuestionId = new Map<string, number>();
        for (const answer of answers) {
            const current = pointsByQuestionId.get(answer.questionId) ?? 0;
            pointsByQuestionId.set(
                answer.questionId,
                current + Number(answer.points ?? 0),
            );
        }

        return (
            <div className={styles.section}>
                <button
                    type="button"
                    className={styles.backNavBtn}
                    onClick={() => setSelectedAttemptId(null)}
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Back to attempts
                </button>

                <div className={styles.attemptResultHeader}>
                    <div
                        className={styles.attemptGradeBadge}
                        data-pass={gradePercent >= 60}
                    >
                        {gradePercent}%
                    </div>
                    <div>
                        <p className={styles.attemptResultTitle}>
                            Quiz Results
                        </p>
                        <p className={styles.attemptResultSub}>
                            Score: <strong>{finalScore.toFixed(2)}</strong> /{" "}
                            {totalPossible.toFixed(2)} points
                        </p>
                    </div>
                </div>

                <div className={styles.questionResultGrid}>
                    {questions.map((question) => {
                        const points =
                            pointsByQuestionId.get(question.questionId) ?? 0;
                        const isCorrect = points >= question.maxPoints;

                        return (
                            <div
                                className={`${styles.questionResultCard} ${isCorrect ? styles.questionResultCorrect : styles.questionResultWrong}`}
                                key={question.id}
                            >
                                <div className={styles.questionResultTop}>
                                    <span className={styles.questionResultNum}>
                                        Q{question.questionNumber}
                                    </span>
                                    <span
                                        className={
                                            isCorrect
                                                ? styles.correctBadge
                                                : styles.wrongBadge
                                        }
                                    >
                                        {isCorrect ? "Correct" : "Wrong"}
                                    </span>
                                </div>
                                <p className={styles.questionResultPrompt}>
                                    {question.prompt}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className={styles.section}>
            <button
                type="button"
                onClick={onBack}
                className={styles.backNavBtn}
            >
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polyline points="15 18 9 12 15 6" />
                </svg>
                Back to students
            </button>
            <div className={styles.studentDetailHeader}>
                <div className={styles.studentAvatar}>
                    {student.name
                        ?.trim()
                        .split(/\s+/)
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((p) => p[0]?.toUpperCase() ?? "")
                        .join("")}
                </div>
                <div>
                    <h3 className={styles.studentDetailName}>{student.name}</h3>
                    <p className={styles.meta}>{student.email}</p>
                </div>
            </div>

            {attempts.length === 0 ? (
                <p className={styles.empty} style={{ marginTop: "1.5rem" }}>
                    No completed attempts yet.
                </p>
            ) : (
                <div className={styles.attemptGrid}>
                    {attempts.map((attempt) => {
                        const completedAt = attempt.completedAt
                            ? new Date(attempt.completedAt)
                            : null;
                        const score = Number(attempt.points ?? 0);

                        return (
                            <div
                                key={attempt.id}
                                className={styles.attemptCard}
                            >
                                <div className={styles.attemptCardIcon}>
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <rect
                                            x="9"
                                            y="2"
                                            width="6"
                                            height="4"
                                            rx="1"
                                        />
                                        <path d="M9 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-2" />
                                        <line x1="9" y1="12" x2="15" y2="12" />
                                        <line x1="9" y1="16" x2="13" y2="16" />
                                    </svg>
                                </div>
                                <div className={styles.attemptCardBody}>
                                    <p className={styles.attemptCardDate}>
                                        {completedAt
                                            ? completedAt.toLocaleString()
                                            : "Completed attempt"}
                                    </p>
                                    <p className={styles.attemptCardScore}>
                                        Score:{" "}
                                        <strong>{score.toFixed(2)}</strong>
                                    </p>
                                </div>
                                <button
                                    className={styles.studentCardBtn}
                                    onClick={() =>
                                        setSelectedAttemptId(attempt.id)
                                    }
                                    type="button"
                                >
                                    View results
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
