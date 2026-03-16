import { useState } from 'react';
import { useTexts, type TextAdminItem } from '../../../hooks/queries';
import { useCreateText } from '../../../hooks/mutations';
import styles from '../AdminPage.module.css';

export function TextsSection() {
    const { data: texts = [] } = useTexts();
    const createText = useCreateText();
    const [title, setTitle] = useState('');
    const [level, setLevel] = useState('B1');
    const [content, setContent] = useState('');
    const [showForm, setShowForm] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;
        await createText.mutateAsync({ title: title.trim(), content: content.trim(), level });
        setTitle('');
        setContent('');
        setLevel('B1');
        setShowForm(false);
    };

    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h3>Reading Texts</h3>
                <button type="button" className={styles.addButton} onClick={() => setShowForm((v) => !v)}>
                    {showForm ? 'Cancel' : '+ Add Text'}
                </button>
            </div>

            {showForm && (
                <form className={styles.form} onSubmit={(e) => void handleSubmit(e)}>
                    <div className={styles.fieldRow}>
                        <div className={styles.field}>
                            <label>Title *</label>
                            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Text title" required />
                        </div>
                        <div className={styles.field} style={{ maxWidth: 120 }}>
                            <label>Level</label>
                            <select value={level} onChange={(e) => setLevel(e.target.value)}>
                                <option>A2</option>
                                <option>B1</option>
                                <option>B2</option>
                                <option>C1</option>
                            </select>
                        </div>
                    </div>
                    <div className={styles.field}>
                        <label>Content *</label>
                        <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={10} placeholder="Paste or type the reading text…" required />
                    </div>
                    <button type="submit" className={styles.submitButton} disabled={createText.isPending}>
                        {createText.isPending ? 'Saving…' : 'Create Text'}
                    </button>
                    {createText.isError && <p className={styles.error}>{(createText.error as Error).message}</p>}
                </form>
            )}

            <ul className={styles.itemList}>
                {(texts as TextAdminItem[]).map((text) => (
                    <li key={text.id} className={styles.item}>
                        <strong>{text.title}</strong>
                        <span className={styles.typeBadge}>{text.level}</span>
                    </li>
                ))}
                {texts.length === 0 && <li className={styles.empty}>No texts yet.</li>}
            </ul>
        </div>
    );
}
