import { useState } from 'react';
import { useCreateQuiz, useDeleteQuiz } from '../../hooks/mutations';
import { useQuizzes } from '../../hooks/queries';
import styles from '../../pages/Admin/AdminPage.module.css';

export function QuizzesSection() {
    const { data: quizzes = [] } = useQuizzes();
    const createQuiz = useCreateQuiz();
    const deleteQuiz = useDeleteQuiz();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        await createQuiz.mutateAsync({
            title: title.trim(),
            description: description.trim() || undefined,
        });
        setTitle('');
        setDescription('');
        setShowForm(false);
    };

    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h3>Quizzes</h3>
                <button
                    type="button"
                    className={styles.addButton}
                    onClick={() => setShowForm((v) => !v)}
                >
                    {showForm ? 'Cancel' : '+ Add Quiz'}
                </button>
            </div>

            {showForm && (
                <form
                    className={styles.form}
                    onSubmit={(e) => void handleSubmit(e)}
                >
                    <div className={styles.field}>
                        <label>Title *</label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Quiz title"
                            required
                        />
                    </div>
                    <div className={styles.field}>
                        <label>Description</label>
                        <input
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional description"
                        />
                    </div>
                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={createQuiz.isPending}
                    >
                        {createQuiz.isPending ? 'Saving…' : 'Create Quiz'}
                    </button>
                    {createQuiz.isError && (
                        <p className={styles.error}>
                            {(createQuiz.error as Error).message}
                        </p>
                    )}
                </form>
            )}

            <ul className={styles.itemList}>
                {quizzes.map((quiz) => (
                    <li
                        key={quiz.id}
                        className={`${styles.item} ${styles.expandable}`}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <button
                                type="button"
                                className={styles.expandRow}
                                style={{ flex: 1 }}
                                onClick={() =>
                                    setExpandedId((prev) =>
                                        prev === quiz.id ? null : quiz.id,
                                    )
                                }
                            >
                                <div className={styles.expandRowLeft}>
                                    <strong>{quiz.title}</strong>
                                </div>
                                <span className={styles.chevron}>
                                    {expandedId === quiz.id ? '▲' : '▼'}
                                </span>
                            </button>
                            <div
                                style={{ paddingRight: '1rem', flexShrink: 0 }}
                            >
                                <button
                                    type="button"
                                    className={styles.deleteBtn}
                                    disabled={deleteQuiz.isPending}
                                    onClick={() => {
                                        if (
                                            !confirm(
                                                `Delete quiz "${quiz.title}"?`,
                                            )
                                        )
                                            return;
                                        void deleteQuiz.mutate(quiz.id);
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                        {expandedId === quiz.id && quiz.description && (
                            <div
                                style={{
                                    padding: '0.5rem 1rem 1rem',
                                    borderTop: '1px solid #f3f4f6',
                                    color: '#6b7280',
                                    fontSize: '0.9rem',
                                }}
                            >
                                {quiz.description}
                            </div>
                        )}
                    </li>
                ))}
                {quizzes.length === 0 && (
                    <li className={styles.empty}>No quizzes yet.</li>
                )}
            </ul>
        </div>
    );
}
