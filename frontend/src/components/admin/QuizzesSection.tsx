import { useState } from 'react';
import { useCreateQuiz } from '../../hooks/mutations';
import { useQuizzes } from '../../hooks/queries';
import styles from '../../pages/Admin/AdminPage.module.css';

export function QuizzesSection() {
    const { data: quizzes = [] } = useQuizzes();
    const createQuiz = useCreateQuiz();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [showForm, setShowForm] = useState(false);

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
                    <li key={quiz.id} className={styles.item}>
                        <strong>{quiz.title}</strong>
                        {quiz.description && (
                            <p className={styles.meta}>{quiz.description}</p>
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
