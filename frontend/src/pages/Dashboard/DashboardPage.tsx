import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ProgressCard } from '../../components/dashboard/ProgressCard';
import { SubjectsCard } from '../../components/dashboard/SubjectsCard';
import { TaskList } from '../../components/dashboard/TaskList';
import type { DashboardTask } from '../../components/dashboard/types';
import { UpNextCard } from '../../components/dashboard/UpNextCard';
import { CalendarIcon } from '../../components/hub/icons';
import { useAuth } from '../../contexts/AuthContext';
import {
    useAssignmentItems,
    useAssignments,
    useDashboardOverview,
} from '../../hooks/queries';
import {
    byDueDate,
    groupByAssignment,
    isAssignmentComplete,
    isPastDue,
    parseDueDate,
} from '../../utils/assignments';
import { hasOpenableContent } from '../../utils/assignmentTopic';
import styles from './DashboardPage.module.css';

// Long lists live on the assignments page; the dashboard shows what's next.
const MAX_LISTED_TASKS = 8;

function greetingKey(date: Date) {
    const hour = date.getHours();
    if (hour < 12) return 'dashboard.greetingMorning';
    if (hour < 18) return 'dashboard.greetingAfternoon';
    return 'dashboard.greetingEvening';
}

export function DashboardPage() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { data: overview } = useDashboardOverview();
    const { data: assignments, isLoading: assignmentsLoading } =
        useAssignments(user?.id);
    const { data: items, isLoading: itemsLoading } = useAssignmentItems(
        user?.id,
    );

    // Open work only, soonest due first; each item carries its assignment's
    // due date so it can be flagged overdue on its own.
    const tasks = useMemo<DashboardTask[]>(() => {
        if (!assignments || !items) return [];

        const itemsByAssignment = groupByAssignment(items);
        const subjectByItem = new Map(
            (overview?.assignmentTopics ?? []).map((topic) => [
                topic.id,
                topic.subjectId,
            ]),
        );

        return [...assignments]
            .filter(
                (assignment) =>
                    !isAssignmentComplete(
                        assignment,
                        itemsByAssignment.get(assignment.id) ?? [],
                    ),
            )
            .sort(byDueDate)
            .flatMap((assignment) => {
                const dueDate = parseDueDate(assignment.dueDate);
                const assignmentItems =
                    itemsByAssignment.get(assignment.id) ?? [];

                return assignmentItems.map((item, index) => ({
                    id: item.id,
                    assignmentId: assignment.id,
                    assignmentTitle: assignment.title,
                    title: item.title?.trim() || null,
                    contentType: item.contentType,
                    contentId: item.contentId,
                    isCompleted: item.isCompleted,
                    isOpenable: hasOpenableContent(item.contentId),
                    dueDate,
                    isOverdue: !item.isCompleted && isPastDue(dueDate),
                    step: index + 1,
                    stepCount: assignmentItems.length,
                    subjectId: subjectByItem.get(item.id) ?? null,
                }));
            });
    }, [assignments, items, overview?.assignmentTopics]);

    if (assignmentsLoading || itemsLoading || !user) {
        return (
            <p className={styles.loading} role="status">
                {t('common.loading')}
            </p>
        );
    }

    const nextTask = tasks.find((task) => !task.isCompleted) ?? null;
    const nextAssignmentSteps = nextTask
        ? tasks.filter((task) => task.assignmentId === nextTask.assignmentId)
        : [];
    const openTasks = tasks.filter((task) => !task.isCompleted);
    const doneCount = tasks.length - openTasks.length;
    const quizzesLeft = openTasks.filter(
        (task) => task.contentType === 'quiz',
    ).length;

    const now = new Date();
    const studentName =
        overview?.studentName?.trim() ||
        user.name?.trim() ||
        t('nav.defaultName');
    const firstName = studentName.split(/\s+/)[0];

    const summary =
        tasks.length === 0
            ? t('dashboard.summaryNone')
            : openTasks.length === 0
              ? t('dashboard.summaryDone')
              : t('dashboard.summary', { count: openTasks.length });

    return (
        <div className={styles.page}>
            <div className={styles.pageHead}>
                <div className={styles.greeting}>
                    <p className={styles.date}>
                        {now.toLocaleDateString(i18n.language, {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                        })}
                    </p>
                    <h1 className={styles.title} dir="auto">
                        {t(greetingKey(now), { name: firstName })}
                    </h1>
                    <p className={styles.summary}>{summary}</p>
                </div>
                <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => navigate('/assignments')}
                >
                    <CalendarIcon />
                    {t('dashboard.viewSchedule')}
                </button>
            </div>

            <div className={styles.columns}>
                <div className={styles.mainColumn}>
                    <UpNextCard
                        nextTask={nextTask}
                        steps={nextAssignmentSteps}
                        hasAnyTasks={tasks.length > 0}
                    />
                    <TaskList
                        tasks={tasks.slice(0, MAX_LISTED_TASKS)}
                        doneCount={doneCount}
                        totalCount={tasks.length}
                    />
                </div>

                <aside
                    className={styles.sideColumn}
                    aria-label={t('dashboard.overview')}
                >
                    <ProgressCard
                        doneCount={doneCount}
                        totalCount={tasks.length}
                        quizzesLeft={quizzesLeft}
                    />
                    <SubjectsCard openTasks={openTasks} />
                </aside>
            </div>
        </div>
    );
}
