import { useState } from 'react';
import styles from '../../../pages/Admin/AdminPage.module.css';

type TopicFormValues = { topic: string; description: string };

type TopicFormProps = {
    initialTopic?: string;
    initialDescription?: string;
    heading?: string;
    submitLabel: string;
    isPending: boolean;
    isError: boolean;
    errorMessage?: string;
    onSubmit: (values: TopicFormValues) => void;
    onCancel?: () => void;
};

export function TopicForm({
    initialTopic = '',
    initialDescription = '',
    heading,
    submitLabel,
    isPending,
    isError,
    errorMessage,
    onSubmit,
    onCancel,
}: TopicFormProps) {
    const [topic, setTopic] = useState(initialTopic);
    const [description, setDescription] = useState(initialDescription);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ topic: topic.trim(), description: description.trim() });
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            {heading && <p className={styles.subHeading}>{heading}</p>}
            <div className={styles.fieldRow}>
                <div className={styles.field}>
                    <label>Topic name *</label>
                    <input
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g. Animals"
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
            </div>
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
