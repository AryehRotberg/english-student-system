import type { AuthUser } from '../../types/auth';
import styles from '../../pages/Register/RegisterPage.module.css';

interface TeacherSelectProps {
    teachers: AuthUser[];
    isLoading: boolean;
    value: string;
    onChange: (teacherId: string) => void;
}

export function TeacherSelect({
    teachers,
    isLoading,
    value,
    onChange,
}: TeacherSelectProps) {
    return (
        <>
            <label className={styles.label} htmlFor="teacher">
                Teacher
            </label>
            <select
                className={styles.select}
                id="teacher"
                onChange={(event) => onChange(event.target.value)}
                required
                value={value}
                disabled={isLoading}
            >
                <option value="" disabled>
                    {isLoading ? 'Loading...' : 'Select your teacher'}
                </option>
                {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                        {teacher.name} — {teacher.email}
                    </option>
                ))}
            </select>
        </>
    );
}
