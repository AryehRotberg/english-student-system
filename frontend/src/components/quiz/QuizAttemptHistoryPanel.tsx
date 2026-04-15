import type { QuizAttemptApiItem } from '../../types/api-items/quiz-attempt';
import styles from '../../pages/Quiz/QuizPage.module.css';

type Props = {
    attempts: QuizAttemptApiItem[];
    onViewAttempt: (attemptId: string) => void;
};

export function QuizAttemptHistoryPanel({ attempts, onViewAttempt }: Props) {
    if (attempts.length === 0) {
        return null;
    }

    return (
        <section className={styles.historyPanel}>
            <h3>Previous attempts</h3>
            <ul className={styles.historyList}>
                {attempts.map((attempt) => {
                    const completedAt = attempt.completedAt
                        ? new Date(attempt.completedAt)
                        : null;

                    return (
                        <li className={styles.historyRow} key={attempt.id}>
                            <div>
                                <strong>
                                    {completedAt
                                        ? completedAt.toLocaleString()
                                        : 'Completed attempt'}
                                </strong>
                                <p>
                                    Score:{' '}
                                    {Number(attempt.points ?? 0).toFixed(2)}
                                </p>
                            </div>
                            <button
                                className={styles.viewButton}
                                onClick={() => onViewAttempt(attempt.id)}
                                type="button"
                            >
                                View results
                            </button>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
