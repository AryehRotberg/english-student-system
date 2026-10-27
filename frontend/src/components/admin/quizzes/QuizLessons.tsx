import { useState } from 'react';
import { useSetQuizStudyGuides } from '../../../hooks/mutations';
import { useLessons, useQuizStudyGuides } from '../../../hooks/queries';
import adminStyles from '../../../pages/Admin/AdminPage.module.css';
import { lessonTitle } from '../../../types/lesson';
import type { QuizSummary } from '../../../types/quiz';
import { getApiErrorMessage } from '../../../utils/getApiErrorMessage';
import styles from './QuizEditor.module.css';

// Which lessons students see on the quiz page. Saving replaces the whole set.
export function QuizLessons({ quiz }: { quiz: QuizSummary }) {
    const { data: lessons = [] } = useLessons(quiz.subjectId);
    const { data: linked, isLoading } = useQuizStudyGuides(quiz.id);
    const setLessons = useSetQuizStudyGuides();
    // null until the teacher changes something; until then show what is saved.
    const [selection, setSelection] = useState<Set<string> | null>(null);
    const selected = selection ?? new Set((linked ?? []).map((g) => g.id));
    const linkedCount = linked?.length ?? 0;

    const toggle = (id: string) => {
        const next = new Set(selected);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelection(next);
    };

    return (
        <section className={styles.card}>
            <div className={styles.cardHeader}>
                <div className={styles.titleBlock}>
                    <h3>Lessons</h3>
                    <p className={styles.summary}>
                        {linkedCount} lesson{linkedCount === 1 ? '' : 's'} shown
                        with this quiz
                    </p>
                </div>
            </div>

            {isLoading ? (
                <p className={styles.emptyNote}>Loading…</p>
            ) : lessons.length === 0 ? (
                <p className={styles.emptyNote}>
                    This subject has no lessons yet. Create them in the Lessons
                    tab.
                </p>
            ) : (
                <>
                    <div>
                        {lessons.map((lesson) => (
                            <label key={lesson.id} className={adminStyles.checkLabel}>
                                <input
                                    type="checkbox"
                                    checked={selected.has(lesson.id)}
                                    onChange={() => toggle(lesson.id)}
                                />
                                <span dir="auto">
                                    {lessonTitle(lesson)}
                                    {lesson.title ? ` · ${lesson.topicName}` : ''}
                                </span>
                            </label>
                        ))}
                    </div>
                    <div className={adminStyles.fieldRow}>
                        <button
                            type="button"
                            className={adminStyles.submitButton}
                            disabled={!selection || setLessons.isPending}
                            onClick={async () => {
                                await setLessons.mutateAsync({
                                    quizId: quiz.id,
                                    studyGuideIds: [...selected],
                                });
                                setSelection(null);
                            }}
                        >
                            {setLessons.isPending ? 'Saving…' : 'Save lessons'}
                        </button>
                        {selection && (
                            <button
                                type="button"
                                className={adminStyles.cancelBtn}
                                onClick={() => setSelection(null)}
                            >
                                Undo changes
                            </button>
                        )}
                    </div>
                </>
            )}
            {setLessons.isError && (
                <p className={styles.error}>{getApiErrorMessage(setLessons.error)}</p>
            )}
        </section>
    );
}
