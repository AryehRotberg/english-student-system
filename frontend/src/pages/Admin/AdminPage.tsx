import { useSearchParams } from 'react-router-dom';
import type { AdminTab } from '../../components/admin/admin-tabs';
import { adminTabs } from '../../components/admin/admin-tabs';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { PendingStudentsSection } from '../../components/admin/PendingStudentsSection';
import { QuestionsSection } from '../../components/admin/QuestionsSection';
import { QuizBuilderSection } from '../../components/admin/QuizBuilderSection';
import { QuizzesSection } from '../../components/admin/QuizzesSection';
import {
    ReadingsSection
} from '../../components/admin/ReadingSection';
import { StudentProgressSection } from '../../components/admin/StudentProgressSection';
import { VocabularySection } from '../../components/admin/VocabularySection';
import { useAuthUser } from '../../hooks/queries';
import styles from './AdminPage.module.css';

export function AdminPage() {
    const { data: user } = useAuthUser();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab =
        (searchParams.get('tab') as AdminTab) ?? 'pending-students';
    const setActiveTab = (tab: AdminTab) => setSearchParams({ tab });

    if (user?.role !== 'teacher') {
        return (
            <div className={styles.accessDenied}>
                <p>Access denied. This page is for teachers only.</p>
            </div>
        );
    }

    const activeTabDef = adminTabs.find((t) => t.id === activeTab)!;

    return (
        <div className={styles.shell}>
            <AdminSidebar
                tabs={adminTabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            <main className={styles.main}>
                <header className={styles.mainHeader}>
                    <h1 className={styles.mainTitle}>{activeTabDef.label}</h1>
                    <p className={styles.mainDesc}>
                        {activeTabDef.description}
                    </p>
                </header>
                <div className={styles.mainContent}>
                    {activeTab === 'pending-students' && (
                        <PendingStudentsSection />
                    )}
                    {activeTab === 'quizzes' && <QuizzesSection />}
                    {activeTab === 'questions' && <QuestionsSection />}
                    {activeTab === 'quiz-builder' && <QuizBuilderSection />}
                    {activeTab === 'readings' && <ReadingsSection />}
                    {activeTab === 'vocabulary' && <VocabularySection />}
                    {activeTab === 'student-progress' && (
                        <StudentProgressSection />
                    )}
                </div>
            </main>
        </div>
    );
}
