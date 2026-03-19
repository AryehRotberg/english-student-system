import type { RecentActivity } from "../../types/activity";
import styles from "../../pages/Dashboard/DashboardPage.module.css";

type Props = {
    activities: RecentActivity[];
    onViewFullHistory: () => void;
};

const activityIconMap = ["assignment", "verified", "star", "menu_book"];

export function RecentActivityCard({ activities, onViewFullHistory }: Props) {
    return (
        <section className={styles.cardShell}>
            <h3 className={styles.cardTitle}>Recent Activity</h3>

            {activities.length > 0 ? (
                <ul className={styles.activityList}>
                    {activities.slice(0, 4).map((activity, index) => (
                        <li key={activity.id} className={styles.activityItem}>
                            <span
                                className={`${styles.activityBadge} ${styles[`activityTone${index % 4}`]}`}
                                aria-hidden="true"
                            >
                                {
                                    activityIconMap[
                                        index % activityIconMap.length
                                    ]
                                }
                            </span>

                            <div className={styles.activityText}>
                                <p className={styles.activityTitle}>
                                    {activity.title}
                                </p>
                                <p className={styles.activityTime}>
                                    From your latest assignments
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className={styles.emptyState}>No recent activity yet.</p>
            )}

            <button
                className={styles.historyButton}
                type="button"
                onClick={onViewFullHistory}
            >
                View Full History
            </button>
        </section>
    );
}
