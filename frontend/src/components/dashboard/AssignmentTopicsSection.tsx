import type { AssignmentTopic } from '../../types/task';
import styles from '../../pages/Dashboard/DashboardPage.module.css';

type Props = {
    topics: AssignmentTopic[];
    onOpenTopic: (topic: AssignmentTopic) => void;
};

const topicStyles = [
    styles.topicBlue,
    styles.topicGreen,
    styles.topicAmber,
    styles.topicPurple,
    styles.topicRose,
    styles.topicSlate,
];

export function AssignmentTopicsSection({ topics, onOpenTopic }: Props) {
    const uniqueTopics = Array.from(
        new Map(topics.map((topic) => [topic.topicTitle, topic])).values(),
    );

    return (
        <section>
            <h2 className={`${styles.sectionTitle} ${styles.topicsTitle}`}>
                Assignment Topics
            </h2>

            {uniqueTopics.length > 0 ? (
                <div className={styles.topicRow}>
                    {uniqueTopics.map((topic, index) => (
                        <button
                            key={topic.id}
                            type="button"
                            className={`${styles.topicChip} ${topicStyles[index % topicStyles.length]}`}
                            onClick={() => onOpenTopic(topic)}
                        >
                            {topic.topicTitle}
                        </button>
                    ))}
                </div>
            ) : (
                <p className={styles.emptyState}>
                    No assignment topics available yet.
                </p>
            )}
        </section>
    );
}
