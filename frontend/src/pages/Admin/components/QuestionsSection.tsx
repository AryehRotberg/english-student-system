import { useState } from 'react';
import { useQuestions } from '../../../hooks/queries';
import { useCreateQuestion } from '../../../hooks/mutations';
import type { QuestionAdminItem } from '../../../types/admin-query-items';
import { QuestionDetail } from './QuestionDetail';
import styles from '../AdminPage.module.css';

export function QuestionsSection() {
    const { data: questions = [] } = useQuestions();
    const createQuestion = useCreateQuestion();
    const [questionText, setQuestionText] = useState('');
    const [questionType, setQuestionType] = useState<'multiple_choice' | 'open_ended'>('multiple_choice');
    const [audioUrl, setAudioUrl] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!questionText.trim()) return;
        await createQuestion.mutateAsync({ question: questionText.trim(), questionType, audioUrl: audioUrl.trim() || undefined });
        setQuestionText('');
        setAudioUrl('');
        setShowForm(false);
    };

    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h3>Questions</h3>
                <button type="button" className={styles.addButton} onClick={() => setShowForm((v) => !v)}>
                    {showForm ? 'Cancel' : '+ Add Question'}
                </button>
            </div>

            {showForm && (
                <form className={styles.form} onSubmit={(e) => void handleSubmit(e)}>
                    <div className={styles.field}>
                        <label>Question text *</label>
                        <textarea value={questionText} onChange={(e) => setQuestionText(e.target.value)} rows={3} placeholder="Question text" required />
                    </div>
                    <div className={styles.fieldRow}>
                        <div className={styles.field}>
                            <label>Type</label>
                            <select value={questionType} onChange={(e) => setQuestionType(e.target.value as 'multiple_choice' | 'open_ended')}>
                                <option value="multiple_choice">Multiple Choice</option>
                                <option value="open_ended">Open Ended</option>
                            </select>
                        </div>
                        <div className={styles.field}>
                            <label>Audio URL (optional)</label>
                            <input value={audioUrl} onChange={(e) => setAudioUrl(e.target.value)} placeholder="https://…" />
                        </div>
                    </div>
                    <button type="submit" className={styles.submitButton} disabled={createQuestion.isPending}>
                        {createQuestion.isPending ? 'Saving…' : 'Create Question'}
                    </button>
                    {createQuestion.isError && <p className={styles.error}>{(createQuestion.error as Error).message}</p>}
                </form>
            )}

            <ul className={styles.itemList}>
                {(questions as QuestionAdminItem[]).map((q) => (
                    <li key={q.id} className={`${styles.item} ${styles.expandable}`}>
                        <button
                            type="button"
                            className={styles.expandRow}
                            onClick={() => setExpandedId((prev) => (prev === q.id ? null : q.id))}
                        >
                            <div className={styles.expandRowLeft}>
                                <span className={styles.questionText}>{q.question}</span>
                                <span className={styles.typeBadge}>{q.questionType === 'multiple_choice' ? 'MC' : 'Open'}</span>
                            </div>
                            <span className={styles.chevron}>{expandedId === q.id ? '▲' : '▼'}</span>
                        </button>
                        {expandedId === q.id && <QuestionDetail question={q} />}
                    </li>
                ))}
                {questions.length === 0 && <li className={styles.empty}>No questions yet.</li>}
            </ul>
        </div>
    );
}
