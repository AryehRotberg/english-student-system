import { useState } from 'react';
import { useTopics } from '../../../hooks/queries';
import styles from '../../../pages/Admin/AdminPage.module.css';
import type { Lesson, SaveLessonPayload } from '../../../types/lesson';
import { flattenTopicTree } from '../../../utils/topics';

type Props = {
    subjectId: string;
    lesson?: Lesson;
    submitLabel: string;
    isPending: boolean;
    error?: string | null;
    onSubmit: (payload: SaveLessonPayload) => void;
    onCancel?: () => void;
};

export function LessonForm({
    subjectId,
    lesson,
    submitLabel,
    isPending,
    error,
    onSubmit,
    onCancel,
}: Props) {
    const { data: topics = [] } = useTopics(subjectId);
    const rows = flattenTopicTree(topics);
    const [topicId, setTopicId] = useState(lesson?.topicId ?? '');
    const [title, setTitle] = useState(lesson?.title ?? '');
    const [sortOrder, setSortOrder] = useState(lesson?.sortOrder ?? 0);
    const [explanation, setExplanation] = useState(lesson?.explanation ?? '');

    return (
        <form
            className={styles.form}
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit({
                    topicId,
                    title: title.trim() || null,
                    explanation,
                    sortOrder,
                });
            }}
        >
            <div className={styles.fieldRow}>
                <div className={styles.field}>
                    <label htmlFor="lesson-topic">Topic *</label>
                    <select
                        id="lesson-topic"
                        value={topicId}
                        onChange={(e) => setTopicId(e.target.value)}
                        required
                    >
                        <option value="">— Choose a topic —</option>
                        {rows.map(({ topic, depth }) => (
                            <option key={topic.id} value={topic.id}>
                                {'— '.repeat(depth)}
                                {topic.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className={styles.field} style={{ maxWidth: 120 }}>
                    <label htmlFor="lesson-order">Order</label>
                    <input
                        id="lesson-order"
                        type="number"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
                    />
                </div>
            </div>
            {rows.length === 0 && (
                <p className={styles.hintText}>
                    This subject has no topics yet. Add them under Subjects &
                    Topics first.
                </p>
            )}
            <div className={styles.field}>
                <label htmlFor="lesson-title">Title</label>
                <input
                    id="lesson-title"
                    dir="auto"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={200}
                    placeholder="e.g. Session 1: From chat to a personal Gem (defaults to the topic name)"
                />
            </div>
            <div className={styles.field}>
                <label htmlFor="lesson-explanation">Explanation (Markdown, optional)</label>
                <textarea
                    id="lesson-explanation"
                    dir="auto"
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    rows={8}
                    placeholder="Text shown above the lesson files. Supports Markdown, $formulas$ and code blocks. Leave empty for a lesson that is only slides or an HTML page."
                />
            </div>
            <div className={styles.fieldRow}>
                <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={isPending || !topicId}
                >
                    {isPending ? 'Saving…' : submitLabel}
                </button>
                {onCancel && (
                    <button
                        type="button"
                        className={styles.cancelBtn}
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                )}
            </div>
            {error && <p className={styles.error}>{error}</p>}
        </form>
    );
}
