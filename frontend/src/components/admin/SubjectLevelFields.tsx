import { useSubjects } from '../../hooks/queries';
import styles from '../../pages/Admin/AdminPage.module.css';

type Props = {
    subjectId: string;
    levelId: string | null;
    onChange: (value: { subjectId: string; levelId: string | null }) => void;
    disabled?: boolean;
    /** Keeps the subject fixed (e.g. a quiz's questions) while the level stays editable. */
    lockSubject?: boolean;
};

/** Subject + level pickers; changing the subject clears the level. */
export function SubjectLevelFields({
    subjectId,
    levelId,
    onChange,
    disabled,
    lockSubject,
}: Props) {
    const { data: subjects = [] } = useSubjects();
    const subject = subjects.find((s) => s.id === subjectId);

    return (
        <div className={styles.fieldRow}>
            <div className={styles.field}>
                <label>Subject</label>
                <select
                    value={subjectId}
                    disabled={disabled || lockSubject}
                    onChange={(e) =>
                        onChange({ subjectId: e.target.value, levelId: null })
                    }
                >
                    {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                            {s.nameEn}
                        </option>
                    ))}
                </select>
            </div>
            <div className={styles.field}>
                <label>Level</label>
                <select
                    value={levelId ?? ''}
                    disabled={disabled}
                    onChange={(e) =>
                        onChange({
                            subjectId,
                            levelId: e.target.value || null,
                        })
                    }
                >
                    <option value="">Any level</option>
                    {subject?.levels.map((level) => (
                        <option key={level.id} value={level.id}>
                            {level.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}

/** Filter shown above admin lists. Empty value means every subject. */
export function SubjectFilter({
    value,
    onChange,
}: {
    value: string;
    onChange: (subjectId: string) => void;
}) {
    const { data: subjects = [] } = useSubjects();

    return (
        <select
            className={styles.subjectFilter}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-label="Filter by subject"
        >
            <option value="">All subjects</option>
            {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                    {s.nameEn}
                </option>
            ))}
        </select>
    );
}
