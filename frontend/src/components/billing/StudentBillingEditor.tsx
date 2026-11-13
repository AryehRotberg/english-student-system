import { useState } from 'react';
import { useUpdateStudentBilling } from '../../hooks/mutations';
import { useMorningClientSearch } from '../../hooks/queries';
import type { AuthUser } from '../../types/auth';
import { formatShekels } from '../../types/receipt';
import { getApiErrorMessage } from '../../utils/getApiErrorMessage';
import styles from './Billing.module.css';

const GRADES = Array.from({ length: 12 }, (_, i) => i + 1);

// Mirrors LessonPricing on the server; shown only as a hint next to each grade.
function gradePrice(grade: number): number {
    if (grade <= 6) return 80;
    if (grade <= 8) return 100;
    return 120;
}

/**
 * A student's billing settings: grade and custom price (set the default
 * amount; the custom price wins), the paying
 * client in Morning, and the email receipts go to (empty = never emailed).
 */
export function StudentBillingEditor({ student }: { student: AuthUser }) {
    const save = useUpdateStudentBilling();
    const [grade, setGrade] = useState<number | null>(student.grade ?? null);
    const [customPrice, setCustomPrice] = useState(
        student.customLessonPrice?.toString() ?? '',
    );
    const [client, setClient] = useState<{ id: string; name: string } | null>(
        student.morningClientId
            ? { id: student.morningClientId, name: student.morningClientName ?? '' }
            : null,
    );
    const [choosingClient, setChoosingClient] = useState(!student.morningClientId);
    const [search, setSearch] = useState('');
    const [receiptEmail, setReceiptEmail] = useState(student.receiptEmail ?? '');
    const [saved, setSaved] = useState(false);

    const { data: results = [], isFetching, isError, error } =
        useMorningClientSearch(choosingClient ? search : '');

    const changed = () => {
        setSaved(false);
        save.reset();
    };

    const parsedCustomPrice = Number(customPrice);
    const customPriceValid =
        customPrice.trim() === '' ||
        (Number.isFinite(parsedCustomPrice) &&
            parsedCustomPrice > 0 &&
            parsedCustomPrice <= 100_000);

    const handleSave = async () => {
        await save.mutateAsync({
            studentId: student.id,
            billing: {
                grade,
                customLessonPrice:
                    customPrice.trim() === '' ? null : parsedCustomPrice,
                morningClientId: client?.id ?? null,
                morningClientName: client?.name ?? null,
                receiptEmail: receiptEmail.trim() || null,
            },
        });
        setSaved(true);
    };

    return (
        <div className={styles.card}>
            <h3 className={styles.heading}>Billing settings</h3>

            <div className={styles.fields}>
                <label className={styles.field}>
                    <span className={styles.label}>Grade</span>
                    <select
                        className={styles.select}
                        value={grade ?? ''}
                        onChange={(e) => {
                            setGrade(e.target.value ? Number(e.target.value) : null);
                            changed();
                        }}
                    >
                        <option value="">Not set</option>
                        {GRADES.map((g) => (
                            <option key={g} value={g}>
                                Grade {g} ({formatShekels(gradePrice(g))})
                            </option>
                        ))}
                    </select>
                </label>

                <label className={styles.field}>
                    <span className={styles.label}>Custom price (₪)</span>
                    <input
                        className={styles.input}
                        type="number"
                        inputMode="decimal"
                        min={1}
                        step="any"
                        placeholder={
                            grade ? `Grade price: ${formatShekels(gradePrice(grade))}` : 'Optional'
                        }
                        value={customPrice}
                        onChange={(e) => {
                            setCustomPrice(e.target.value);
                            changed();
                        }}
                    />
                    <span className={styles.hint}>
                        {customPriceValid
                            ? 'Overrides the grade price. Leave empty to use the grade.'
                            : 'Enter a price above 0, or leave it empty.'}
                    </span>
                </label>

                <label className={styles.field}>
                    <span className={styles.label}>Email receipts to</span>
                    <input
                        className={styles.input}
                        type="email"
                        inputMode="email"
                        autoComplete="off"
                        placeholder="Leave empty to never email"
                        value={receiptEmail}
                        onChange={(e) => {
                            setReceiptEmail(e.target.value);
                            changed();
                        }}
                    />
                </label>
            </div>

            <div className={styles.field}>
                <span className={styles.label}>Paying client in Morning</span>
                {client && !choosingClient ? (
                    <div className={styles.linked}>
                        <span>{client.name || client.id}</span>
                        <button
                            type="button"
                            className={styles.linkButton}
                            onClick={() => setChoosingClient(true)}
                        >
                            Change
                        </button>
                    </div>
                ) : (
                    <>
                        <input
                            className={styles.input}
                            type="search"
                            placeholder="Search Morning clients by name"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {isFetching && <p className={styles.hint}>Searching…</p>}
                        {isError && (
                            <p className={styles.error}>{getApiErrorMessage(error)}</p>
                        )}
                        {search.trim().length >= 2 &&
                            !isFetching &&
                            !isError &&
                            results.length === 0 && (
                                <p className={styles.hint}>No clients found.</p>
                            )}
                        {results.length > 0 && (
                            <ul className={styles.results}>
                                {results.map((result) => (
                                    <li key={result.id}>
                                        <button
                                            type="button"
                                            className={styles.result}
                                            onClick={() => {
                                                setClient({
                                                    id: result.id,
                                                    name: result.name,
                                                });
                                                setChoosingClient(false);
                                                setSearch('');
                                                changed();
                                            }}
                                        >
                                            <span>{result.name}</span>
                                            {result.emails.length > 0 && (
                                                <span className={styles.hint}>
                                                    {result.emails.join(', ')}
                                                </span>
                                            )}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {client && (
                            <button
                                type="button"
                                className={`${styles.hint} ${styles.linkButton}`}
                                onClick={() => setChoosingClient(false)}
                            >
                                Keep {client.name || 'current client'}
                            </button>
                        )}
                    </>
                )}
            </div>

            <div className={styles.actions}>
                <button
                    type="button"
                    className={styles.primary}
                    disabled={save.isPending || !customPriceValid}
                    onClick={() => void handleSave()}
                >
                    {save.isPending ? 'Saving…' : 'Save billing settings'}
                </button>
            </div>
            {saved && (
                <p className={styles.success} role="status">
                    Saved.
                </p>
            )}
            {save.isError && (
                <p className={styles.error} role="alert">
                    {getApiErrorMessage(save.error)}
                </p>
            )}
        </div>
    );
}
