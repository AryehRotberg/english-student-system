import { useTranslation } from 'react-i18next';
import styles from './Dashboard.module.css';

type Props = {
    doneCount: number;
    totalCount: number;
    quizzesLeft: number;
};

const RADIUS = 50;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function progressNoteKey(done: number, total: number) {
    if (total === 0) return 'dashboard.progressNoteEmpty';
    if (done === total) return 'dashboard.progressNoteDone';
    if (done === 0) return 'dashboard.progressNoteStart';
    if (total - done === 1) return 'dashboard.progressNoteAlmost';
    if (done * 2 >= total) return 'dashboard.progressNoteHalf';
    return 'dashboard.progressNoteSome';
}

export function ProgressCard({ doneCount, totalCount, quizzesLeft }: Props) {
    const { t } = useTranslation();
    const percent =
        totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);
    const filled = (CIRCUMFERENCE * percent) / 100;

    return (
        <section
            className={`${styles.card} ${styles.cardPadded}`}
            aria-labelledby="progress-heading"
        >
            <h2 id="progress-heading" className={styles.cardTitle}>
                {t('dashboard.progressTitle')}
            </h2>

            <div className={styles.progressRow}>
                <div className={styles.ring}>
                    <svg
                        role="img"
                        aria-label={t('dashboard.tasksDone', {
                            done: doneCount,
                            total: totalCount,
                        })}
                        width="112"
                        height="112"
                        viewBox="0 0 120 120"
                    >
                        <circle
                            className={styles.ringTrack}
                            cx="60"
                            cy="60"
                            r={RADIUS}
                        />
                        <circle
                            className={styles.ringFill}
                            cx="60"
                            cy="60"
                            r={RADIUS}
                            strokeDasharray={`${filled} ${CIRCUMFERENCE}`}
                            transform="rotate(-90 60 60)"
                        />
                    </svg>
                    <span className={styles.ringValue} aria-hidden="true">
                        {percent}%
                    </span>
                </div>
                <div className={styles.progressText}>
                    <span className={styles.progressHeadline}>
                        {t('dashboard.tasksDone', {
                            done: doneCount,
                            total: totalCount,
                        })}
                    </span>
                    <span className={styles.progressNote}>
                        {t(progressNoteKey(doneCount, totalCount))}
                    </span>
                </div>
            </div>

            <dl className={styles.stats}>
                <div className={styles.statAccent}>
                    <dt>{t('dashboard.remaining')}</dt>
                    <dd>{totalCount - doneCount}</dd>
                </div>
                <div className={styles.statAmber}>
                    <dt>{t('dashboard.quizzesLeft')}</dt>
                    <dd>{quizzesLeft}</dd>
                </div>
            </dl>
        </section>
    );
}
