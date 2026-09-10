import { useNavigate } from 'react-router-dom';
import { AssignmentsSection } from '../../components/dashboard/AssignmentsSection';
import { DashboardHero } from '../../components/dashboard/DashboardHero';
import { QuizProgressCard } from '../../components/dashboard/QuizProgressCard';
import { TodayTasksSection } from '../../components/dashboard/TodayTasksSection';
import { useDashboardOverview } from '../../hooks/queries';
import {
    assignmentContentRoute,
    isOpenableTopic,
} from '../../utils/assignmentTopic';
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

    const openableTopics = data.assignmentTopics.filter(isOpenableTopic);

    const handleOpenAssignment = () => {
        const firstAssignment = openableTopics[0];
        if (!firstAssignment) {
            return;
        }

        navigate(
            assignmentContentRoute(
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
                        hasAssignments={openableTopics.length > 0}
                        onViewAll={() => navigate('/assignments')}
                        onOpenAssignment={handleOpenAssignment}
                    />
                </div>

                <aside className={styles.rightColumn}>
                    <QuizProgressCard quizProgress={quizProgress} />
                    <AssignmentsSection
                        assignments={data.activities}
                        topics={data.assignmentTopics}
                        onOpenTopic={(topic) =>
                            navigate(
                                assignmentContentRoute(
                                    topic.contentType,
                                    topic.contentId,
                                ),
                            )
                        }
                    />
                </aside>
            </div>
        </div>
    );
}
