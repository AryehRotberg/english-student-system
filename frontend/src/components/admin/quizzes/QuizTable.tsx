import { useCallback, useEffect, useRef, useState } from 'react';
import { useDeleteQuiz } from '../../../hooks/mutations';
import type { QuizSummary } from '../../../types/quiz';
import type { Subject } from '../../../types/subject';
import { levelName } from '../../../utils/subjects';
import type { Tone } from '../../hub/tones';
import { toneClass } from '../../hub/tones';
import { CheckIcon, DotsIcon, PenIcon, UserIcon } from '../../hub/icons';
import styles from '../list/AdminList.module.css';

const subjectTone: Record<string, Tone> = {
    english: 'blue',
    math: 'teal',
    cs: 'amber',
};

function RowMenu({ quiz }: { quiz: QuizSummary }) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const deleteQuiz = useDeleteQuiz();
    const close = useCallback(() => setOpen(false), []);

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (event: PointerEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) close();
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') close();
        };
        document.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('pointerdown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open, close]);

    return (
        <div className={styles.menuRoot} ref={rootRef}>
            <button
                type="button"
                className={styles.iconButton}
                aria-label={`More actions for ${quiz.title}`}
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpen((value) => !value)}
            >
                <DotsIcon />
            </button>
            {open && (
                <div className={styles.menu} role="menu">
                    <button
                        type="button"
                        role="menuitem"
                        className={styles.menuDanger}
                        disabled={deleteQuiz.isPending}
                        onClick={async () => {
                            close();
                            if (!confirm(`Delete quiz "${quiz.title}"?`)) {
                                return;
                            }
                            await deleteQuiz.mutateAsync(quiz.id);
                        }}
                    >
                        Delete quiz
                    </button>
                </div>
            )}
        </div>
    );
}

type Props = {
    quizzes: QuizSummary[];
    subjects: Subject[];
    onOpen: (quizId: string) => void;
};

/** The quiz list as a table; each row turns into a card on narrow screens. */
export function QuizTable({ quizzes, subjects, onOpen }: Props) {
    return (
        <div className={styles.tableWrap}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th scope="col">Quiz</th>
                        <th scope="col">Subject</th>
                        <th scope="col">Level</th>
                        <th scope="col">Grading</th>
                        <th scope="col">Time limit</th>
                        <th scope="col">
                            <span className={styles.srOnly}>Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {quizzes.map((quiz) => {
                        const subject = subjects.find(
                            (s) => s.id === quiz.subjectId,
                        );
                        const level = levelName(subject, quiz.levelId);
                        const tone =
                            (subject && subjectTone[subject.slug]) ?? 'violet';

                        return (
                            <tr key={quiz.id}>
                                <td className={styles.primaryCell}>
                                    <button
                                        type="button"
                                        className={styles.rowTitle}
                                        dir="auto"
                                        onClick={() => onOpen(quiz.id)}
                                    >
                                        {quiz.title}
                                    </button>
                                    {quiz.description && (
                                        <span
                                            className={styles.rowDesc}
                                            dir="auto"
                                        >
                                            {quiz.description}
                                        </span>
                                    )}
                                    {quiz.questionsToAnswer && (
                                        <span className={styles.rowNote}>
                                            Answer {quiz.questionsToAnswer} of
                                            the questions
                                        </span>
                                    )}
                                </td>
                                <td data-label="Subject">
                                    {subject ? (
                                        <span
                                            className={`${styles.pill} ${toneClass[tone]}`}
                                        >
                                            <span
                                                aria-hidden="true"
                                                className={styles.pillDot}
                                            />
                                            {subject.nameEn}
                                        </span>
                                    ) : (
                                        <span className={styles.none}>—</span>
                                    )}
                                </td>
                                <td data-label="Level">
                                    {level ? (
                                        <span className={styles.outlinePill}>
                                            {level}
                                        </span>
                                    ) : (
                                        <span className={styles.none}>—</span>
                                    )}
                                </td>
                                <td data-label="Grading">
                                    {quiz.gradingMode === 'teacher' ? (
                                        <span
                                            className={`${styles.pill} ${toneClass.violet}`}
                                        >
                                            <UserIcon size={13} strokeWidth={2} />
                                            Teacher
                                        </span>
                                    ) : (
                                        <span
                                            className={`${styles.pill} ${toneClass.teal}`}
                                        >
                                            <CheckIcon size={13} />
                                            Self-checked
                                        </span>
                                    )}
                                </td>
                                <td data-label="Time limit" className={`${styles.time} ${styles.labelled}`}>
                                    {quiz.timeLimitMinutes
                                        ? `${quiz.timeLimitMinutes} min`
                                        : 'None'}
                                </td>
                                <td className={styles.actionsCell}>
                                    <div className={styles.actions}>
                                        <button
                                            type="button"
                                            className={styles.editButton}
                                            aria-label={`Edit ${quiz.title}`}
                                            onClick={() => onOpen(quiz.id)}
                                        >
                                            <PenIcon size={15} strokeWidth={2} />
                                            Edit
                                        </button>
                                        <RowMenu quiz={quiz} />
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
