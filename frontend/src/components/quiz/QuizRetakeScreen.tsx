import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { QuizAttemptHistoryPanel } from '../../components/quiz/QuizAttemptHistoryPanel';
import styles from '../../pages/Quiz/QuizPage.module.css';
import type { QuizAttemptApiItem } from '../../types/api-items/quiz-attempt';

type QuizRetakeScreenProps = {
    questionCount: number;
    completedAttempts: QuizAttemptApiItem[];
    isPending: boolean;
    onRetake: () => void;
    onViewAttempt: (attemptId: string) => void;
    details?: ReactNode;
};

export function QuizRetakeScreen({
    questionCount,
    completedAttempts,
    isPending,
    onRetake,
    onViewAttempt,
    details,
}: QuizRetakeScreenProps) {
    const { t } = useTranslation();

    return (
        <div className={styles.stack}>
            <section className={styles.panel}>
                <h2>{t('quiz.readyToRetry')}</h2>
                <p>{t('quiz.questionCount', { count: questionCount })}</p>
                {details}
                <button
                    className={styles.nextButton}
                    onClick={onRetake}
                    disabled={isPending}
                    type="button"
                >
                    {isPending ? t('quiz.starting') : t('quiz.retake')}
                </button>
            </section>
            <QuizAttemptHistoryPanel
                attempts={completedAttempts}
                onViewAttempt={onViewAttempt}
            />
        </div>
    );
}
