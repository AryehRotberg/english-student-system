import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAllStudents } from '../../hooks/queries';
import styles from '../../pages/Admin/AdminPage.module.css';
import { StudentDetailPanel } from './StudentDetailPanel';

function getInitials(name: string): string {
    return name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');
}

export function StudentsSection() {
    const { data: students = [], isLoading } = useAllStudents();
    const [searchParams, setSearchParams] = useSearchParams();
    const studentId = searchParams.get('studentId');

    const setStudentId = (id: string | null) => {
        const next = new URLSearchParams(searchParams);
        if (id) {
            next.set('studentId', id);
        } else {
            next.delete('studentId');
        }
        setSearchParams(next);
    };

    const [filterQuery, setFilterQuery] = useState('');

    if (isLoading) {
        return (
            <div className={styles.section}>
                <p>Loading students...</p>
            </div>
        );
    }

    if (studentId) {
        return (
            <StudentDetailPanel
                studentId={studentId}
                onBack={() => setStudentId(null)}
                onDeleted={() => setStudentId(null)}
            />
        );
    }

    const filteredStudents = filterQuery.trim()
        ? students.filter((s) =>
              s.name?.toLowerCase().includes(filterQuery.toLowerCase()),
          )
        : students;

    if (students.length === 0) {
        return (
            <div className={styles.section}>
                <p className={styles.empty}>No students found.</p>
            </div>
        );
    }

    return (
        <div>
            <div className={styles.studentGridHeader}>
                <div className={styles.filterWrap}>
                    <svg
                        className={styles.filterIcon}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                        width="18"
                        height="18"
                    >
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        />
                    </svg>
                    <input
                        className={styles.filterInput}
                        type="search"
                        placeholder="Filter by name…"
                        value={filterQuery}
                        onChange={(e) => setFilterQuery(e.target.value)}
                        aria-label="Filter students by name"
                    />
                </div>
            </div>
            <div className={styles.studentGrid}>
                {filteredStudents.map((student) => (
                    <div key={student.id} className={styles.studentCard}>
                        <div className={styles.studentAvatar}>
                            {getInitials(student.name || '?')}
                        </div>
                        <div className={styles.studentCardBody}>
                            <p className={styles.studentCardName}>
                                {student.name}
                            </p>
                            <p className={styles.studentCardEmail}>
                                {student.email}
                            </p>
                        </div>
                        <button
                            type="button"
                            className={styles.studentCardBtn}
                            onClick={() => setStudentId(student.id)}
                        >
                            Details
                        </button>
                    </div>
                ))}
            </div>
            {filteredStudents.length === 0 && (
                <p className={styles.empty}>No students match your search.</p>
            )}
        </div>
    );
}
