import type { VocabularyWord } from '../../../types/vocabulary';
import styles from '../../../pages/Admin/AdminPage.module.css';

type WordItemProps = {
    word: VocabularyWord;
    onEdit: (word: VocabularyWord) => void;
    onDelete: (word: VocabularyWord) => void;
};

export function WordItem({ word: w, onEdit, onDelete }: WordItemProps) {
    return (
        <li className={styles.item}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                }}
            >
                <div>
                    <strong>{w.word}</strong>
                    {w.translation && (
                        <span
                            className={styles.typeBadge}
                            style={{
                                background: '#f3e8ff',
                                color: '#6b21a8',
                                marginLeft: '0.4rem',
                            }}
                        >
                            {w.translation}
                        </span>
                    )}
                    {w.meaning && (
                        <div
                            style={{
                                fontSize: '0.85rem',
                                color: '#374151',
                                marginTop: '0.2rem',
                            }}
                        >
                            {w.meaning}
                        </div>
                    )}
                    {w.example && (
                        <div
                            style={{
                                fontSize: '0.82rem',
                                color: '#6b7280',
                                fontStyle: 'italic',
                                marginTop: '0.1rem',
                            }}
                        >
                            {w.example}
                        </div>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                        type="button"
                        className={styles.editBtn}
                        onClick={() => onEdit(w)}
                    >
                        Edit
                    </button>
                    <button
                        type="button"
                        className={styles.deleteBtn}
                        onClick={() => {
                            if (!confirm(`Delete word "${w.word}"?`)) return;
                            onDelete(w);
                        }}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </li>
    );
}
