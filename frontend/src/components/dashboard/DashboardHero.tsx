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
    return (
        <section className={styles.hero}>
            <div className={styles.heroGlowA} aria-hidden="true" />
            <div className={styles.heroGlowB} aria-hidden="true" />
            <div className={styles.heroInner}>
                <h1 className={styles.heroTitle}>
                    Welcome back, {studentName}
                </h1>
                <p className={styles.heroSubtitle}>
                    Ready to continue your English journey? You&apos;ve got{' '}
                    {taskCount} task{taskCount === 1 ? '' : 's'} to complete
                    today.
                </p>
                <button
                    className={styles.heroAction}
                    type="button"
                    onClick={onViewSchedule}
                >
                    View Schedule
                </button>
            </div>
        </section>
    );
}
