import { useTranslation } from 'react-i18next';
import type { AuthUser } from '../../types/auth';
import { AuthSelect } from '../auth/AuthLayout';

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
    const { t } = useTranslation();

    return (
        <AuthSelect
            id="teacher"
            label={t('auth.teacher')}
            onChange={(event) => onChange(event.target.value)}
            required
            value={value}
            disabled={isLoading}
        >
            <option value="" disabled>
                {isLoading ? t('common.loading') : t('auth.selectTeacher')}
            </option>
            {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                    {teacher.name} — {teacher.email}
                </option>
            ))}
        </AuthSelect>
    );
}
