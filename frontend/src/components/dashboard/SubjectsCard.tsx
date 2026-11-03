import { useTranslation } from 'react-i18next';
import { useCurrentSubject } from '../../contexts/subject-context';
import { subjectName } from '../../utils/subjects';
import type { Tone } from '../hub/tones';
import { toneClass } from '../hub/tones';
import { ChevronForwardIcon } from '../hub/icons';
import styles from './Dashboard.module.css';
import type { DashboardTask } from './types';

const subjectTones: Tone[] = ['blue', 'teal', 'amber', 'violet', 'rose'];

function subjectInitials(name: string) {
    return name.trim().slice(0, 2);
}

/** The student's subjects; picking one switches the whole site to it. */
export function SubjectsCard({ openTasks }: { openTasks: DashboardTask[] }) {
    const { t, i18n } = useTranslation();
    const { availableSubjects, currentSubject, setCurrentSubjectId } =
        useCurrentSubject();

    if (availableSubjects.length === 0) {
        return null;
    }

    return (
        <section className={styles.card} aria-labelledby="subjects-heading">
            <h2
                id="subjects-heading"
                className={`${styles.cardTitle} ${styles.subjectsTitle}`}
            >
                {t('dashboard.subjects')}
            </h2>
            <ul className={styles.subjectList}>
                {availableSubjects.map((subject, index) => {
                    const name = subjectName(subject, i18n.language);
                    const open = openTasks.filter(
                        (task) => task.subjectId === subject.id,
                    ).length;
                    const isCurrent = subject.id === currentSubject?.id;

                    return (
                        <li key={subject.id}>
                            <button
                                type="button"
                                className={styles.subjectRow}
                                aria-pressed={isCurrent}
                                onClick={() => setCurrentSubjectId(subject.id)}
                            >
                                <span
                                    aria-hidden="true"
                                    className={`${styles.subjectBadge} ${toneClass[subjectTones[index % subjectTones.length]]}`}
                                >
                                    {subjectInitials(name)}
                                </span>
                                <span className={styles.subjectText}>
                                    <span className={styles.subjectName}>
                                        {name}
                                    </span>
                                    <span className={styles.subjectMeta}>
                                        {open > 0
                                            ? t('dashboard.subjectOpen', {
                                                  count: open,
                                              })
                                            : t('dashboard.subjectNothingDue')}
                                    </span>
                                </span>
                                {isCurrent ? (
                                    <span className={styles.currentTag}>
                                        {t('dashboard.currentSubject')}
                                    </span>
                                ) : (
                                    <ChevronForwardIcon
                                        size={16}
                                        className={`${styles.subjectChevron} ${styles.flipRtl}`}
                                    />
                                )}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
