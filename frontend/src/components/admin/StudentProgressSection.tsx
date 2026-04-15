import { useState } from 'react';
import { useAllStudents } from '../../hooks/queries';
import styles from '../../pages/Admin/AdminPage.module.css';
import type { AuthUser } from '../../types/auth';
import { StudentProgressDetail } from './StudentProgressDetail';

function getInitials(name: string): string {
    return name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');
}

export function StudentProgressSection() {
    const { data: students = [], isLoading } = useAllStudents();
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
        null,
    );

    const selectedStudent = students.find((s) => s.id === selectedStudentId);

    if (isLoading) {
        return (
            <div className={styles.section}>
                <p>Loading students...</p>
            </div>
        );
    }

    if (selectedStudent) {
        return (
            <StudentProgressDetail
                student={selectedStudent as AuthUser}
                onBack={() => setSelectedStudentId(null)}
            />
        );
    }

    if (students.length === 0) {
        return (
            <div className={styles.section}>
                <p className={styles.empty}>No students found.</p>
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
                    <button
                        type="button"
                        className={styles.studentCardBtn}
                        onClick={() => setSelectedStudentId(student.id)}
                    >
                        View Progress
                    </button>
                </div>
            ))}
        </div>
    );
}
