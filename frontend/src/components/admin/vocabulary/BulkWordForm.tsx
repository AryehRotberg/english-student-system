import { useMemo, useRef, useState } from 'react';
import type { VocabularyImportWord } from '../../../types/vocabulary';
import {
    MAX_IMPORT_WORDS,
    VOCABULARY_FIELDS,
    countAudioClips,
    draftsFromJson,
    emptyDraft,
    isBlankDraft,
    parseTsv,
    pasteIntoDrafts,
    toImportPayload,
    validateDrafts,
    type VocabularyDraft,
    type VocabularyField,
} from '../../../utils/vocabulary-import';
import adminStyles from '../../../pages/Admin/AdminPage.module.css';
import styles from './BulkWordForm.module.css';

type Row = VocabularyDraft & { id: number };

const INITIAL_ROWS = 3;

// Row ids only need to be unique while the page is open, for React keys.
let nextRowId = 0;
const createRow = (): Row => ({ ...emptyDraft(), id: nextRowId++ });

const FIELD_LABELS: Record<VocabularyField, string> = {
    word: 'Word *',
    meaning: 'Meaning',
    example: 'Example sentence',
    translation: 'Translation',
};

type BulkWordFormProps = {
    isPending: boolean;
    isError: boolean;
    errorMessage?: string;
    onSubmit: (words: VocabularyImportWord[], includeAudio: boolean) => void;
    onCancel: () => void;
};

export function BulkWordForm({
    isPending,
    isError,
    errorMessage,
    onSubmit,
    onCancel,
}: BulkWordFormProps) {
    const [rows, setRows] = useState<Row[]>(() =>
        Array.from({ length: INITIAL_ROWS }, createRow),
    );
    const [includeAudio, setIncludeAudio] = useState(true);
    const [fileError, setFileError] = useState<string | null>(null);
    const fileInput = useRef<HTMLInputElement>(null);

    const issues = useMemo(() => validateDrafts(rows), [rows]);
    const invalidRows = useMemo(
        () => new Set(issues.map((issue) => issue.row)),
        [issues],
    );
    const words = useMemo(() => toImportPayload(rows), [rows]);

    const updateCell = (index: number, field: VocabularyField, value: string) =>
        setRows((current) =>
            current.map((row, i) =>
                i !== index
                    ? row
                    : {
                          ...row,
                          [field]: value,
                          // The spoken form belonged to the old word.
                          ...(field === 'word' ? { wordSound: undefined } : {}),
                      },
            ),
        );

    const removeRow = (index: number) =>
        setRows((current) =>
            current.length === 1
                ? [createRow()]
                : current.filter((_, i) => i !== index),
        );

    // A paste of several cells (copied from Excel or Google Sheets) fills the grid
    // from the focused cell; a single value pastes normally.
    const handlePaste = (
        e: React.ClipboardEvent<HTMLInputElement>,
        index: number,
        fieldIndex: number,
    ) => {
        const text = e.clipboardData.getData('text/plain');
        if (!/[\t\n\r]/.test(text.replace(/[\r\n]+$/, ''))) return;

        e.preventDefault();
        const cells = parseTsv(text);
        setRows((current) =>
            pasteIntoDrafts(current, cells, index, fieldIndex, createRow),
        );
    };

    const handleFile = async (file: File) => {
        setFileError(null);
        try {
            const loaded = draftsFromJson(await file.text()).map((draft) => ({
                ...draft,
                id: nextRowId++,
            }));
            setRows((current) => {
                const kept = current.filter((row) => !isBlankDraft(row));
                const merged = [...kept, ...loaded];
                return merged.length > 0 ? merged : [createRow()];
            });
        } catch (error) {
            setFileError((error as Error).message);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (issues.length > 0 || words.length === 0) return;
        onSubmit(words, includeAudio);
    };

    const clipCount = countAudioClips(words);

    return (
        <form className={adminStyles.form} onSubmit={handleSubmit}>
            <div className={styles.toolbar}>
                <p className={adminStyles.subHeading}>Add several words</p>
                <button
                    type="button"
                    className={adminStyles.ghostAddBtn}
                    onClick={() => fileInput.current?.click()}
                    disabled={isPending}
                >
                    Load JSON file
                </button>
                <input
                    ref={fileInput}
                    type="file"
                    accept=".json,application/json"
                    hidden
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = '';
                        if (file) void handleFile(file);
                    }}
                />
            </div>
            <p className={styles.hint}>
                Type into the grid, or copy rows from Excel or Google Sheets
                (columns: word, meaning, example, translation) and paste them
                into any cell. A header row is recognised. Empty rows are
                skipped. Up to {MAX_IMPORT_WORDS} words at a time.
            </p>

            <div className={styles.grid}>
                <div className={styles.headerRow} aria-hidden="true">
                    <span />
                    {VOCABULARY_FIELDS.map((field) => (
                        <span key={field}>{FIELD_LABELS[field]}</span>
                    ))}
                    <span />
                </div>
                {rows.map((row, index) => (
                    <div key={row.id} className={styles.row}>
                        <span className={styles.rowNumber}>{index + 1}</span>
                        {VOCABULARY_FIELDS.map((field, fieldIndex) => (
                            <input
                                key={field}
                                className={`${styles.cell} ${
                                    field === 'word' &&
                                    invalidRows.has(index + 1)
                                        ? styles.cellInvalid
                                        : ''
                                }`}
                                value={row[field]}
                                dir="auto"
                                placeholder={FIELD_LABELS[field].replace(
                                    ' *',
                                    '',
                                )}
                                aria-label={`Row ${index + 1} ${field}`}
                                disabled={isPending}
                                onChange={(e) =>
                                    updateCell(index, field, e.target.value)
                                }
                                onPaste={(e) =>
                                    handlePaste(e, index, fieldIndex)
                                }
                            />
                        ))}
                        <button
                            type="button"
                            className={styles.removeBtn}
                            aria-label={`Remove row ${index + 1}`}
                            disabled={isPending}
                            onClick={() => removeRow(index)}
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>

            <button
                type="button"
                className={adminStyles.ghostAddBtn}
                disabled={isPending}
                onClick={() => setRows((current) => [...current, createRow()])}
            >
                + Row
            </button>

            {issues.length > 0 && (
                <ul className={styles.issues}>
                    {issues.map((issue) => (
                        <li key={issue.message}>{issue.message}</li>
                    ))}
                </ul>
            )}
            {fileError && <p className={adminStyles.error}>{fileError}</p>}

            <label className={adminStyles.checkLabel}>
                <input
                    type="checkbox"
                    checked={includeAudio}
                    disabled={isPending}
                    onChange={(e) => setIncludeAudio(e.target.checked)}
                />
                Generate audio (word, meaning &amp; example)
            </label>

            <div className={adminStyles.fieldRow}>
                <button
                    type="submit"
                    className={adminStyles.submitButton}
                    disabled={
                        isPending || issues.length > 0 || words.length === 0
                    }
                >
                    {isPending
                        ? 'Adding…'
                        : `Add ${words.length} word${words.length === 1 ? '' : 's'}`}
                </button>
                <button
                    type="button"
                    className={adminStyles.cancelBtn}
                    disabled={isPending}
                    onClick={onCancel}
                >
                    Cancel
                </button>
            </div>
            {isPending && includeAudio && (
                <p className={styles.pending}>
                    Generating {clipCount} audio clips. This can take a minute;
                    keep this page open.
                </p>
            )}
            {isError && <p className={adminStyles.error}>{errorMessage}</p>}
        </form>
    );
}
