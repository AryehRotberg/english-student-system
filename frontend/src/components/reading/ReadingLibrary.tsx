import { useMemo, useState } from 'react';
import type { ReadingItem, ReadingLevel } from '../../types/reading';
import styles from './ReadingLibrary.module.css';

const levels: ReadingLevel[] = ['A2', 'B1', 'B2', 'C1'];

type ReadingLibraryProps = {
    items: ReadingItem[];
};

export function ReadingLibrary({ items }: ReadingLibraryProps) {
    const [selectedLevel, setSelectedLevel] = useState<ReadingLevel>('B1');

    const filteredItems = useMemo(
        () => items.filter((item) => item.level === selectedLevel),
        [items, selectedLevel],
    );

    return (
        <section className={styles.panel}>
            <h2 className={styles.heading}>Reading Library</h2>

            <div className={styles.filters}>
                <span className={styles.filterLabel}>Filter: Level</span>
                {levels.map((level) => (
                    <button
                        className={
                            level === selectedLevel
                                ? `${styles.chip} ${styles.chipActive}`
                                : styles.chip
                        }
                        key={level}
                        onClick={() => setSelectedLevel(level)}
                        type="button"
                    >
                        {level}
                    </button>
                ))}
            </div>

            <div className={styles.list}>
                {filteredItems.map((item) => (
                    <article key={item.id} className={styles.row}>
                        <div>
                            <h3 className={styles.title}>
                                {item.title}{' '}
                                <span className={styles.level}>
                                    ({item.level})
                                </span>
                            </h3>
                            <p className={styles.meta}>
                                {item.minutes} minute read
                            </p>
                        </div>
                        <button className={styles.readButton} type="button">
                            Read
                        </button>
                    </article>
                ))}
            </div>
        </section>
    );
}
