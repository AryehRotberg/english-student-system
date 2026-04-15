import { useState } from 'react';
import { AdminMobileNav } from '../../components/admin/AdminMobileNav';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { adminTabs } from '../../components/admin/admin-tabs';
import type { AdminTab } from '../../components/admin/admin-tabs';
import { QuestionsSection } from '../../components/admin/QuestionsSection';
import { QuizBuilderSection } from '../../components/admin/QuizBuilderSection';
import { QuizzesSection } from '../../components/admin/QuizzesSection';
import { StudentProgressSection } from '../../components/admin/StudentProgressSection';
import { TextsSection } from '../../components/admin/TextsSection';
import { useAuthUser } from '../../hooks/queries';
import styles from './AdminPage.module.css';

export function AdminPage() {
    const { data: user } = useAuthUser();
    const [activeTab, setActiveTab] = useState<AdminTab>('quizzes');

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
                    {activeTab === 'quizzes' && <QuizzesSection />}
                    {activeTab === 'questions' && <QuestionsSection />}
                    {activeTab === 'quiz-builder' && <QuizBuilderSection />}
                    {activeTab === 'texts' && <TextsSection />}
                    {activeTab === 'student-progress' && (
                        <StudentProgressSection />
                    )}
                </div>
            </main>

            <AdminMobileNav
                tabs={adminTabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />
        </div>
    );
}
