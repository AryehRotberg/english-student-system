import { useState } from 'react';
import { useRemoveLesson, useSaveLesson } from '../../hooks/mutations';
import { useLesson, useLessons, useSubjects } from '../../hooks/queries';
import styles from '../../pages/Admin/AdminPage.module.css';
import { lessonTitle } from '../../types/lesson';
import { getApiErrorMessage } from '../../utils/getApiErrorMessage';
import { LessonForm } from './lessons/LessonForm';
import { LessonMaterialsEditor } from './lessons/LessonMaterialsEditor';

export function LessonsSection() {
    const { data: subjects = [] } = useSubjects();
    const [subjectId, setSubjectId] = useState('');
    const [creating, setCreating] = useState(false);
    const [openLessonId, setOpenLessonId] = useState<string | null>(null);
    const subject = subjects.find((s) => s.id === subjectId) ?? subjects[0];
    const { data: lessons = [] } = useLessons(subject?.id, Boolean(subject));
    const saveLesson = useSaveLesson();
    const removeLesson = useRemoveLesson();

    if (!subject) {
        return (
            <div className={styles.section}>
                <p className={styles.empty}>Loading subjects…</p>
            </div>
        );
    }

    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h3>Lessons</h3>
                <select
                    className={styles.subjectFilter}
                    value={subject.id}
                    onChange={(e) => {
                        setSubjectId(e.target.value);
                        setCreating(false);
                        setOpenLessonId(null);
                    }}
                    aria-label="Subject"
                >
                    {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                            {s.nameEn} · {s.nameHe}
                        </option>
                    ))}
                </select>
                <button
                    type="button"
                    className={styles.addButton}
                    onClick={() => {
                        setCreating((v) => !v);
                        setOpenLessonId(null);
                    }}
                >
                    {creating ? 'Cancel' : '+ Add lesson'}
                </button>
            </div>

            {creating && (
                <LessonForm
                    key={`new-${subject.id}`}
                    subjectId={subject.id}
                    submitLabel="Create lesson"
                    isPending={saveLesson.isPending}
                    error={saveLesson.error ? getApiErrorMessage(saveLesson.error) : null}
                    onCancel={() => setCreating(false)}
                    onSubmit={async (payload) => {
                        const created = await saveLesson.mutateAsync(payload);
                        setCreating(false);
                        // Straight to the editor so files can be added.
                        setOpenLessonId(created.id);
                    }}
                />
            )}

            <ul className={styles.subList}>
                {lessons.map((lesson) => (
                    <li key={lesson.id} className={styles.subItem}>
                        <div className={styles.subItemRow}>
                            <span dir="auto">
                                <strong>{lessonTitle(lesson)}</strong>
                                {lesson.title ? ` · ${lesson.topicName}` : ''}
                                {` · ${lesson.materialCount} file${lesson.materialCount === 1 ? '' : 's'}`}
                            </span>
                            <button
                                type="button"
                                className={styles.editBtn}
                                onClick={() => {
                                    setCreating(false);
                                    setOpenLessonId((current) =>
                                        current === lesson.id ? null : lesson.id,
                                    );
                                }}
                            >
                                {openLessonId === lesson.id ? 'Close' : 'Edit'}
                            </button>
                            <button
                                type="button"
                                className={styles.deleteBtn}
                                disabled={removeLesson.isPending}
                                onClick={() => {
                                    if (
                                        !confirm(
                                            `Delete lesson "${lessonTitle(lesson)}" and its files? Quizzes that show it will stop showing it.`,
                                        )
                                    )
                                        return;
                                    if (openLessonId === lesson.id) setOpenLessonId(null);
                                    removeLesson.mutate(lesson.id);
                                }}
                            >
                                Delete
                            </button>
                        </div>
                        {openLessonId === lesson.id && (
                            <LessonEditor lessonId={lesson.id} subjectId={subject.id} />
                        )}
                    </li>
                ))}
                {lessons.length === 0 && (
                    <li className={styles.empty}>No lessons for this subject yet.</li>
                )}
            </ul>
            {removeLesson.error && (
                <p className={styles.error}>{getApiErrorMessage(removeLesson.error)}</p>
            )}
        </div>
    );
}

function LessonEditor({ lessonId, subjectId }: { lessonId: string; subjectId: string }) {
    const { data: lesson, isLoading } = useLesson(lessonId);
    const saveLesson = useSaveLesson();
    const [saved, setSaved] = useState(false);

    if (isLoading || !lesson) {
        return <p className={styles.hintText}>Loading lesson…</p>;
    }

    return (
        <div>
            <LessonForm
                key={lesson.id}
                subjectId={subjectId}
                lesson={lesson}
                submitLabel={saved ? 'Saved' : 'Save details'}
                isPending={saveLesson.isPending}
                error={saveLesson.error ? getApiErrorMessage(saveLesson.error) : null}
                onSubmit={async (payload) => {
                    await saveLesson.mutateAsync({ id: lesson.id, ...payload });
                    setSaved(true);
                    setTimeout(() => setSaved(false), 2000);
                }}
            />
            <LessonMaterialsEditor lesson={lesson} />
        </div>
    );
}
