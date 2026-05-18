import { useApproveStudent, useRemoveStudent } from '../../hooks/mutations';
import { usePendingStudents } from '../../hooks/queries';
import styles from '../../pages/Admin/AdminPage.module.css';

function getInitials(name: string): string {
    return name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');
}

export function PendingStudentsSection() {
    const { data: students = [], isLoading } = usePendingStudents();
    const approveMutation = useApproveStudent();
    const removeMutation = useRemoveStudent();

    if (isLoading) {
        return (
            <div className={styles.section}>
                <p>Loading pending students...</p>
            </div>
        );
    }

    if (students.length === 0) {
        return (
            <div className={styles.section}>
                <p className={styles.empty}>
                    No pending students awaiting approval.
                </p>
            </div>
        );
    }

    return (
        <div className={styles.studentGrid}>
            {students.map((student) => (
                <div key={student.id} className={styles.studentCard}>
                    <div className={styles.studentAvatar}>
                        {getInitials(student.name || '?')}
                    </div>
                    <div className={styles.studentCardBody}>
                        <p className={styles.studentCardName}>{student.name}</p>
                        <p className={styles.studentCardEmail}>
                            {student.email}
                        </p>
                    </div>
                    <div className={styles.pendingCardActions}>
                        <button
                            type="button"
                            className={styles.approveBtn}
                            disabled={
                                approveMutation.isPending &&
                                approveMutation.variables === student.id
                            }
                            onClick={() => approveMutation.mutate(student.id)}
                        >
                            Approve
                        </button>
                        <button
                            type="button"
                            className={styles.rejectBtn}
                            disabled={
                                removeMutation.isPending &&
                                removeMutation.variables === student.id
                            }
                            onClick={() => removeMutation.mutate(student.id)}
                        >
                            Reject
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
