import { useRef } from 'react';
import type { ReadingAdminItem } from '../../../types/admin-query-items';
import styles from '../../../pages/Admin/AdminPage.module.css';

type TextItemProps = {
    text: ReadingAdminItem;
    isExpanded: boolean;
    onToggle: () => void;
    onEdit: () => void;
    onDelete: () => void;
    deleteIsPending: boolean;
    onUploadAudio: (file: File) => void;
    uploadIsPending: boolean;
    uploadErrorMessage?: string;
};

export function TextItem({
    text,
    isExpanded,
    onToggle,
    onEdit,
    onDelete,
    deleteIsPending,
    onUploadAudio,
    uploadIsPending,
    uploadErrorMessage,
}: TextItemProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

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
                                    background: 'var(--info-100)',
                                    color: 'var(--info-700)',
                                }}
                            >
                                {text.quiz.title}
                            </span>
                        )}
                        {text.vocabularyTopic && (
                            <span
                                className={styles.typeBadge}
                                style={{
                                    background: 'var(--sun-100)',
                                    color: 'var(--sun-700)',
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
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="audio/mpeg,.mp3"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            e.target.value = '';
                            if (file) onUploadAudio(file);
                        }}
                    />
                    <button
                        type="button"
                        className={styles.editBtn}
                        disabled={uploadIsPending}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {uploadIsPending ? 'Uploading…' : 'Audio'}
                    </button>
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
            {uploadErrorMessage && (
                <p
                    className={styles.error}
                    style={{ padding: '0 1rem 0.75rem' }}
                >
                    {uploadErrorMessage}
                </p>
            )}
            {isExpanded && (
                <div
                    style={{
                        padding: '0.75rem 1rem 1rem',
                        borderTop: '1px solid var(--line)',
                        color: 'var(--ink-700)',
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
