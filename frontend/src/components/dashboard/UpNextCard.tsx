import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useCurrentSubject } from '../../contexts/subject-context';
import { assignmentContentRoute, contentTypeLabel } from '../../utils/assignmentTopic';
import { subjectName } from '../../utils/subjects';
import { ArrowForwardIcon, ClockIcon, HeroRings } from '../hub/icons';
import styles from './Dashboard.module.css';
import type { DashboardTask } from './types';

const dueDateFormat: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
};

type Props = {
    nextTask: DashboardTask | null;
    // Every item of the next task's assignment, in order.
    steps: DashboardTask[];
    hasAnyTasks: boolean;
};

export function UpNextCard({ nextTask, steps, hasAnyTasks }: Props) {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { subjects } = useCurrentSubject();

    if (!nextTask) {
        return (
            <section className={styles.hero} aria-labelledby="up-next-heading">
                <HeroRings className={styles.heroRings} />
                <div className={styles.heroBody}>
                    <p className={styles.heroEyebrow}>
                        {t('dashboard.allCaughtUp')}
                    </p>
                    <h2 id="up-next-heading" className={styles.heroTitle}>
                        {hasAnyTasks
                            ? t('dashboard.allDoneTitle')
                            : t('dashboard.nothingAssignedTitle')}
                    </h2>
                    <p className={styles.heroText}>
                        {t('dashboard.allDoneBody')}
                    </p>
                    <div className={styles.heroActions}>
                        <button
                            type="button"
                            className={styles.heroPrimary}
                            onClick={() => navigate('/quiz')}
                        >
                            {t('dashboard.goPractice')}
                            <ArrowForwardIcon className={styles.flipRtl} />
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    const subject = subjects.find((s) => s.id === nextTask.subjectId);
    const typeLabel = contentTypeLabel(nextTask.contentType);
    const dueLabel = nextTask.dueDate
        ? t(nextTask.isOverdue ? 'common.overdue' : 'common.due', {
              date: nextTask.dueDate.toLocaleDateString(
                  i18n.language,
                  dueDateFormat,
              ),
          })
        : null;

    return (
        <section className={styles.hero} aria-labelledby="up-next-heading">
            <HeroRings className={styles.heroRings} />
            <div className={styles.heroBody}>
                <div className={styles.heroTopRow}>
                    <p className={styles.heroEyebrow}>
                        {subject
                            ? `${t('dashboard.upNext')} · ${subjectName(subject, i18n.language)}`
                            : t('dashboard.upNext')}
                    </p>
                    {dueLabel && (
                        <span
                            className={
                                nextTask.isOverdue
                                    ? styles.heroDueOverdue
                                    : styles.heroDue
                            }
                        >
                            <ClockIcon size={14} strokeWidth={2} />
                            {dueLabel}
                        </span>
                    )}
                </div>

                <div className={styles.heroHeading}>
                    <h2
                        id="up-next-heading"
                        className={styles.heroTitle}
                        dir="auto"
                    >
                        {nextTask.assignmentTitle}
                    </h2>
                    <p className={styles.heroText}>
                        {t('dashboard.nextStepLabel')}{' '}
                        <strong dir="auto">
                            {nextTask.title ?? typeLabel}
                        </strong>
                        {nextTask.stepCount > 1 &&
                            ` — ${t('dashboard.partOf', {
                                number: nextTask.step,
                                total: nextTask.stepCount,
                            })}`}
                    </p>
                </div>

                {steps.length > 1 && (
                    <ol
                        className={styles.steps}
                        aria-label={t('dashboard.stepsAria')}
                        style={
                            {
                                '--step-count': steps.length,
                            } as CSSProperties
                        }
                    >
                        {steps.map((step) => {
                            const state = step.isCompleted
                                ? 'done'
                                : step.id === nextTask.id
                                  ? 'next'
                                  : 'todo';

                            return (
                                <li
                                    key={step.id}
                                    className={styles.step}
                                    data-state={state}
                                    aria-current={
                                        state === 'next' ? 'step' : undefined
                                    }
                                >
                                    <span className={styles.stepBar} />
                                    <span className={styles.stepLabel} dir="auto">
                                        {step.title ??
                                            contentTypeLabel(step.contentType)}
                                    </span>
                                </li>
                            );
                        })}
                    </ol>
                )}

                <div className={styles.heroActions}>
                    <button
                        type="button"
                        className={styles.heroPrimary}
                        disabled={!nextTask.isOpenable}
                        title={
                            nextTask.isOpenable
                                ? undefined
                                : t('dashboard.noContent')
                        }
                        onClick={() =>
                            navigate(
                                assignmentContentRoute(
                                    nextTask.contentType,
                                    nextTask.contentId,
                                ),
                            )
                        }
                    >
                        {t(`dashboard.startBy.${nextTask.contentType}`)}
                        <ArrowForwardIcon className={styles.flipRtl} />
                    </button>
                    <button
                        type="button"
                        className={styles.heroSecondary}
                        onClick={() => navigate('/assignments')}
                    >
                        {t('dashboard.assignmentDetails')}
                    </button>
                </div>
            </div>
        </section>
    );
}
