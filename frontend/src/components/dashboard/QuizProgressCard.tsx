import { useTranslation } from 'react-i18next';
import styles from '../../pages/Dashboard/DashboardPage.module.css';

type Props = {
    quizProgress: number;
};

export function QuizProgressCard({ quizProgress }: Props) {
    const { t } = useTranslation();
    const circleRadius = 58;
    const circleCircumference = 2 * Math.PI * circleRadius;
    const progressOffset =
        circleCircumference - (quizProgress / 100) * circleCircumference;

    return (
        <section className={styles.cardShell}>
            <h3 className={styles.cardTitle}>{t('dashboard.quizProgress')}</h3>

            <div className={styles.progressBlock}>
                <div className={styles.progressRing}>
                    <svg
                        className={styles.progressSvg}
                        viewBox="0 0 128 128"
                        role="img"
                        aria-label={t('dashboard.progressAria')}
                    >
                        <circle
                            className={styles.progressTrack}
                            cx="64"
                            cy="64"
                            r={circleRadius}
                        />
                        <circle
                            className={styles.progressFill}
                            cx="64"
                            cy="64"
                            r={circleRadius}
                            strokeDasharray={circleCircumference}
                            strokeDashoffset={progressOffset}
                        />
                    </svg>
                    <div className={styles.progressValue}>
                        <span className={styles.progressPercent}>
                            {quizProgress}%
                        </span>
                        <span className={styles.progressText}>
                            {t('dashboard.progress')}
                        </span>
                    </div>
                </div>

                <p className={styles.progressNote}>
                    {quizProgress > 0
                        ? t('dashboard.progressGood')
                        : t('dashboard.progressNone')}
                </p>
            </div>
        </section>
    );
}
