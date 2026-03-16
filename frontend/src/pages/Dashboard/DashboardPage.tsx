import { useNavigate } from 'react-router-dom';
import { ProgressPanel } from '../../components/dashboard/ProgressPanel';
import { RecentActivityPanel } from '../../components/dashboard/RecentActivityPanel';
import { TaskGrid } from '../../components/dashboard/TaskGrid';
import { useDashboardOverview } from '../../hooks/queries';
import styles from './DashboardPage.module.css';

export function DashboardPage() {
    const navigate = useNavigate();
    const { data } = useDashboardOverview();

    if (!data) {
        return null;
    }

    return (
        <div className={styles.stack}>
            <section className={styles.welcomePanel}>
                <p className={styles.welcome}>Welcome back, {data.studentName}</p>
            </section>

            <TaskGrid
                tasks={data.tasks}
                assignmentTopics={data.assignmentTopics}
                onOpenQuiz={(quizId) => navigate(`/quiz?quizId=${quizId}`)}
            />
            <ProgressPanel progress={data.progress} />
            <RecentActivityPanel activities={data.activities} />
        </div>
    );
}
