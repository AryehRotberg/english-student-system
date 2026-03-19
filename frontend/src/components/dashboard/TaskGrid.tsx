import type { DailyTask } from "../../types/task";
import type { AssignmentTopic } from "../../types/task";
import styles from "./TaskGrid.module.css";

type TaskGridProps = {
    tasks: DailyTask[];
    assignmentTopics: AssignmentTopic[];
    onOpenQuiz: (quizId: string) => void;
};

export function TaskGrid({
    tasks,
    assignmentTopics,
    onOpenQuiz,
}: TaskGridProps) {
    return (
        <section className={styles.panel}>
            <h2 className={styles.heading}>Today's Tasks</h2>
            <div className={styles.grid}>
                {tasks.map((task) => (
                    <article key={task.id} className={styles.taskCard}>
                        <h3 className={styles.taskTitle}>{task.title}</h3>
                        <p className={styles.taskDescription}>
                            {task.description}
                        </p>
                    </article>
                ))}
            </div>

            <h3 className={styles.topicsHeading}>Assignment Topics</h3>
            <div className={styles.topicGrid}>
                {assignmentTopics.length > 0 ? (
                    assignmentTopics.map((topic) => (
                        <button
                            className={styles.topicCard}
                            key={topic.id}
                            onClick={() => onOpenQuiz(topic.contentId)}
                            type="button"
                        >
                            <span className={styles.topicAssignment}>
                                {topic.assignmentTitle}
                            </span>
                            <span className={styles.topicDescription}>
                                {topic.assignmentDescription}
                            </span>
                            <span className={styles.topicTitle}>
                                {topic.topicTitle}
                            </span>
                        </button>
                    ))
                ) : (
                    <p className={styles.emptyState}>
                        No assignment topics available yet.
                    </p>
                )}
            </div>
        </section>
    );
}
