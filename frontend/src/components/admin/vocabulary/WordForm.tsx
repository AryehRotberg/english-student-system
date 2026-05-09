import { useState } from 'react';
import styles from '../../../pages/Admin/AdminPage.module.css';

export type WordFormValues = {
    word: string;
    meaning: string;
    example: string;
    translation: string;
    includeAudio: boolean;
};

type WordFormProps = {
    initialWord?: string;
    initialMeaning?: string;
    initialExample?: string;
    initialTranslation?: string;
    heading?: string;
    submitLabel: string;
    showAudioCheckbox?: boolean;
    isPending: boolean;
    isError: boolean;
    errorMessage?: string;
    onSubmit: (values: WordFormValues) => void;
    onCancel?: () => void;
};

export function WordForm({
    initialWord = '',
    initialMeaning = '',
    initialExample = '',
    initialTranslation = '',
    heading,
    submitLabel,
    showAudioCheckbox = false,
    isPending,
    isError,
    errorMessage,
    onSubmit,
    onCancel,
}: WordFormProps) {
    const [word, setWord] = useState(initialWord);
    const [meaning, setMeaning] = useState(initialMeaning);
    const [example, setExample] = useState(initialExample);
    const [translation, setTranslation] = useState(initialTranslation);
    const [includeAudio, setIncludeAudio] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            word: word.trim(),
            meaning: meaning.trim(),
            example: example.trim(),
            translation: translation.trim(),
            includeAudio,
        });
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            {heading && <p className={styles.subHeading}>{heading}</p>}
            <div className={styles.fieldRow}>
                <div className={styles.field}>
                    <label>Word *</label>
                    <input
                        value={word}
                        onChange={(e) => setWord(e.target.value)}
                        placeholder="e.g. apple"
                        required
                    />
                </div>
                <div className={styles.field}>
                    <label>Translation</label>
                    <input
                        value={translation}
                        onChange={(e) => setTranslation(e.target.value)}
                        placeholder="Translation"
                    />
                </div>
            </div>
            <div className={styles.field}>
                <label>Meaning</label>
                <input
                    value={meaning}
                    onChange={(e) => setMeaning(e.target.value)}
                    placeholder="Definition"
                />
            </div>
            <div className={styles.field}>
                <label>Example sentence</label>
                <input
                    value={example}
                    onChange={(e) => setExample(e.target.value)}
                    placeholder="Example"
                />
            </div>
            {showAudioCheckbox && (
                <label className={styles.checkLabel}>
                    <input
                        type="checkbox"
                        checked={includeAudio}
                        onChange={(e) => setIncludeAudio(e.target.checked)}
                    />
                    Generate audio (word, meaning &amp; example)
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
