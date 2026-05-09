import { useState } from 'react';
import styles from '../../../pages/Admin/AdminPage.module.css';

export type TextFormValues = {
    title: string;
    content: string;
    level: string;
    quizId: string;
    vocabularyTopicId: string;
    includeAudio: boolean;
};

type TextFormProps = {
    initialTitle?: string;
    initialContent?: string;
    initialLevel?: string;
    initialQuizId?: string;
    initialVocabularyTopicId?: string;
    heading?: string;
    submitLabel: string;
    showAudioCheckbox?: boolean;
    isPending: boolean;
    isError: boolean;
    errorMessage?: string;
    quizzes: { id: string; title: string }[];
    vocabTopics: { id: string; topic: string }[];
    onSubmit: (values: TextFormValues) => void;
    onCancel?: () => void;
};

export function TextForm({
    initialTitle = '',
    initialContent = '',
    initialLevel = 'B1',
    initialQuizId = '',
    initialVocabularyTopicId = '',
    heading,
    submitLabel,
    showAudioCheckbox = false,
    isPending,
    isError,
    errorMessage,
    quizzes,
    vocabTopics,
    onSubmit,
    onCancel,
}: TextFormProps) {
    const [title, setTitle] = useState(initialTitle);
    const [content, setContent] = useState(initialContent);
    const [level, setLevel] = useState(initialLevel);
    const [quizId, setQuizId] = useState(initialQuizId);
    const [vocabularyTopicId, setVocabularyTopicId] = useState(
        initialVocabularyTopicId,
    );
    const [includeAudio, setIncludeAudio] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            title: title.trim(),
            content: content.trim(),
            level,
            quizId,
            vocabularyTopicId,
            includeAudio,
        });
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            {heading && <p className={styles.subHeading}>{heading}</p>}
            <div className={styles.fieldRow}>
                <div className={styles.field}>
                    <label>Title *</label>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Text title"
                        required
                    />
                </div>
                <div className={styles.field} style={{ maxWidth: 120 }}>
                    <label>Level</label>
                    <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                    >
                        <option>A2</option>
                        <option>B1</option>
                        <option>B2</option>
                        <option>C1</option>
                    </select>
                </div>
            </div>
            <div className={styles.fieldRow}>
                <div className={styles.field}>
                    <label>Quiz</label>
                    <select
                        value={quizId}
                        onChange={(e) => setQuizId(e.target.value)}
                    >
                        <option value="">— None —</option>
                        {quizzes.map((q) => (
                            <option key={q.id} value={q.id}>
                                {q.title}
                            </option>
                        ))}
                    </select>
                </div>
                <div className={styles.field}>
                    <label>Vocabulary topic</label>
                    <select
                        value={vocabularyTopicId}
                        onChange={(e) => setVocabularyTopicId(e.target.value)}
                    >
                        <option value="">— None —</option>
                        {vocabTopics.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.topic}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div className={styles.field}>
                <label>Content *</label>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={10}
                    placeholder="Paste or type the reading text…"
                    required
                />
            </div>
            {showAudioCheckbox && (
                <label className={styles.checkLabel}>
                    <input
                        type="checkbox"
                        checked={includeAudio}
                        onChange={(e) => setIncludeAudio(e.target.checked)}
                    />
                    Generate audio
                </label>
            )}
            <div className={styles.fieldRow}>
                <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={isPending}
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
            {isError && <p className={styles.error}>{errorMessage}</p>}
        </form>
    );
}
