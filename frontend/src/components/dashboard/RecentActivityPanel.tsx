import type { RecentActivity } from "../../types/activity";
import styles from "./RecentActivityPanel.module.css";

type RecentActivityPanelProps = {
    activities: RecentActivity[];
};

export function RecentActivityPanel({ activities }: RecentActivityPanelProps) {
    return (
        <section className={styles.panel}>
            <h2 className={styles.heading}>Recent Activity</h2>
            <ul className={styles.list}>
                {activities.map((activity) => (
                    <li key={activity.id} className={styles.item}>
                        <span aria-hidden="true">✔</span>
                        {activity.title}
                    </li>
                ))}
            </ul>
        </section>
    );
}
