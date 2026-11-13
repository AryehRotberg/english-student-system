import { useReceipts } from '../../hooks/queries';
import { formatDate, formatShekels, methodLabel } from '../../types/receipt';
import styles from './Billing.module.css';

/** Latest receipts issued from the app; for one student when studentId is given. */
export function RecentReceipts({ studentId }: { studentId?: string }) {
    const { data: receipts = [], isLoading } = useReceipts(studentId);

    return (
        <div className={styles.card}>
            <h3 className={styles.heading}>Recent receipts</h3>
            {isLoading ? (
                <p className={styles.hint}>Loading…</p>
            ) : receipts.length === 0 ? (
                <p className={styles.hint}>No receipts yet.</p>
            ) : (
                <ul className={styles.receiptList}>
                    {receipts.map((receipt) => (
                        <li key={receipt.id} className={styles.receiptRow}>
                            <span>
                                {formatDate(receipt.documentDate)}
                                {!studentId && receipt.studentName
                                    ? ` · ${receipt.studentName}`
                                    : ''}
                            </span>
                            <span className={styles.receiptAmount}>
                                {formatShekels(receipt.amount)}
                            </span>
                            <span className={styles.hint}>
                                {methodLabel(receipt.paymentMethod)}
                                {receipt.paymentDate !== receipt.documentDate
                                    ? ` · paid ${formatDate(receipt.paymentDate)}`
                                    : ''}
                                {receipt.morningDocumentNumber
                                    ? ` · #${receipt.morningDocumentNumber}`
                                    : ''}
                                {receipt.emailedTo ? ' · emailed' : ''}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
