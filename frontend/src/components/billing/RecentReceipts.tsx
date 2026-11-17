import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useReceipts } from '../../hooks/queries';
import { billingService } from '../../services/billing.service';
import type { Receipt, ReceiptLinks } from '../../types/receipt';
import { formatDate, formatShekels, methodLabel } from '../../types/receipt';
import styles from './Billing.module.css';

const LINKS: { key: keyof ReceiptLinks; label: string }[] = [
    { key: 'originalUrl', label: 'Original' },
    { key: 'copyUrl', label: 'Copy' },
];

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
                            <ReceiptDownloadLinks receipt={receipt} />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

/**
 * Plain links while the list has fresh URLs. Otherwise (older receipts, or links
 * past Morning's one-year expiry) a button that asks the server for new ones.
 */
function ReceiptDownloadLinks({ receipt }: { receipt: Receipt }) {
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    async function openFresh(key: keyof ReceiptLinks) {
        // Open the tab now, inside the tap: a window opened after an await is
        // blocked as a popup on phones. Point it at the link once it arrives.
        const tab = window.open('', '_blank');
        if (tab) tab.opener = null;

        setLoading(true);
        setError(false);
        try {
            const links = await billingService.getReceiptLinks(receipt.id);
            if (tab) {
                tab.location.href = links[key];
            } else {
                window.location.assign(links[key]);
            }
            // The list now gets the stored links and shows plain anchors.
            void queryClient.invalidateQueries({ queryKey: ['receipts'] });
        } catch {
            tab?.close();
            setError(true);
        } finally {
            setLoading(false);
        }
    }

    return (
        <span className={styles.receiptLinks}>
            {LINKS.map(({ key, label }) => {
                const url = receipt[key];
                return url ? (
                    <a
                        key={key}
                        className={styles.linkButton}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {label}
                    </a>
                ) : (
                    <button
                        key={key}
                        type="button"
                        className={styles.linkButton}
                        disabled={loading}
                        onClick={() => void openFresh(key)}
                    >
                        {label}
                    </button>
                );
            })}
            {error && <span className={styles.error}>Couldn't get the link.</span>}
        </span>
    );
}
