import { useState } from 'react';
import { useSetStudentSubjects } from '../../hooks/mutations';
import { useStudentSubjects, useSubjects } from '../../hooks/queries';
import styles from '../../pages/Admin/AdminPage.module.css';
import type { StudentSubject, Subject } from '../../types/subject';
import { getApiErrorMessage } from '../../utils/getApiErrorMessage';

type Enrollment = Record<string, { enrolled: boolean; levelId: string | null }>;

function toEnrollment(current: StudentSubject[]): Enrollment {
    return Object.fromEntries(
        current.map((s) => [s.subjectId, { enrolled: true, levelId: s.levelId }]),
    );
}

/** Which subjects the student studies, and at which level. */
export function StudentSubjectsEditor({ studentId }: { studentId: string }) {
    const { data: subjects = [] } = useSubjects();
    const { data: current, isLoading } = useStudentSubjects(studentId);

    if (isLoading || !current) {
        return null;
    }

    return (
        <EnrollmentForm
            key={current.map((s) => `${s.subjectId}:${s.levelId}`).join(',')}
            studentId={studentId}
            subjects={subjects}
            current={current}
        />
    );
}

function EnrollmentForm({
    studentId,
    subjects,
    current,
}: {
    studentId: string;
    subjects: Subject[];
    current: StudentSubject[];
}) {
    const save = useSetStudentSubjects();
    const [enrollment, setEnrollment] = useState<Enrollment>(() =>
        toEnrollment(current),
    );
    const [saved, setSaved] = useState(false);

    const set = (subjectId: string, patch: Partial<Enrollment[string]>) => {
        setSaved(false);
        setEnrollment((prev) => ({
            ...prev,
            [subjectId]: {
                enrolled: prev[subjectId]?.enrolled ?? false,
                levelId: prev[subjectId]?.levelId ?? null,
                ...patch,
            },
        }));
    };

    return (
        <div className={styles.subSection}>
            <h3 className={styles.subHeading}>Subjects</h3>
            <p className={styles.hintText}>
                A student without subjects sees English only.
            </p>
            {subjects.map((subject) => {
                const entry = enrollment[subject.id];
                return (
                    <div key={subject.id} className={styles.inlineForm}>
                        <label className={styles.checkLabel}>
                            <input
                                type="checkbox"
                                checked={entry?.enrolled ?? false}
                                onChange={(e) =>
                                    set(subject.id, {
                                        enrolled: e.target.checked,
                                    })
                                }
                            />
                            {subject.nameEn}
                        </label>
                        <select
                            value={entry?.levelId ?? ''}
                            disabled={!entry?.enrolled}
                            onChange={(e) =>
                                set(subject.id, {
                                    levelId: e.target.value || null,
                                })
                            }
                            aria-label={`${subject.nameEn} level`}
                        >
                            <option value="">Level not set</option>
                            {subject.levels.map((level) => (
                                <option key={level.id} value={level.id}>
                                    {level.name}
                                </option>
                            ))}
                        </select>
                    </div>
                );
            })}
            <div>
                <button
                    type="button"
                    className={styles.saveBtn}
                    disabled={save.isPending}
                    onClick={async () => {
                        await save.mutateAsync({
                            studentId,
                            subjects: Object.entries(enrollment)
                                .filter(([, value]) => value.enrolled)
                                .map(([subjectId, value]) => ({
                                    subjectId,
                                    levelId: value.levelId,
                                })),
                        });
                        setSaved(true);
                    }}
                >
                    {save.isPending ? 'Saving…' : 'Save subjects'}
                </button>
                {saved && <span className={styles.hintText}> Saved.</span>}
            </div>
            {save.isError && (
                <p className={styles.error}>{getApiErrorMessage(save.error)}</p>
            )}
        </div>
    );
}
