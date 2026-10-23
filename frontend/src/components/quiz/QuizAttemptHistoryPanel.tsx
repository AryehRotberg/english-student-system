import { useTranslation } from 'react-i18next';
import type { QuizAttemptApiItem } from '../../types/api-items/quiz-attempt';
import styles from '../../pages/Quiz/QuizPage.module.css';
import { scorePercent } from '../../utils/exam';

type Props = {
    attempts: QuizAttemptApiItem[];
    totalPossible: number;
    onViewAttempt: (attemptId: string) => void;
};

export function QuizAttemptHistoryPanel({
    attempts,
    totalPossible,
    onViewAttempt,
}: Props) {
    const { t, i18n } = useTranslation();

    if (attempts.length === 0) {
        return null;
    }

    return (
        <section className={styles.historyPanel}>
            <h3>{t('quiz.previousAttempts')}</h3>
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
                                        ? completedAt.toLocaleString(
                                              i18n.language,
                                          )
                                        : t('quiz.completedAttempt')}
                                </strong>
                                <p>
                                    {attempt.status === 'pendingReview'
                                        ? t('quiz.awaitingGrading')
                                        : t('quiz.score', {
                                              score: scorePercent(
                                                  Number(attempt.points ?? 0),
                                                  totalPossible,
                                              ),
                                          })}
                                </p>
                            </div>
                            <button
                                className={styles.viewButton}
                                onClick={() => onViewAttempt(attempt.id)}
                                type="button"
                            >
                                {t('quiz.viewResults')}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
