import { useNavigate } from 'react-router-dom';
import { AssignmentTopicsSection } from '../../components/dashboard/AssignmentTopicsSection';
import { DashboardHero } from '../../components/dashboard/DashboardHero';
import { QuizProgressCard } from '../../components/dashboard/QuizProgressCard';
import { RecentActivityCard } from '../../components/dashboard/RecentActivityCard';
import { TodayTasksSection } from '../../components/dashboard/TodayTasksSection';
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
        data.progress.find((item) => item.label.toLowerCase() === 'quiz')
            ?.percent ??
        0;

    const featuredTask = data.tasks[0] ?? null;

    const getAssignmentRoute = (
        contentType: 'quiz' | 'reading' | 'writing' | 'vocabulary',
        contentId: string,
    ) => {
        if (contentType === 'quiz') {
            return `/quiz/${contentId}`;
        }

        if (contentType === 'reading') {
            return `/reading/${contentId}`;
        }

        if (contentType === 'vocabulary') {
            return `/vocab?topicId=${contentId}`;
        }

        return '/practice';
    };

    const handleOpenAssignment = () => {
        const firstAssignment = data.assignmentTopics[0];
        if (!firstAssignment) {
            return;
        }

        navigate(
            getAssignmentRoute(
                firstAssignment.contentType,
                firstAssignment.contentId,
            ),
        );
    };

    return (
        <div className={styles.dashboard}>
            <div className={styles.grid}>
                <div className={styles.leftColumn}>
                    <DashboardHero
                        studentName={data.studentName}
                        taskCount={data.tasks.length}
                        onViewSchedule={() => navigate('/practice')}
                    />

                    <TodayTasksSection
                        featuredTask={featuredTask}
                        hasAssignments={data.assignmentTopics.length > 0}
                        onViewAll={() => navigate('/practice')}
                        onOpenAssignment={handleOpenAssignment}
                    />

                    <AssignmentTopicsSection
                        topics={data.assignmentTopics}
                        onOpenTopic={(topic) =>
                            navigate(
                                getAssignmentRoute(
                                    topic.contentType,
                                    topic.contentId,
                                ),
                            )
                        }
                    />
                </div>

                <aside className={styles.rightColumn}>
                    <QuizProgressCard quizProgress={quizProgress} />
                    <RecentActivityCard
                        activities={data.activities}
                        onViewFullHistory={() => navigate('/practice')}
                    />
                </aside>
            </div>
        </div>
    );
}
