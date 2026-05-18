import type { ReadingAdminItem } from '../../../types/admin-query-items';
import styles from '../../../pages/Admin/AdminPage.module.css';

type TextItemProps = {
    text: ReadingAdminItem;
    isExpanded: boolean;
    onToggle: () => void;
    onEdit: () => void;
    onDelete: () => void;
    deleteIsPending: boolean;
};

export function TextItem({
    text,
    isExpanded,
    onToggle,
    onEdit,
    onDelete,
    deleteIsPending,
}: TextItemProps) {
    return (
        <li className={`${styles.item} ${styles.expandable}`}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <button
                    type="button"
                    className={styles.expandRow}
                    style={{ flex: 1 }}
                    onClick={onToggle}
                >
                    <div className={styles.expandRowLeft}>
                        <strong>{text.title}</strong>
                        <span className={styles.typeBadge}>{text.level}</span>
                        {text.quiz && (
                            <span
                                className={styles.typeBadge}
                                style={{
                                    background: '#e0f2fe',
                                    color: '#0369a1',
                                }}
                            >
                                {text.quiz.title}
                            </span>
                        )}
                        {text.vocabularyTopic && (
                            <span
                                className={styles.typeBadge}
                                style={{
                                    background: '#fef9c3',
                                    color: '#854d0e',
                                }}
                            >
                                {text.vocabularyTopic.topic}
                            </span>
                        )}
                    </div>
                    <span className={styles.chevron}>
                        {isExpanded ? '▲' : '▼'}
                    </span>
                </button>
                <div
                    style={{
                        display: 'flex',
                        gap: '0.4rem',
                        paddingRight: '1rem',
                        flexShrink: 0,
                    }}
                >
                    <button
                        type="button"
                        className={styles.editBtn}
                        onClick={onEdit}
                    >
                        Edit
                    </button>
                    <button
                        type="button"
                        className={styles.deleteBtn}
                        disabled={deleteIsPending}
                        onClick={() => {
                            if (!confirm(`Delete "${text.title}"?`)) return;
                            onDelete();
                        }}
                    >
                        Delete
                    </button>
                </div>
            </div>
            {isExpanded && (
                <div
                    style={{
                        padding: '0.75rem 1rem 1rem',
                        borderTop: '1px solid #f3f4f6',
                        color: '#374151',
                        fontSize: '0.9rem',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                    }}
                >
                    {text.content.slice(0, 400)}
                    {text.content.length > 400 ? '…' : ''}
                </div>
            )}
        </li>
    );
}
