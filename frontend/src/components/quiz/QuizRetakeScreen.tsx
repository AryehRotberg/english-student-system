import { QuizAttemptHistoryPanel } from "../../components/quiz/QuizAttemptHistoryPanel";
import styles from "../../pages/Quiz/QuizPage.module.css";
import type { QuizAttemptApiItem } from "../../types/api-items/quiz-attempt";

type QuizRetakeScreenProps = {
    questionCount: number;
    completedAttempts: QuizAttemptApiItem[];
    isPending: boolean;
    onRetake: () => void;
    onViewAttempt: (attemptId: string) => void;
};

export function QuizRetakeScreen({
    questionCount,
    completedAttempts,
    isPending,
    onRetake,
    onViewAttempt,
}: QuizRetakeScreenProps) {
    return (
        <div className={styles.stack}>
            <section
                className={styles.panel}
                style={{ textAlign: "center", padding: "3rem" }}
            >
                <h2>Ready to try again?</h2>
                <p>You have {questionCount} questions to answer.</p>
                <button
                    className={styles.nextButton}
                    onClick={onRetake}
                    disabled={isPending}
                    type="button"
                >
                    {isPending ? "Starting..." : "Retake Quiz"}
                </button>
            </section>
            <QuizAttemptHistoryPanel
                attempts={completedAttempts}
                onViewAttempt={onViewAttempt}
            />
        </div>
    );
}
