import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAssignmentItems, useAssignments } from '../../hooks/queries';
import type { AssignmentItemApiItem } from '../../types/api-items/assignment-item';
import type { AssignmentApiItem } from '../../types/api-items/assignment';
import {
    assignmentContentRoute,
    contentTypeLabel,
    hasOpenableContent,
} from '../../utils/assignmentTopic';
import styles from './AssignmentsPage.module.css';

type StatusFilter = 'all' | 'active' | 'completed';

const filters: { id: StatusFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' },
];

const dueDateFormat: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
};

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

/**
 * `isCompleted` on the assignment is a flag only a teacher sets. Students
 * complete an assignment by finishing its items, which never flips that flag,
 * so treat "every item done" as complete too.
 */
function isAssignmentComplete(
    assignment: AssignmentApiItem,
    items: AssignmentItemApiItem[],
): boolean {
    if (assignment.isCompleted) {
        return true;
    }

    return items.length > 0 && items.every((item) => item.isCompleted);
}

function groupByAssignment(items: AssignmentItemApiItem[]) {
    const grouped = new Map<string, AssignmentItemApiItem[]>();

    for (const item of items) {
        const existing = grouped.get(item.assignmentId);
        if (existing) {
            existing.push(item);
        } else {
            grouped.set(item.assignmentId, [item]);
        }
    }

    return grouped;
}

function AssignmentCard({
    assignment,
    items,
    onOpenItem,
}: {
    assignment: AssignmentApiItem;
    items: AssignmentItemApiItem[];
    onOpenItem: (item: AssignmentItemApiItem) => void;
}) {
    const dueDate = parseDueDate(assignment.dueDate);
    const isComplete = isAssignmentComplete(assignment, items);
    const isOverdue =
        !isComplete && dueDate !== null && dueDate < startOfToday();

    const completedCount = items.filter((item) => item.isCompleted).length;
    const percent =
        items.length > 0
            ? Math.round((completedCount / items.length) * 100)
            : 0;

    return (
        <article className={styles.card}>
            <header className={styles.cardHead}>
                <div className={styles.cardHeadMain}>
                    <h2 className={styles.cardTitle}>{assignment.title}</h2>
                    <p className={styles.cardDesc}>{assignment.description}</p>
                </div>

                <span
                    className={styles.status}
                    data-tone={
                        isComplete ? 'done' : isOverdue ? 'overdue' : 'active'
                    }
                >
                    {isComplete
                        ? 'Completed'
                        : isOverdue
                          ? 'Overdue'
                          : 'In progress'}
                </span>
            </header>

            <dl className={styles.metaRow}>
                <div className={styles.meta}>
                    <dt>Due</dt>
                    <dd>
                        {dueDate
                            ? dueDate.toLocaleDateString(
                                  undefined,
                                  dueDateFormat,
                              )
                            : 'No due date'}
                    </dd>
                </div>
                <div className={styles.meta}>
                    <dt>Items</dt>
                    <dd>
                        {completedCount} of {items.length} done
                    </dd>
                </div>
            </dl>

            {items.length > 0 && (
                <>
                    <div
                        className={styles.progressTrack}
                        role="progressbar"
                        aria-valuenow={percent}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${assignment.title} progress`}
                    >
                        <div
                            className={styles.progressFill}
                            style={{ width: `${percent}%` }}
                        />
                    </div>

                    <ul className={styles.itemList}>
                        {items.map((item) => {
                            const openable = hasOpenableContent(item.contentId);
                            const label =
                                item.title?.trim() ||
                                contentTypeLabel(item.contentType);

                            return (
                                <li key={item.id} className={styles.item}>
                                    <span
                                        className={styles.itemCheck}
                                        data-done={item.isCompleted}
                                        aria-hidden="true"
                                    >
                                        {item.isCompleted ? '✓' : ''}
                                    </span>

                                    <span
                                        className={styles.itemType}
                                        data-type={item.contentType}
                                    >
                                        {contentTypeLabel(item.contentType)}
                                    </span>

                                    {openable ? (
                                        <button
                                            type="button"
                                            className={styles.itemTitle}
                                            onClick={() => onOpenItem(item)}
                                        >
                                            {label}
                                        </button>
                                    ) : (
                                        <span
                                            className={styles.itemTitleStatic}
                                            title="This item has no content attached yet."
                                        >
                                            {label}
                                        </span>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </>
            )}
        </article>
    );
}

export function AssignmentsPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [filter, setFilter] = useState<StatusFilter>('active');

    const { data: assignments = [], isLoading } = useAssignments(user?.id);
    const { data: items = [] } = useAssignmentItems(user?.id);

    const itemsByAssignment = useMemo(() => groupByAssignment(items), [items]);

    const visible = useMemo(
        () =>
            assignments.filter((assignment) => {
                if (filter === 'all') {
                    return true;
                }

                const complete = isAssignmentComplete(
                    assignment,
                    itemsByAssignment.get(assignment.id) ?? [],
                );

                return filter === 'completed' ? complete : !complete;
            }),
        [assignments, filter, itemsByAssignment],
    );

    return (
        <div className={styles.page}>
            <header className={styles.pageHead}>
                <div>
                    <h1 className={styles.heading}>Assignments</h1>
                    <p className={styles.subtitle}>
                        Everything your teacher has assigned, with what&apos;s
                        left to finish.
                    </p>
                </div>

                <div
                    className={styles.filters}
                    role="group"
                    aria-label="Filter assignments"
                >
                    {filters.map((option) => (
                        <button
                            key={option.id}
                            type="button"
                            className={styles.filterChip}
                            data-active={filter === option.id}
                            aria-pressed={filter === option.id}
                            onClick={() => setFilter(option.id)}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </header>

            {isLoading ? (
                <p className={styles.empty}>Loading assignments…</p>
            ) : visible.length > 0 ? (
                <div className={styles.list}>
                    {visible.map((assignment) => (
                        <AssignmentCard
                            key={assignment.id}
                            assignment={assignment}
                            items={itemsByAssignment.get(assignment.id) ?? []}
                            onOpenItem={(item) =>
                                navigate(
                                    assignmentContentRoute(
                                        item.contentType,
                                        item.contentId,
                                    ),
                                )
                            }
                        />
                    ))}
                </div>
            ) : (
                <p className={styles.empty}>
                    {assignments.length === 0
                        ? 'No assignments yet. New work will show up here.'
                        : `No ${filter} assignments.`}
                </p>
            )}
        </div>
    );
}
