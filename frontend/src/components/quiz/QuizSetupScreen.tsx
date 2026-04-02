import styles from "../../pages/Quiz/QuizPage.module.css";

export function QuizSetupScreen() {
    return (
        <div className={styles.stack}>
            <section
                className={styles.panel}
                style={{ textAlign: "center", padding: "3rem" }}
            >
                <h2>Setting up your quiz...</h2>
            </section>
        </div>
    );
}
