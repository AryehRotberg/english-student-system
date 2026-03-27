import { useState } from "react";
import { useAllStudents } from "../../hooks/queries";
import styles from "../../pages/Admin/AdminPage.module.css";
import { StudentProgressDetail } from "./StudentProgressDetail";

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
                student={selectedStudent}
                onBack={() => setSelectedStudentId(null)}
            />
        );
    }

    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h3>Student Progress</h3>
            </div>

            <ul className={styles.itemList}>
                {students.map((student) => (
                    <li key={student.id} className={styles.item}>
                        <div>
                            <strong>{student.name}</strong>
                            <p className={styles.meta}>{student.email}</p>
                        </div>
                        <button
                            type="button"
                            className={styles.viewButton}
                            onClick={() => setSelectedStudentId(student.id)}
                        >
                            View Progress
                        </button>
                    </li>
                ))}
                {students.length === 0 && (
                    <li className={styles.empty}>No students found.</li>
                )}
            </ul>
        </div>
    );
}
