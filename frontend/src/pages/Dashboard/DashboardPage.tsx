import { useNavigate } from 'react-router-dom';
import { useDashboardOverview } from '../../hooks/queries';
import styles from './DashboardPage.module.css';

export function DashboardPage() {
    const navigate = useNavigate();
    const { data } = useDashboardOverview();

    if (!data) {
        return null;
    }

    const quizProgress =
        data.progress.find((item) => item.id === 'quiz')?.percent ??
        data.progress.find((item) => item.label.toLowerCase() === 'quiz')?.percent ??
        0;

    const circleRadius = 58;
    const circleCircumference = 2 * Math.PI * circleRadius;
    const progressOffset = circleCircumference - (quizProgress / 100) * circleCircumference;

    const featuredTask = data.tasks[0] ?? null;
    const uniqueTopics = Array.from(
        new Map(data.assignmentTopics.map((topic) => [topic.topicTitle, topic])).values(),
    );
    const topicStyles = [
        styles.topicBlue,
        styles.topicGreen,
        styles.topicAmber,
        styles.topicPurple,
        styles.topicRose,
        styles.topicSlate,
    ];

    const activityIconMap = ['assignment', 'verified', 'star', 'menu_book'];

    const getAssignmentRoute = (contentType: 'quiz' | 'text' | 'writing', contentId: string) => {
        if (contentType === 'quiz') {
            return `/quiz/${contentId}`;
        }

        if (contentType === 'text') {
            return '/reading';
        }

        return '/practice';
    };

    const handleOpenAssignment = () => {
        const firstAssignment = data.assignmentTopics[0];
        if (!firstAssignment) {
            return;
        }

        navigate(getAssignmentRoute(firstAssignment.contentType, firstAssignment.contentId));
    };

    return (
        <div className={styles.dashboard}>
            <div className={styles.grid}>
                <div className={styles.leftColumn}>
                    <section className={styles.hero}>
                        <div className={styles.heroGlowA} aria-hidden="true" />
                        <div className={styles.heroGlowB} aria-hidden="true" />
                        <div className={styles.heroInner}>
                            <h1 className={styles.heroTitle}>Welcome back, {data.studentName}</h1>
                            <p className={styles.heroSubtitle}>
                                Ready to continue your English journey? You&apos;ve got {data.tasks.length}{' '}
                                task{data.tasks.length === 1 ? '' : 's'} to complete today.
                            </p>
                            <button
                                className={styles.heroAction}
                                type="button"
                                onClick={() => navigate('/practice')}
                            >
                                View Schedule
                            </button>
                        </div>
                    </section>

                    <section>
                        <div className={styles.sectionBar}>
                            <h2 className={styles.sectionTitle}>Today&apos;s Tasks</h2>
                            <button
                                className={styles.viewAll}
                                type="button"
                                onClick={() => navigate('/practice')}
                            >
                                View All
                            </button>
                        </div>

                        {featuredTask ? (
                            <article className={styles.taskCard}>
                                <div className={styles.taskMain}>
                                    <h3 className={styles.taskTitle}>{featuredTask.title}</h3>

                                    <button
                                        className={styles.startButton}
                                        type="button"
                                        onClick={handleOpenAssignment}
                                        disabled={data.assignmentTopics.length === 0}
                                    >
                                        Open Assignment
                                    </button>
                                </div>

                                <div className={styles.taskVisual} aria-hidden="true" />
                            </article>
                        ) : (
                            <div className={styles.cardShell}>
                                <p className={styles.emptyState}>No tasks are currently assigned.</p>
                            </div>
                        )}
                    </section>

                    <section>
                        <h2 className={`${styles.sectionTitle} ${styles.topicsTitle}`}>Assignment Topics</h2>

                        {uniqueTopics.length > 0 ? (
                            <div className={styles.topicRow}>
                                {uniqueTopics.map((topic, index) => (
                                    <button
                                        key={topic.id}
                                        type="button"
                                        className={`${styles.topicChip} ${topicStyles[index % topicStyles.length]}`}
                                        onClick={() => navigate(getAssignmentRoute(topic.contentType, topic.contentId))}
                                    >
                                        {topic.topicTitle}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className={styles.emptyState}>No assignment topics available yet.</p>
                        )}
                    </section>
                </div>

                <aside className={styles.rightColumn}>
                    <section className={styles.cardShell}>
                        <h3 className={styles.cardTitle}>Current Quiz Progress</h3>

                        <div className={styles.progressBlock}>
                            <div className={styles.progressRing}>
                                <svg className={styles.progressSvg} viewBox="0 0 128 128" role="img" aria-label="Quiz progress">
                                    <circle className={styles.progressTrack} cx="64" cy="64" r={circleRadius} />
                                    <circle
                                        className={styles.progressFill}
                                        cx="64"
                                        cy="64"
                                        r={circleRadius}
                                        strokeDasharray={circleCircumference}
                                        strokeDashoffset={progressOffset}
                                    />
                                </svg>
                                <div className={styles.progressValue}>
                                    <span className={styles.progressPercent}>{quizProgress}%</span>
                                    <span className={styles.progressText}>Progress</span>
                                </div>
                            </div>

                            <p className={styles.progressNote}>
                                {quizProgress > 0
                                    ? 'Great momentum. Keep pushing through this week\'s quiz.'
                                    : 'You haven\'t started your weekly grammar quiz yet.'}
                            </p>
                        </div>
                    </section>

                    <section className={styles.cardShell}>
                        <h3 className={styles.cardTitle}>Recent Activity</h3>

                        {data.activities.length > 0 ? (
                            <ul className={styles.activityList}>
                                {data.activities.slice(0, 4).map((activity, index) => (
                                    <li key={activity.id} className={styles.activityItem}>
                                        <span
                                            className={`${styles.activityBadge} ${styles[`activityTone${index % 4}`]}`}
                                            aria-hidden="true"
                                        >
                                            {activityIconMap[index % activityIconMap.length]}
                                        </span>

                                        <div className={styles.activityText}>
                                            <p className={styles.activityTitle}>{activity.title}</p>
                                            <p className={styles.activityTime}>From your latest assignments</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className={styles.emptyState}>No recent activity yet.</p>
                        )}

                        <button className={styles.historyButton} type="button" onClick={() => navigate('/practice')}>
                            View Full History
                        </button>
                    </section>
                </aside>
            </div>
        </div>
    );
}
