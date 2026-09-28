import { useMemo, useState } from 'react';
import { useCreateQuizQuestion, useDeleteQuestion } from '../../../hooks/mutations';
import { useQuestions, useTopics } from '../../../hooks/queries';
import type { QuestionAdminItem } from '../../../types/admin-query-items';
import { getApiErrorMessage } from '../../../utils/getApiErrorMessage';
import { descendantIds, flattenTopicTree } from '../../../utils/topics';
import { QuestionBadges, QuestionPreview } from './QuestionPreview';
import { QUESTION_TYPE_LABEL } from './question-types';
import styles from './QuizEditor.module.css';

type Props = {
    quizId: string;
    subjectId: string;
    /** Questions already in the quiz. */
    excludeIds: Set<string>;
    nextOrderIndex: number;
    defaultPoints: number;
    allowHandwritten: boolean;
    onClose: () => void;
};

/** Search the subject's existing questions and add several to the quiz at once. */
export function QuestionBankPicker({
    quizId,
    subjectId,
    excludeIds,
    nextOrderIndex,
    defaultPoints,
    allowHandwritten,
    onClose,
}: Props) {
    const { data: questions = [], isLoading } = useQuestions(subjectId);
    const { data: topics = [] } = useTopics(subjectId);
    const createLink = useCreateQuizQuestion();
    const deleteQuestion = useDeleteQuestion();

    const [search, setSearch] = useState('');
    const [topicId, setTopicId] = useState('');
    const [type, setType] = useState('');
    const [selected, setSelected] = useState<string[]>([]);
    const [points, setPoints] = useState(String(defaultPoints));
    const [adding, setAdding] = useState(false);

    const topicRows = useMemo(() => flattenTopicTree(topics), [topics]);

    const available = useMemo(() => {
        // A topic filter includes its sub-topics (Calculus > Derivatives).
        const topicFilter = topicId ? descendantIds(topics, topicId) : null;
        const term = search.trim().toLowerCase();

        return questions.filter(
            (q) =>
                !excludeIds.has(q.id) &&
                (!type || q.questionType === type) &&
                (!topicFilter || q.topicIds.some((id) => topicFilter.has(id))) &&
                (!term ||
                    q.question.toLowerCase().includes(term) ||
                    (q.source ?? '').toLowerCase().includes(term)),
        );
    }, [questions, topics, excludeIds, type, topicId, search]);

    const isAllowed = (q: QuestionAdminItem) =>
        allowHandwritten || q.questionType !== 'handwritten';

    const toggle = (id: string) =>
        setSelected((current) =>
            current.includes(id)
                ? current.filter((x) => x !== id)
                : [...current, id],
        );

    const addSelected = async () => {
        const maxPoints = Number(points);
        if (!selected.length || !Number.isFinite(maxPoints) || maxPoints < 0) {
            return;
        }

        setAdding(true);
        try {
            // One at a time, in the order they were picked.
            for (const [offset, questionId] of selected.entries()) {
                await createLink.mutateAsync({
                    quizId,
                    questionId,
                    maxPoints,
                    orderIndex: nextOrderIndex + offset,
                });
            }
            onClose();
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className={styles.panel}>
            <div className={styles.panelHeader}>
                <h4>Add from the question bank</h4>
                <button
                    type="button"
                    className={styles.textButton}
                    onClick={onClose}
                >
                    Close
                </button>
            </div>

            <div className={styles.bankFilters}>
                <input
                    type="search"
                    dir="auto"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search question text or source…"
                    aria-label="Search questions"
                />
                {topicRows.length > 0 && (
                    <select
                        value={topicId}
                        onChange={(e) => setTopicId(e.target.value)}
                        aria-label="Filter by topic"
                    >
                        <option value="">All topics</option>
                        {topicRows.map(({ topic, depth }) => (
                            <option key={topic.id} value={topic.id}>
                                {`${'  '.repeat(depth)}${topic.name}`}
                            </option>
                        ))}
                    </select>
                )}
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    aria-label="Filter by type"
                >
                    <option value="">All types</option>
                    {Object.entries(QUESTION_TYPE_LABEL).map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </select>
            </div>

            <ul className={styles.bankList}>
                {available.map((q) => {
                    const allowed = isAllowed(q);
                    const checked = selected.includes(q.id);

                    return (
                        <li
                            key={q.id}
                            className={`${styles.bankItem} ${checked ? styles.bankItemSelected : ''} ${allowed ? '' : styles.bankItemDisabled}`}
                        >
                            <label className={styles.bankSelect}>
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    disabled={!allowed}
                                    onChange={() => toggle(q.id)}
                                />
                                <div className={styles.bankContent}>
                                    <QuestionPreview
                                        content={q.question}
                                        format={q.contentFormat}
                                    />
                                    <QuestionBadges question={q} />
                                    {!allowed && (
                                        <span className={styles.note}>
                                            Handwritten questions need a
                                            teacher-graded quiz.
                                        </span>
                                    )}
                                </div>
                            </label>
                            <button
                                type="button"
                                className={styles.textButton}
                                disabled={deleteQuestion.isPending}
                                onClick={() => {
                                    if (
                                        confirm(
                                            'Delete this question permanently? It will be removed from every quiz that uses it.',
                                        )
                                    ) {
                                        setSelected((current) =>
                                            current.filter((x) => x !== q.id),
                                        );
                                        deleteQuestion.mutate(q.id);
                                    }
                                }}
                                title="Delete from the question bank"
                            >
                                Delete
                            </button>
                        </li>
                    );
                })}
                {!isLoading && available.length === 0 && (
                    <li className={styles.emptyNote}>
                        {questions.length === 0
                            ? 'This subject has no questions yet. Write a new one instead.'
                            : questions.every((q) => excludeIds.has(q.id))
                              ? 'Every question of this subject is already in the quiz.'
                              : 'No questions match these filters.'}
                    </li>
                )}
            </ul>

            <div className={styles.bankFooter}>
                <label className={styles.pointsField}>
                    <input
                        type="number"
                        min={0}
                        step={0.5}
                        value={points}
                        onChange={(e) => setPoints(e.target.value)}
                        aria-label="Points for each added question"
                    />
                    <span>pts each</span>
                </label>
                <button
                    type="button"
                    className={styles.primaryButton}
                    disabled={!selected.length || adding}
                    onClick={() => void addSelected()}
                >
                    {adding
                        ? 'Adding…'
                        : selected.length
                          ? `Add ${selected.length} question${selected.length === 1 ? '' : 's'}`
                          : 'Select questions to add'}
                </button>
            </div>
            {(createLink.error ?? deleteQuestion.error) && (
                <p className={styles.error}>
                    {getApiErrorMessage(createLink.error ?? deleteQuestion.error)}
                </p>
            )}
        </div>
    );
}
