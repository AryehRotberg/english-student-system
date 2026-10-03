import { useState } from 'react';
import {
    useCreateQuizQuestion,
    useDeleteQuiz,
    useUpdateQuizQuestion,
} from '../../../hooks/mutations';
import {
    useQuestions,
    useQuiz,
    useRawQuizQuestions,
    useSubjects,
} from '../../../hooks/queries';
import type { QuizSummary } from '../../../types/quiz';
import type { RawQuizQuestionAdminItem } from '../../../types/admin-query-items';
import { getApiErrorMessage } from '../../../utils/getApiErrorMessage';
import { levelName } from '../../../utils/subjects';
import { QuestionForm } from '../QuestionForm';
import { QuestionBankPicker } from './QuestionBankPicker';
import { QuizForm } from './QuizForm';
import { QuizQuestionItem } from './QuizQuestionItem';
import styles from './QuizEditor.module.css';

type Props = {
    quizId: string;
    /** Opens the settings form right away (a quiz that was just created). */
    justCreated?: boolean;
    onBack: () => void;
};

type AddMode = 'none' | 'new' | 'bank';

/** Points for the next question: like the last one, or 100 split over "answer N". */
function suggestedPoints(
    quiz: QuizSummary,
    links: RawQuizQuestionAdminItem[],
): number {
    const last = links.at(-1);
    if (last) return Number(last.maxPoints);
    if (quiz.questionsToAnswer) {
        return Math.round((100 / quiz.questionsToAnswer) * 100) / 100;
    }
    return 10;
}

