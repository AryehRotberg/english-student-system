import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import styles from '../../components/billing/Billing.module.css';
import { ReceiptForm } from '../../components/billing/ReceiptForm';
import { RecentReceipts } from '../../components/billing/RecentReceipts';
import { SearchSelect } from '../../components/admin/SearchSelect';
import { useAllStudents, useAuthUser } from '../../hooks/queries';

// While this page is open, "Add to Home Screen" (iPhone: Safari → Share) saves an
// icon that opens /receipt instead of the app's start page.
function useReceiptHomeScreenShortcut() {
    useEffect(() => {
        const manifest = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
        const appleTitle = document.querySelector<HTMLMetaElement>(
            'meta[name="apple-mobile-web-app-title"]',
        );
        const previous = {
            manifest: manifest?.getAttribute('href'),
            appleTitle: appleTitle?.getAttribute('content'),
            title: document.title,
        };

        manifest?.setAttribute('href', '/receipt.webmanifest');
        appleTitle?.setAttribute('content', 'Receipt');
        document.title = 'New receipt';

        return () => {
            if (manifest && previous.manifest) manifest.setAttribute('href', previous.manifest);
            if (appleTitle && previous.appleTitle)
                appleTitle.setAttribute('content', previous.appleTitle);
            document.title = previous.title;
        };
    }, []);
}

function isStandalone(): boolean {
    return (
        window.matchMedia?.('(display-mode: standalone)').matches ||
        (navigator as Navigator & { standalone?: boolean }).standalone === true
    );
}

/** Quick receipt: pick a student, check the amount and payment method, issue. */
export function ReceiptPage() {
    useReceiptHomeScreenShortcut();
    const { data: user } = useAuthUser();
    const { data: students = [], isLoading } = useAllStudents();
    const [searchParams, setSearchParams] = useSearchParams();
    const studentId = searchParams.get('studentId') ?? '';

    const options = useMemo(
        () => students.map((s) => ({ id: s.id, label: s.name || s.email })),
        [students],
    );
    const student = students.find((s) => s.id === studentId);

    if (user && user.role !== 'teacher') {
        return <p className={styles.error}>This page is for teachers only.</p>;
    }

    return (
        <div className={styles.page}>
            <h1 className={styles.heading} style={{ fontSize: 'var(--text-2xl)' }}>
                New receipt
            </h1>

            {/* Not a <label> wrapper: a click on an option would bubble to the label,
                which re-clicks the input and reopens the list. */}
            <div className={styles.field}>
                <label htmlFor="receipt-student" className={styles.label}>
                    Student
                </label>
                <SearchSelect
                    id="receipt-student"
                    options={options}
                    value={studentId}
                    onChange={(id) =>
                        setSearchParams(id ? { studentId: id } : {}, { replace: true })
                    }
                    placeholder={isLoading ? 'Loading students…' : 'Type a name…'}
                    inputClassName={styles.input}
                />
            </div>

            {student && <ReceiptForm key={student.id} student={student} />}

            <RecentReceipts />

            {!isStandalone() && (
                <p className={styles.hint}>
                    Shortcut: on iPhone, open this page in Safari, tap Share → Add to
                    Home Screen.
                </p>
            )}
        </div>
    );
}
