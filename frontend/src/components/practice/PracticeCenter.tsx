import styles from "./PracticeCenter.module.css";

const practiceModules = ["Grammar", "Listening", "Speaking", "Writing"];

export function PracticeCenter() {
    return (
        <section className={styles.panel}>
            <h2 className={styles.heading}>Practice Center</h2>
            <div className={styles.grid}>
                {practiceModules.map((module) => (
                    <button key={module} className={styles.card} type="button">
                        {module}
                    </button>
                ))}
            </div>
        </section>
    );
}
