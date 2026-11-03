import { useSearchParams } from 'react-router-dom';
import type { AdminTab } from '../../components/admin/admin-tabs';
import {
    adminTabGroups,
    adminTabs,
    resolveAdminTab,
} from '../../components/admin/admin-tabs';
import { GradingSection } from '../../components/admin/GradingSection';
import { LessonsSection } from '../../components/admin/LessonsSection';
import { NEW_ITEM } from '../../components/admin/list/useEditorParam';
import { PendingStudentsSection } from '../../components/admin/PendingStudentsSection';
import { QuizzesSection } from '../../components/admin/QuizzesSection';
import { ReadingsSection } from '../../components/admin/ReadingSection';
import { StudentsSection } from '../../components/admin/StudentsSection';
import { SubjectsSection } from '../../components/admin/SubjectsSection';
import { VocabularySection } from '../../components/admin/VocabularySection';
import { HeroRings, PlusIcon } from '../../components/hub/icons';
import { useAuthUser } from '../../hooks/queries';
import styles from './AdminPage.module.css';

// The URL param each tab keeps its open item in, and its "new" button.
const CREATE_ACTIONS: Partial<Record<AdminTab, { param: string; label: string }>> =
    {
        quizzes: { param: 'quiz', label: 'New quiz' },
        lessons: { param: 'lesson', label: 'New lesson' },
        readings: { param: 'text', label: 'New text' },
        vocabulary: { param: 'topic', label: 'New topic' },
    };

export function AdminPage() {
    const { data: user } = useAuthUser();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = resolveAdminTab(searchParams.get('tab'));

    if (user?.role !== 'teacher') {
        return (
            <div className={styles.accessDenied}>
                <p>Access denied. This page is for teachers only.</p>
            </div>
        );
    }

    const activeTabDef = adminTabs.find((t) => t.id === activeTab)!;
    const groupLabel = adminTabGroups.find(
        (g) => g.id === activeTabDef.group,
    )?.label;
    // Each content list's main action; hidden once an item or the new-item
    // form is open in that tab.
    const createAction = CREATE_ACTIONS[activeTab];
    const showCreate = createAction && !searchParams.get(createAction.param);

    return (
        <div className={styles.shell}>
            <main className={styles.main}>
                <section
                    className={styles.mainHeader}
                    aria-labelledby="admin-page-heading"
                >
                    <HeroRings className={styles.heroRings} />
                    <div className={styles.heroText}>
                        <p className={styles.breadcrumb}>
                            Admin <span aria-hidden="true">/</span>{' '}
                            {groupLabel}
                        </p>
                        <h1 id="admin-page-heading" className={styles.mainTitle}>
                            {activeTabDef.label}
                        </h1>
                        <p className={styles.mainDesc}>
                            {activeTabDef.description}
                        </p>
                    </div>
                    {showCreate && (
                        <div className={styles.heroActions}>
                            <button
                                type="button"
                                className={styles.heroPrimary}
                                onClick={() =>
                                    setSearchParams({
                                        tab: activeTab,
                                        [createAction.param]: NEW_ITEM,
                                    })
                                }
                            >
                                <PlusIcon />
                                {createAction.label}
                            </button>
                        </div>
                    )}
                </section>
                <div className={styles.mainContent}>
                    {activeTab === 'pending-students' && (
                        <PendingStudentsSection />
                    )}
                    {activeTab === 'subjects' && <SubjectsSection />}
                    {activeTab === 'lessons' && <LessonsSection />}
                    {activeTab === 'quizzes' && <QuizzesSection />}
                    {activeTab === 'readings' && <ReadingsSection />}
                    {activeTab === 'vocabulary' && <VocabularySection />}
                    {activeTab === 'students' && <StudentsSection />}
                    {activeTab === 'grading' && <GradingSection />}
                </div>
            </main>
        </div>
    );
}