function formatPoints(value: number) {
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

export function QuizEditor({ quizId, justCreated = false, onBack }: Props) {
    const { data: quiz, isLoading, error } = useQuiz(quizId);
    const { data: subjects = [] } = useSubjects();
    const { data: links = [] } = useRawQuizQuestions(quizId);
    const { data: bank = [] } = useQuestions(quiz?.subjectId);
    const createLink = useCreateQuizQuestion();
    const updateLink = useUpdateQuizQuestion();
    const deleteQuiz = useDeleteQuiz();

    const [editingSettings, setEditingSettings] = useState(false);
    const [addMode, setAddMode] = useState<AddMode>(
        justCreated ? 'new' : 'none',
    );
    const [expandedQuestionId, setExpandedQuestionId] = useState<
        string | null
    >(null);
    const [reordering, setReordering] = useState(false);

    if (isLoading) {
        return <p className={styles.emptyNote}>Loading quiz…</p>;
    }

    if (!quiz) {
        return (
            <div className={styles.editor}>
                <button type="button" className={styles.backLink} onClick={onBack}>
                    ← All quizzes
                </button>
                <p className={styles.error}>
                    {error ? getApiErrorMessage(error) : 'Quiz not found.'}
                </p>
            </div>
        );
    }

    const subject = subjects.find((s) => s.id === quiz.subjectId);
    const level = levelName(subject, quiz.levelId);
    const questionsById = new Map(bank.map((q) => [q.id, q]));
    const linkedIds = new Set(links.map((l) => l.questionId));
    const allowHandwritten = quiz.gradingMode === 'teacher';
    const totalPoints = links.reduce((sum, l) => sum + Number(l.maxPoints), 0);
    const nextOrderIndex =
        links.reduce((max, l) => Math.max(max, l.orderIndex ?? 0), -1) + 1;
    const pointsForNext = suggestedPoints(quiz, links);
    const answerCount = quiz.questionsToAnswer;
    const tooFewQuestions = answerCount !== null && links.length < answerCount;

    // Rewrites every position so the order is explicit even for questions
    // added before ordering existed (they all share order 0).
    const move = async (index: number, delta: -1 | 1) => {
        const target = index + delta;
        if (target < 0 || target >= links.length) return;

        const reordered = [...links];
        [reordered[index], reordered[target]] = [
            reordered[target],
            reordered[index],
        ];

        setReordering(true);
        try {
            await Promise.all(
                reordered.map((link, position) =>
                    link.orderIndex === position
                        ? Promise.resolve()
                        : updateLink.mutateAsync({
                              id: link.id,
                              quizId: link.quizId,
                              orderIndex: position,
                          }),
                ),
            );
        } finally {
            setReordering(false);
        }
    };

    return (
        <div className={styles.editor}>
            <button type="button" className={styles.backLink} onClick={onBack}>
                ← All quizzes
            </button>

            <section className={styles.card}>
                <div className={styles.cardHeader}>
                    <div className={styles.titleBlock}>
                        <h3 dir="auto">{quiz.title}</h3>
                        <div className={styles.badges}>
                            {subject && (
                                <span className={styles.badge}>
                                    {subject.nameEn}
                                    {level ? ` · ${level}` : ''}
                                </span>
                            )}
                            <span className={styles.badge}>
                                {quiz.gradingMode === 'teacher'
                                    ? 'Teacher graded'
                                    : 'Automatic grading'}
                            </span>
                            {answerCount && (
                                <span className={styles.badge}>
                                    Answer {answerCount} of {links.length}
                                </span>
                            )}
                            {quiz.timeLimitMinutes && (
                                <span className={styles.badge}>
                                    {quiz.timeLimitMinutes} min
                                </span>
                            )}
                        </div>
                    </div>
                    <div className={styles.headerActions}>
                        <button
                            type="button"
                            className={styles.textButton}
                            onClick={() => setEditingSettings((v) => !v)}
                        >
                            {editingSettings ? 'Close settings' : 'Edit settings'}
                        </button>
                        <button
                            type="button"
                            className={styles.removeButton}
                            disabled={deleteQuiz.isPending}
                            onClick={async () => {
                                if (!confirm(`Delete quiz "${quiz.title}"?`)) {
                                    return;
                                }
                                await deleteQuiz.mutateAsync(quiz.id);
                                onBack();
                            }}
                        >
                            Delete quiz
                        </button>
                    </div>
                </div>
                {quiz.description && !editingSettings && (
                    <p className={styles.description} dir="auto">
                        {quiz.description}
                    </p>
                )}
                {editingSettings && (
                    <QuizForm
                        quiz={quiz}
                        lockSubject={links.length > 0}
                        onSaved={() => setEditingSettings(false)}
                        onCancel={() => setEditingSettings(false)}
                    />
                )}
            </section>

            <section className={styles.card}>
                <div className={styles.cardHeader}>
                    <div className={styles.titleBlock}>
                        <h3>Questions</h3>
                        <p className={styles.summary}>
                            {links.length} question{links.length === 1 ? '' : 's'}
                            {' · '}
                            {formatPoints(totalPoints)} points in total
                            {answerCount
                                ? ` · students answer ${answerCount}`
                                : ''}
                        </p>
                    </div>
                </div>

                {tooFewQuestions && (
                    <p className={styles.warning}>
                        Students must answer {answerCount} questions, but the
                        quiz has only {links.length}.
                    </p>
                )}

                {links.length > 0 && (
                    <ol className={styles.questionList}>
                        {links.map((link, index) => (
                            <QuizQuestionItem
                                key={link.id}
                                link={link}
                                question={questionsById.get(link.questionId)}
                                position={index}
                                count={links.length}
                                expanded={expandedQuestionId === link.questionId}
                                allowHandwritten={allowHandwritten}
                                reordering={reordering}
                                onToggle={() =>
                                    setExpandedQuestionId((current) =>
                                        current === link.questionId
                                            ? null
                                            : link.questionId,
                                    )
                                }
                                onMove={(delta) => void move(index, delta)}
                            />
                        ))}
                    </ol>
                )}
                {links.length === 0 && addMode === 'none' && (
                    <p className={styles.emptyNote}>
                        No questions yet. Write a new question or pick existing
                        ones from the question bank.
                    </p>
                )}
                {updateLink.isError && (
                    <p className={styles.error}>
                        {getApiErrorMessage(updateLink.error)}
                    </p>
                )}

                {addMode === 'new' && (
                    <div className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <h4>New question {links.length + 1}</h4>
                        </div>
                        <QuestionForm
                            defaultSubjectId={quiz.subjectId}
                            defaultLevelId={quiz.levelId}
                            lockSubject
                            allowHandwritten={allowHandwritten}
                            submitLabel="Add question to quiz"
                            onCancel={() => setAddMode('none')}
                            onDone={async (created) => {
                                if (!created) return;
                                await createLink.mutateAsync({
                                    quizId: quiz.id,
                                    questionId: created.id,
                                    maxPoints: pointsForNext,
                                    orderIndex: nextOrderIndex,
                                });
                                setAddMode('none');
                                // Answer options, the answer key and the
                                // diagram are added on the saved question.
                                setExpandedQuestionId(created.id);
                            }}
                        />
                        {createLink.isError && (
                            <p className={styles.error}>
                                {getApiErrorMessage(createLink.error)}
                            </p>
                        )}
                    </div>
                )}

                {addMode === 'bank' && (
                    <QuestionBankPicker
                        quizId={quiz.id}
                        subjectId={quiz.subjectId}
                        excludeIds={linkedIds}
                        nextOrderIndex={nextOrderIndex}
                        defaultPoints={pointsForNext}
                        allowHandwritten={allowHandwritten}
                        onClose={() => setAddMode('none')}
                    />
                )}

                {addMode === 'none' && (
                    <div className={styles.addBar}>
                        <button
                            type="button"
                            className={styles.addChoice}
                            onClick={() => {
                                setExpandedQuestionId(null);
                                setAddMode('new');
                            }}
                        >
                            <strong>+ Write a new question</strong>
                            <span>Text with formulas, a diagram, any type</span>
                        </button>
                        <button
                            type="button"
                            className={styles.addChoice}
                            onClick={() => setAddMode('bank')}
                        >
                            <strong>+ Add from the question bank</strong>
                            <span>Search and pick questions you wrote before</span>
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}
