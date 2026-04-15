import type { DailyTask } from '../../types/task';
import styles from '../../pages/Dashboard/DashboardPage.module.css';

type Props = {
    featuredTask: DailyTask | null;
    hasAssignments: boolean;
    onViewAll: () => void;
    onOpenAssignment: () => void;
};

export function TodayTasksSection({
    featuredTask,
    hasAssignments,
    onViewAll,
    onOpenAssignment,
}: Props) {
    return (
        <section>
            <div className={styles.sectionBar}>
                <h2 className={styles.sectionTitle}>Today&apos;s Tasks</h2>
                <button
                    className={styles.viewAll}
                    type="button"
                    onClick={onViewAll}
                >
                    View All
                </button>
            </div>

            {featuredTask ? (
                <article className={styles.taskCard}>
                    <div className={styles.taskMain}>
                        <h3 className={styles.taskTitle}>
                            {featuredTask.title}
                        </h3>

                        <button
                            className={styles.startButton}
                            type="button"
                            onClick={onOpenAssignment}
                            disabled={!hasAssignments}
                        >
                            Open Assignment
                        </button>
                    </div>

                    <div className={styles.taskVisual} aria-hidden="true" />
                </article>
            ) : (
                <div className={styles.cardShell}>
                    <p className={styles.emptyState}>
                        No tasks are currently assigned.
                    </p>
                </div>
            )}
        </section>
    );
}
