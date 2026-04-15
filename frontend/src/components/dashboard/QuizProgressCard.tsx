import styles from '../../pages/Dashboard/DashboardPage.module.css';

type Props = {
    quizProgress: number;
};

export function QuizProgressCard({ quizProgress }: Props) {
    const circleRadius = 58;
    const circleCircumference = 2 * Math.PI * circleRadius;
    const progressOffset =
        circleCircumference - (quizProgress / 100) * circleCircumference;

    return (
        <section className={styles.cardShell}>
            <h3 className={styles.cardTitle}>Current Quiz Progress</h3>

            <div className={styles.progressBlock}>
                <div className={styles.progressRing}>
                    <svg
                        className={styles.progressSvg}
                        viewBox="0 0 128 128"
                        role="img"
                        aria-label="Quiz progress"
                    >
                        <circle
                            className={styles.progressTrack}
                            cx="64"
                            cy="64"
                            r={circleRadius}
                        />
                        <circle
                            className={styles.progressFill}
                            cx="64"
                            cy="64"
                            r={circleRadius}
                            strokeDasharray={circleCircumference}
                            strokeDashoffset={progressOffset}
                        />
                    </svg>
                    <div className={styles.progressValue}>
                        <span className={styles.progressPercent}>
                            {quizProgress}%
                        </span>
                        <span className={styles.progressText}>Progress</span>
                    </div>
                </div>

                <p className={styles.progressNote}>
                    {quizProgress > 0
                        ? "Great momentum. Keep pushing through this week's quiz."
                        : "You haven't started your weekly grammar quiz yet."}
                </p>
            </div>
        </section>
    );
}
