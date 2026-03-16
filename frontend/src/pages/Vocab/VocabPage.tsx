import styles from './VocabPage.module.css';

const vocabSets = [
    { id: 'set-1', title: 'At the Restaurant', count: 22 },
    { id: 'set-2', title: 'Travel and Airports', count: 18 },
    { id: 'set-3', title: 'School and Exams', count: 16 },
];

export function VocabPage() {
    return (
        <section className={styles.panel}>
            <h2 className={styles.heading}>Vocabulary Studio</h2>
            <div className={styles.grid}>
                {vocabSets.map((set) => (
                    <article key={set.id} className={styles.card}>
                        <h3>{set.title}</h3>
                        <p>{set.count} words</p>
                        <button type="button">Review</button>
                    </article>
                ))}
            </div>
        </section>
    );
}
