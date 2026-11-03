import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import {
    assignmentContentRoute,
    contentTypeLabel,
} from '../../utils/assignmentTopic';
import { ContentTypeTile } from '../hub/ContentTile';
import { ChevronForwardIcon } from '../hub/icons';
import styles from './Dashboard.module.css';
import type { DashboardTask } from './types';

const dueDateFormat: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
};

type Props = {
    tasks: DashboardTask[];
    doneCount: number;
    totalCount: number;
};

export function TaskList({ tasks, doneCount, totalCount }: Props) {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    return (
        <section className={styles.card} aria-labelledby="tasks-heading">
            <div className={styles.cardHead}>
                <div className={styles.cardHeadTitle}>
                    <h2 id="tasks-heading" className={styles.cardTitle}>
                        {t('dashboard.tasks')}
                    </h2>
                    {totalCount > 0 && (
                        <span className={styles.cardCount}>
                            {t('dashboard.doneOf', {
                                done: doneCount,
                                total: totalCount,
                            })}
                        </span>
                    )}
                </div>
                <Link to="/assignments" className={styles.textLink}>
                    {t('dashboard.viewAll')}
                </Link>
            </div>

            {tasks.length === 0 ? (
                <p className={styles.empty}>{t('dashboard.noTasks')}</p>
            ) : (
                <ul className={styles.taskList}>
                    {tasks.map((task) => {
                        const label =
                            task.title ?? contentTypeLabel(task.contentType);

                        return (
                            <li
                                key={task.id}
                                className={styles.taskRow}
                                data-done={task.isCompleted}
                            >
                                <ContentTypeTile type={task.contentType} />
                                <div className={styles.taskText}>
                                    <span
                                        className={styles.taskTitle}
                                        dir="auto"
                                    >
                                        {label}
                                    </span>
                                    <span
                                        className={styles.taskMeta}
                                        dir="auto"
                                    >
                                        {task.title
                                            ? `${contentTypeLabel(task.contentType)} · ${task.assignmentTitle}`
                                            : task.assignmentTitle}
                                    </span>
                                </div>
                                <div className={styles.taskEnd}>
                                    {task.isCompleted ? (
                                        <span className={styles.pillDone}>
                                            {t('dashboard.done')}
                                        </span>
                                    ) : task.isOverdue ? (
                                        <span className={styles.pillOverdue}>
                                            {t('dashboard.overdue')}
                                        </span>
                                    ) : task.dueDate ? (
                                        <span className={styles.pillDue}>
                                            {t('common.due', {
                                                date: task.dueDate.toLocaleDateString(
                                                    i18n.language,
                                                    dueDateFormat,
                                                ),
                                            })}
                                        </span>
                                    ) : null}
                                    <button
                                        type="button"
                                        className={styles.openButton}
                                        disabled={!task.isOpenable}
                                        title={
                                            task.isOpenable
                                                ? undefined
                                                : t('dashboard.noContent')
                                        }
                                        aria-label={t('dashboard.openItemAria', {
                                            title: label,
                                        })}
                                        onClick={() =>
                                            navigate(
                                                assignmentContentRoute(
                                                    task.contentType,
                                                    task.contentId,
                                                ),
                                            )
                                        }
                                    >
                                        {t('dashboard.openItem')}
                                        <ChevronForwardIcon
                                            size={16}
                                            className={styles.flipRtl}
                                        />
                                    </button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}
