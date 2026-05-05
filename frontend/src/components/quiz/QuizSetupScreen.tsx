import styles from '../../pages/Quiz/QuizPage.module.css';

type QuizSetupScreenProps = {
    onStart: () => void;
    isPending: boolean;
};

export function QuizSetupScreen({ onStart, isPending }: QuizSetupScreenProps) {
    return (
        <div className={styles.stack}>
            <section className={styles.panel}>
                <h2>Ready to start the quiz?</h2>
                <button
                    className={styles.nextButton}
                    onClick={onStart}
                    disabled={isPending}
                    type="button"
                >
                    {isPending ? 'Starting...' : 'Start Quiz'}
                </button>
            </section>
        </div>
    );
}
