import { useState } from 'react';
import styles from '../../../pages/Admin/AdminPage.module.css';
import type { SaveSubjectPayload } from '../../../services/subjects.service';
import type { Subject } from '../../../types/subject';

type SubjectFormProps = {
    subject?: Subject;
    defaultSortOrder: number;
    submitLabel: string;
    isPending: boolean;
    error: string | null;
    onSubmit: (payload: SaveSubjectPayload) => void | Promise<void>;
    onCancel?: () => void;
};

/** Turns an English name into a slug the backend accepts, e.g. "Computer Science" → "computer-science". */
function toSlug(name: string) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function SubjectForm({
    subject,
    defaultSortOrder,
    submitLabel,
    isPending,
    error,
    onSubmit,
    onCancel,
}: SubjectFormProps) {
    const [nameEn, setNameEn] = useState(subject?.nameEn ?? '');
    const [nameHe, setNameHe] = useState(subject?.nameHe ?? '');
    const [slug, setSlug] = useState(subject?.slug ?? '');
    const [sortOrder, setSortOrder] = useState(
        subject?.sortOrder ?? defaultSortOrder,
    );
    // A new subject's slug follows its English name until edited by hand.
    const [slugTouched, setSlugTouched] = useState(Boolean(subject));

    return (
        <form
            className={styles.form}
            onSubmit={(e) => {
                e.preventDefault();
                void onSubmit({
                    slug: slug.trim(),
                    nameEn: nameEn.trim(),
                    nameHe: nameHe.trim(),
                    sortOrder,
                });
            }}
        >
            <div className={styles.fieldRow}>
                <div className={styles.field}>
                    <label htmlFor="subject-name-en">English name *</label>
                    <input
                        id="subject-name-en"
                        value={nameEn}
                        onChange={(e) => {
                            setNameEn(e.target.value);
                            if (!slugTouched) setSlug(toSlug(e.target.value));
                        }}
                        placeholder="e.g. Physics"
                        maxLength={100}
                        required
                    />
                </div>
                <div className={styles.field}>
                    <label htmlFor="subject-name-he">Hebrew name *</label>
                    <input
                        id="subject-name-he"
                        dir="rtl"
                        value={nameHe}
                        onChange={(e) => setNameHe(e.target.value)}
                        placeholder="למשל פיזיקה"
                        maxLength={100}
                        required
                    />
                </div>
            </div>
            <div className={styles.fieldRow}>
                <div className={styles.field}>
                    <label htmlFor="subject-slug">Slug *</label>
                    <input
                        id="subject-slug"
                        dir="ltr"
                        value={slug}
                        onChange={(e) => {
                            setSlug(e.target.value);
                            setSlugTouched(true);
                        }}
                        placeholder="e.g. physics"
                        pattern="[a-z0-9]+(-[a-z0-9]+)*"
                        title="Lowercase letters and digits, separated by single hyphens"
                        maxLength={50}
                        required
                    />
                </div>
                <div className={styles.field}>
                    <label htmlFor="subject-sort-order">Sort order</label>
                    <input
                        id="subject-sort-order"
                        type="number"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(Number(e.target.value))}
                        required
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
            {error && <p className={styles.error}>{error}</p>}
        </form>
    );
}
