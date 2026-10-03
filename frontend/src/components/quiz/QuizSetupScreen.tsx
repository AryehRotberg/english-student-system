import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../../pages/Quiz/QuizPage.module.css';

type QuizSetupScreenProps = {
    onStart: () => void;
    isPending: boolean;
    // Exam rules (answer N of M, time limit) shown before starting.
    details?: ReactNode;
};

export function QuizSetupScreen({
    onStart,
    isPending,
    details,
}: QuizSetupScreenProps) {
    const { t } = useTranslation();

    return (
        <div className={styles.stack}>
            <section className={styles.panel}>
                <h2>{t('quiz.readyToStart')}</h2>
                {details}
                <button
                    className={styles.nextButton}
                    onClick={onStart}
                    disabled={isPending}
                    type="button"
                >
                    {isPending ? t('quiz.starting') : t('quiz.start')}
                </button>
            </section>
        </div>
    );
}
