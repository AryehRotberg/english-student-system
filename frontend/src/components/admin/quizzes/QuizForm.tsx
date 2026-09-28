import { useState } from 'react';
import { useCreateQuiz, useUpdateQuiz } from '../../../hooks/mutations';
import styles from '../../../pages/Admin/AdminPage.module.css';
import type { SaveQuizPayload } from '../../../services/quizzes.service';
import type { GradingMode, QuizSummary } from '../../../types/quiz';
import { ENGLISH_SUBJECT_ID } from '../../../types/subject';
import { getApiErrorMessage } from '../../../utils/getApiErrorMessage';
import { SubjectLevelFields } from '../SubjectLevelFields';

type Props = {
    quiz?: QuizSummary;
    defaultSubjectId?: string;
    /** Once a quiz has questions its subject must stay the questions' subject. */
    lockSubject?: boolean;
    onSaved: (quiz: QuizSummary) => void;
    onCancel?: () => void;
};

function toFormState(
    quiz: QuizSummary | undefined,
    defaultSubjectId: string,
): SaveQuizPayload {
    const subjectId = quiz?.subjectId ?? defaultSubjectId;

    return {
        title: quiz?.title ?? '',
        description: quiz?.description ?? '',
        // Math and CS answers are handwritten and graded by the teacher.
        gradingMode:
            quiz?.gradingMode ??
            (subjectId === ENGLISH_SUBJECT_ID ? 'auto' : 'teacher'),
        subjectId,
        levelId: quiz?.levelId ?? null,
        questionsToAnswer: quiz?.questionsToAnswer ?? null,
        timeLimitMinutes: quiz?.timeLimitMinutes ?? null,
    };
}

function parseOptionalInt(value: string): number | null {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

/** Quiz settings: title, subject and level, grading, "answer N of M", time limit. */
export function QuizForm({
    quiz,
    defaultSubjectId = ENGLISH_SUBJECT_ID,
    lockSubject = false,
    onSaved,
    onCancel,
}: Props) {
    const createQuiz = useCreateQuiz();
    const updateQuiz = useUpdateQuiz();
    const [form, setForm] = useState<SaveQuizPayload>(() =>
        toFormState(quiz, defaultSubjectId),
    );
    const mutation = quiz ? updateQuiz : createQuiz;
    const isEnglish = form.subjectId === ENGLISH_SUBJECT_ID;

    const set = (patch: Partial<SaveQuizPayload>) =>
        setForm((current) => ({ ...current, ...patch }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) return;

        const payload: SaveQuizPayload = {
            ...form,
            title: form.title.trim(),
            description: form.description?.trim() || undefined,
        };

        const saved = quiz
            ? await updateQuiz.mutateAsync({ id: quiz.id, ...payload })
            : await createQuiz.mutateAsync(payload);
        onSaved(saved);
    };

    return (
        <form className={styles.form} onSubmit={(e) => void handleSubmit(e)}>
            <div className={styles.field}>
                <label>Title *</label>
                <input
                    dir="auto"
                    value={form.title}
                    onChange={(e) => set({ title: e.target.value })}
                    placeholder="Quiz title"
                    required
                />
            </div>
            <div className={styles.field}>
                <label>Description / instructions</label>
                <textarea
                    dir="auto"
                    rows={2}
                    value={form.description ?? ''}
                    onChange={(e) => set({ description: e.target.value })}
                    placeholder="Optional, shown to students before they start"
                />
            </div>
            <SubjectLevelFields
                subjectId={form.subjectId}
                levelId={form.levelId}
                lockSubject={lockSubject}
                onChange={(value) =>
                    set({
                        ...value,
                        gradingMode:
                            value.subjectId === ENGLISH_SUBJECT_ID
                                ? form.gradingMode
                                : 'teacher',
                    })
                }
            />
            {lockSubject && (
                <p className={styles.hintText}>
                    The subject can't change while the quiz has questions.
                </p>
            )}
            <div className={styles.field}>
                <label>Grading</label>
                <select
                    value={form.gradingMode}
                    onChange={(e) =>
                        set({ gradingMode: e.target.value as GradingMode })
                    }
                >
                    <option value="auto">
                        Automatic - students see their score right away
                    </option>
                    <option value="teacher">
                        Teacher graded - I review answers after submission
                    </option>
                </select>
            </div>
            <div className={styles.fieldRow}>
                <div className={styles.field}>
                    <label>Answer N of the questions</label>
                    <input
                        type="number"
                        min={1}
                        value={form.questionsToAnswer ?? ''}
                        onChange={(e) =>
                            set({
                                questionsToAnswer: parseOptionalInt(
                                    e.target.value,
                                ),
                            })
                        }
                        placeholder={isEnglish ? 'All' : 'e.g. 5 (Bagrut)'}
                    />
                </div>
                <div className={styles.field}>
                    <label>Time limit (minutes)</label>
                    <input
                        type="number"
                        min={1}
                        value={form.timeLimitMinutes ?? ''}
                        onChange={(e) =>
                            set({
                                timeLimitMinutes: parseOptionalInt(
                                    e.target.value,
                                ),
                            })
                        }
                        placeholder="No limit"
                    />
                </div>
            </div>
            <div className={styles.formActions}>
                <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={mutation.isPending}
                >
                    {mutation.isPending
                        ? 'Saving…'
                        : quiz
                          ? 'Save settings'
                          : 'Create quiz & add questions'}
                </button>
                {onCancel && (
                    <button
                        type="button"
                        className={styles.cancelBtn}
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                )}
            </div>
            {mutation.isError && (
                <p className={styles.error}>
                    {getApiErrorMessage(mutation.error)}
                </p>
            )}
        </form>
    );
}
