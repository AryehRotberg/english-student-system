import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCreateReceipt } from '../../hooks/mutations';
import type { AuthUser } from '../../types/auth';
import {
    formatDate,
    formatShekels,
    methodLabel,
    todayIso,
    PAYMENT_METHODS,
    type PaymentMethod,
    type Receipt,
} from '../../types/receipt';
import { getApiErrorMessage } from '../../utils/getApiErrorMessage';
import styles from './Billing.module.css';

const MAX_AMOUNT = 100_000;

/**
 * Issues a Morning receipt for one student, dated today. Only the amount and the
 * payment method are editable; the amount starts at the student's grade price.
 * Mount with key={student.id} so switching students resets the form.
 */
export function ReceiptForm({ student }: { student: AuthUser }) {
    const defaultAmount = student.suggestedLessonPrice ?? null;
    const [amount, setAmount] = useState(defaultAmount?.toString() ?? '');
    const [method, setMethod] = useState<PaymentMethod>('bit');
    const today = todayIso();
    const [paymentDate, setPaymentDate] = useState(today);
    const [confirming, setConfirming] = useState(false);
    const [issued, setIssued] = useState<Receipt | null>(null);
    const createReceipt = useCreateReceipt();

    if (!student.morningClientId) {
        return (
            <p className={styles.warning}>
                {student.name} isn't linked to a Morning client yet.{' '}
                <Link to={`/admin?tab=students&studentId=${student.id}&view=settings`}>
                    Link one in their student page
                </Link>{' '}
                to issue receipts.
            </p>
        );
    }

    const parsedAmount = Number(amount);
    const amountValid =
        amount.trim() !== '' &&
        Number.isFinite(parsedAmount) &&
        parsedAmount > 0 &&
        parsedAmount <= MAX_AMOUNT;

    // ISO dates (yyyy-mm-dd) compare correctly as strings.
    const paymentDateValid = paymentDate !== '' && paymentDate <= today;
    const paidToday = paymentDate === today;

    const edit = (apply: () => void) => {
        apply();
        setConfirming(false);
        setIssued(null);
        createReceipt.reset();
    };

    const submit = async () => {
        const receipt = await createReceipt.mutateAsync({
            studentId: student.id,
            amount: parsedAmount,
            paymentMethod: method,
            paymentDate,
        });
        setIssued(receipt);
        setConfirming(false);
        setAmount(defaultAmount?.toString() ?? '');
        setPaymentDate(today);
    };

    return (
        <div className={styles.card}>
            <p className={styles.hint}>
                Receipt to <strong>{student.morningClientName ?? 'Morning client'}</strong>{' '}
                for {student.name}. The receipt is dated today.
            </p>

            <div className={styles.fields}>
                <label className={styles.field}>
                    <span className={styles.label}>Amount (₪)</span>
                    <input
                        className={`${styles.input} ${styles.amountInput}`}
                        type="number"
                        inputMode="decimal"
                        min={1}
                        max={MAX_AMOUNT}
                        step="any"
                        value={amount}
                        onChange={(e) => edit(() => setAmount(e.target.value))}
                    />
                    {defaultAmount !== null ? (
                        parsedAmount !== defaultAmount && (
                            <button
                                type="button"
                                className={`${styles.hint} ${styles.linkButton}`}
                                onClick={() =>
                                    edit(() => setAmount(defaultAmount.toString()))
                                }
                            >
                                Reset to {formatShekels(defaultAmount)} (
                                {student.customLessonPrice != null
                                    ? 'custom price'
                                    : `grade ${student.grade}`}
                                )
                            </button>
                        )
                    ) : (
                        <span className={styles.hint}>
                            No grade or custom price set, so there's no default
                            amount.
                        </span>
                    )}
                </label>

                <label className={styles.field}>
                    <span className={styles.label}>Payment method</span>
                    <select
                        className={styles.select}
                        value={method}
                        onChange={(e) =>
                            edit(() => setMethod(e.target.value as PaymentMethod))
                        }
                    >
                        {PAYMENT_METHODS.map((m) => (
                            <option key={m.value} value={m.value}>
                                {m.label}
                            </option>
                        ))}
                    </select>
                </label>

                <label className={styles.field}>
                    <span className={styles.label}>Payment date</span>
                    <input
                        className={`${styles.input} ${styles.dateInput}`}
                        type="date"
                        max={today}
                        value={paymentDate}
                        onChange={(e) => edit(() => setPaymentDate(e.target.value))}
                    />
                    {!paymentDateValid ? (
                        <span className={styles.error}>
                            Choose a date that isn't in the future.
                        </span>
                    ) : (
                        !paidToday && (
                            <button
                                type="button"
                                className={`${styles.hint} ${styles.linkButton}`}
                                onClick={() => edit(() => setPaymentDate(today))}
                            >
                                Reset to today
                            </button>
                        )
                    )}
                </label>
            </div>

            <p className={styles.hint}>
                {student.receiptEmail
                    ? `The receipt will be emailed to ${student.receiptEmail}.`
                    : 'The receipt will not be emailed.'}
            </p>

            {/* Receipts are legal documents, so issuing takes a second, explicit tap.
                The details sit above the buttons so the button text stays short. */}
            {confirming && (
                <p className={styles.confirmSummary}>
                    Issue a receipt for <strong>{formatShekels(parsedAmount)}</strong> paid
                    by <strong>{methodLabel(method)}</strong>
                    {paidToday ? ' today' : <> on <strong>{formatDate(paymentDate)}</strong></>}?
                </p>
            )}
            <div className={styles.actions}>
                {confirming ? (
                    <>
                        <button
                            type="button"
                            className={styles.primary}
                            disabled={createReceipt.isPending}
                            onClick={() => void submit()}
                        >
                            {createReceipt.isPending ? 'Issuing…' : 'Confirm'}
                        </button>
                        <button
                            type="button"
                            className={styles.secondary}
                            disabled={createReceipt.isPending}
                            onClick={() => setConfirming(false)}
                        >
                            Cancel
                        </button>
                    </>
                ) : (
                    <button
                        type="button"
                        className={styles.primary}
                        disabled={!amountValid || !paymentDateValid}
                        onClick={() => {
                            setIssued(null);
                            setConfirming(true);
                        }}
                    >
                        Issue receipt
                    </button>
                )}
            </div>

            {issued && (
                <p className={styles.success} role="status">
                    Receipt
                    {issued.morningDocumentNumber
                        ? ` #${issued.morningDocumentNumber}`
                        : ''}{' '}
                    issued: {formatShekels(issued.amount)} ·{' '}
                    {methodLabel(issued.paymentMethod)}
                    {issued.emailedTo ? `, emailed to ${issued.emailedTo}` : ''}.
                </p>
            )}
            {createReceipt.isError && (
                <p className={styles.error} role="alert">
                    {getApiErrorMessage(createReceipt.error)}
                </p>
            )}
        </div>
    );
}
