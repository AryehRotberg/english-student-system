import { useTranslation } from 'react-i18next';
import styles from '../../pages/Dashboard/DashboardPage.module.css';

type Props = {
    studentName: string;
    taskCount: number;
    onViewSchedule: () => void;
};

export function DashboardHero({
    studentName,
    taskCount,
    onViewSchedule,
}: Props) {
    const { t } = useTranslation();

    return (
        <section className={styles.hero}>
            <div className={styles.heroGlowA} aria-hidden="true" />
            <div className={styles.heroGlowB} aria-hidden="true" />
            <div className={styles.heroInner}>
                <h1 className={styles.heroTitle}>
                    {t('dashboard.welcome', { name: studentName })}
                </h1>
                <p className={styles.heroSubtitle}>
                    {t('dashboard.subtitle', { count: taskCount })}
                </p>
                <button
                    className={styles.heroAction}
                    type="button"
                    onClick={onViewSchedule}
                >
                    {t('dashboard.viewSchedule')}
                </button>
            </div>
        </section>
    );
}
