import { useState } from 'react';
import { usePendingReviewAttempts } from '../../hooks/queries';
import styles from '../../pages/Admin/AdminPage.module.css';
import { AttemptGradingPanel } from './AttemptGradingPanel';

export function GradingSection() {
    const { data: attempts = [], isLoading } = usePendingReviewAttempts();
    const [attemptId, setAttemptId] = useState<string | null>(null);

    if (attemptId) {
        return (
            <AttemptGradingPanel
                attemptId={attemptId}
                backLabel="Back to grading queue"
                onBack={() => setAttemptId(null)}
            />
        );
    }

    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h3>Awaiting grading</h3>
            </div>

            {isLoading ? (
                <p>Loading attempts…</p>
            ) : attempts.length === 0 ? (
                <p className={styles.empty}>
                    No quiz attempts are waiting for grading.
                </p>
            ) : (
                <div className={styles.attemptGrid}>
                    {attempts.map((attempt) => (
                        <div
                            key={attempt.attemptId}
                            className={styles.attemptCard}
                        >
                            <div className={styles.attemptCardBody}>
                                <p className={styles.attemptCardDate}>
                                    {attempt.quizTitle ?? 'Quiz'}
                                </p>
                                <span
                                    className={`${styles.attemptStatusBadge} ${styles.attemptStatusInProgress}`}
                                >
                                    Awaiting grading
                                </span>
                                <p className={styles.attemptCardScore}>
                                    {attempt.studentName ?? 'Student'}
                                    {attempt.completedAt
                                        ? ` · submitted ${new Date(attempt.completedAt).toLocaleString()}`
                                        : ''}
                                </p>
                            </div>
                            <button
                                type="button"
                                className={styles.studentCardBtn}
                                onClick={() => setAttemptId(attempt.attemptId)}
                            >
                                Grade
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
