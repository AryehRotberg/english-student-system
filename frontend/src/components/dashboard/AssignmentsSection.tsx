import type { AssignmentSummary } from '../../types/assignment';
import type { AssignmentTopic } from '../../types/task';
import {
    contentTypeLabel,
    isOpenableTopic,
} from '../../utils/assignmentTopic';
import styles from '../../pages/Dashboard/DashboardPage.module.css';

type Props = {
    assignments: AssignmentSummary[];
    topics: AssignmentTopic[];
    onOpenTopic: (topic: AssignmentTopic) => void;
};

const dueDateFormat: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
};

const chipStyleByContentType: Record<AssignmentTopic['contentType'], string> = {
    quiz: styles.chipQuiz,
    reading: styles.chipReading,
    vocabulary: styles.chipVocabulary,
    writing: styles.chipWriting,
};

/** Leads with the category so students can tell a reading from a quiz of the same name. */
function ChipContent({ topic }: { topic: AssignmentTopic }) {
    const category = contentTypeLabel(topic.contentType);
    const title = topic.topicTitle?.trim();

    if (!title) {
        return <>{category}</>;
    }

    return (
        <>
            <span className={styles.chipCategory}>{category}</span>
            {title}
        </>
    );
}

function parseDueDate(dueDate: string | null) {
    if (!dueDate) {
        return null;
    }

    const parsed = new Date(dueDate);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function startOfToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
}

function groupByAssignment(topics: AssignmentTopic[]) {
    const grouped = new Map<string, AssignmentTopic[]>();

    for (const topic of topics) {
        const existing = grouped.get(topic.assignmentId);
        if (existing) {
            existing.push(topic);
        } else {
            grouped.set(topic.assignmentId, [topic]);
        }
    }

    return grouped;
}

export function AssignmentsSection({
    assignments,
    topics,
    onOpenTopic,
}: Props) {
    const topicsByAssignment = groupByAssignment(topics);

    return (
        <section className={styles.cardShell}>
            <h3 className={styles.cardTitle}>Assignments</h3>

            {assignments.length > 0 ? (
                <ul className={styles.assignmentList}>
                    {assignments.map((assignment) => {
                        const dueDate = parseDueDate(assignment.dueDate);
                        const isOverdue =
                            dueDate !== null && dueDate < startOfToday();
                        const items =
                            topicsByAssignment.get(assignment.id) ?? [];

                        return (
                            <li
                                key={assignment.id}
                                className={styles.assignmentRow}
                            >
                                <div className={styles.assignmentRowMain}>
                                    <h4 className={styles.assignmentRowTitle}>
                                        {assignment.title}
                                    </h4>
                                    <p className={styles.assignmentRowDesc}>
                                        {assignment.description}
                                    </p>
                                </div>

                                {items.length > 0 && (
                                    <ul className={styles.assignmentChipRow}>
                                        {items.map((topic) => {
                                            const chipClass = `${styles.assignmentChip} ${chipStyleByContentType[topic.contentType]}`;

                                            return (
                                                <li key={topic.id}>
                                                    {isOpenableTopic(topic) ? (
                                                        <button
                                                            type="button"
                                                            className={
                                                                chipClass
                                                            }
                                                            onClick={() =>
                                                                onOpenTopic(
                                                                    topic,
                                                                )
                                                            }
                                                        >
                                                            <ChipContent
                                                                topic={topic}
                                                            />
                                                        </button>
                                                    ) : (
                                                        <span
                                                            className={
                                                                chipClass
                                                            }
                                                            data-static="true"
                                                            title="This item has no content attached yet."
                                                        >
                                                            <ChipContent
                                                                topic={topic}
                                                            />
                                                        </span>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}

                                <span
                                    className={styles.assignmentDue}
                                    data-overdue={isOverdue}
                                >
                                    {dueDate
                                        ? `${isOverdue ? 'Overdue' : 'Due'} ${dueDate.toLocaleDateString(undefined, dueDateFormat)}`
                                        : 'No due date'}
                                </span>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <p className={styles.emptyState}>
                    No assignments yet. New work will show up here.
                </p>
            )}
        </section>
    );
}
