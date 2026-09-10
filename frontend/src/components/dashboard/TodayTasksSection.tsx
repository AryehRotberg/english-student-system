import type { DailyTask } from '../../types/task';
import styles from '../../pages/Dashboard/DashboardPage.module.css';

type Props = {
    featuredTask: DailyTask | null;
    hasAssignments: boolean;
    onViewAll: () => void;
    onOpenAssignment: () => void;
};

/**
 * Decorative open book with floating letters. Drawn inline so it inherits the
 * design tokens and needs no image request; the wrapper carries aria-hidden.
 */
function ReadingIllustration() {
    return (
        <svg
            className={styles.taskVisualArt}
            viewBox="0 0 240 160"
            fill="none"
            focusable="false"
        >
            {/* pages */}
            <path
                d="M120 66C102 54 74 50 42 56v66c32-6 60-2 78 10z"
                fill="var(--surface-0)"
                stroke="var(--brand-400)"
                strokeWidth="3"
                strokeLinejoin="round"
            />
            <path
                d="M120 66c18-12 46-16 78-10v66c-32-6-60-2-78 10z"
                fill="var(--surface-0)"
                stroke="var(--brand-400)"
                strokeWidth="3"
                strokeLinejoin="round"
            />
            {/* spine */}
            <path
                d="M120 66v66"
                stroke="var(--brand-600)"
                strokeWidth="3"
                strokeLinecap="round"
            />
            {/* text lines */}
            <g
                stroke="var(--brand-200)"
                strokeWidth="4"
                strokeLinecap="round"
                opacity="0.9"
            >
                <path d="M56 74c16-2 32 0 46 5" />
                <path d="M56 90c16-2 32 0 46 5" />
                <path d="M56 106c11-1 22-0.5 32 2" />
                <path d="M138 79c14-5 30-7 46-5" />
                <path d="M138 95c14-5 30-7 46-5" />
                <path d="M138 111c10-3 21-4 32-3" />
            </g>
            {/* floating letters */}
            <g
                fill="var(--brand-700)"
                fontFamily="var(--font-display)"
                fontWeight="700"
            >
                <text x="62" y="38" fontSize="30" transform="rotate(-12 62 38)">
                    A
                </text>
                <text
                    x="150"
                    y="32"
                    fontSize="23"
                    opacity="0.85"
                    transform="rotate(11 150 32)"
                >
                    b
                </text>
                <text
                    x="192"
                    y="48"
                    fontSize="17"
                    opacity="0.65"
                    transform="rotate(-8 192 48)"
                >
                    c
                </text>
            </g>
            {/* sparkle */}
            <path
                d="M104 26c1.6 5.4 3.6 7.4 9 9-5.4 1.6-7.4 3.6-9 9-1.6-5.4-3.6-7.4-9-9 5.4-1.6 7.4-3.6 9-9z"
                fill="var(--sun-500)"
            />
        </svg>
    );
}

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

                    <div className={styles.taskVisual} aria-hidden="true">
                        <ReadingIllustration />
                    </div>
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
