import { useState } from "react";
import { QuestionsSection } from "../../components/admin/QuestionsSection";
import { QuizBuilderSection } from "../../components/admin/QuizBuilderSection";
import { QuizzesSection } from "../../components/admin/QuizzesSection";
import { TextsSection } from "../../components/admin/TextsSection";
import { useAuthUser } from "../../hooks/queries";
import styles from "./AdminPage.module.css";

type Tab = "quizzes" | "questions" | "quiz-builder" | "texts";

const tabs: { id: Tab; label: string }[] = [
    { id: "quizzes", label: "Quizzes" },
    { id: "questions", label: "Questions" },
    { id: "quiz-builder", label: "Quiz Builder" },
    { id: "texts", label: "Texts" },
];

export function AdminPage() {
    const { data: user } = useAuthUser();
    const [activeTab, setActiveTab] = useState<Tab>("quizzes");

    if (user?.role !== "teacher") {
        return (
            <div className={styles.accessDenied}>
                <p>Access denied. This page is for teachers only.</p>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <h2 className={styles.pageTitle}>Admin Panel</h2>

            <div className={styles.tabs} role="tablist">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        className={
                            activeTab === tab.id
                                ? `${styles.tab} ${styles.tabActive}`
                                : styles.tab
                        }
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className={styles.tabContent}>
                {activeTab === "quizzes" && <QuizzesSection />}
                {activeTab === "questions" && <QuestionsSection />}
                {activeTab === "quiz-builder" && <QuizBuilderSection />}
                {activeTab === "texts" && <TextsSection />}
            </div>
        </div>
    );
}
