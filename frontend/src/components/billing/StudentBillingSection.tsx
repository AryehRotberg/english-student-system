import { Link } from 'react-router-dom';
import type { AuthUser } from '../../types/auth';
import styles from './Billing.module.css';
import { ReceiptForm } from './ReceiptForm';
import { RecentReceipts } from './RecentReceipts';

/** Receipts tab on a student's admin page: issue a receipt and see recent ones. */
export function StudentBillingSection({ student }: { student: AuthUser }) {
    // Remount the form when its defaults change (e.g. after editing billing settings).
    const formKey = [
        student.id,
        student.grade,
        student.customLessonPrice,
        student.morningClientId,
        student.receiptEmail,
    ].join('|');

    return (
        <section className={styles.section}>
            <div className={styles.linked}>
                <h3 className={styles.heading}>New receipt</h3>
                <Link to={`/receipt?studentId=${student.id}`} className={styles.hint}>
                    Open receipt page
                </Link>
            </div>
            <ReceiptForm key={formKey} student={student} />
            <RecentReceipts studentId={student.id} />
        </section>
    );
}
