import { useState } from 'react';
import {
    useAllStudents,
    useAssignmentItems,
    useAssignments,
    useQuizQuestions,
    useQuizzes,
    useReadings,
    useStudentAnswersByAttempt,
    useStudentQuizAttempts,
    useVocabularyTopics,
    useWritingTasks,
} from '../../hooks/queries';
import {
    useCreateAssignment,
    useCreateAssignmentItem,
    useDeleteAssignment,
    useDeleteAssignmentItem,
    useRemoveStudent,
    useUpdateAssignment,
    useUpdateAssignmentItem,
} from '../../hooks/mutations';
import styles from '../../pages/Admin/AdminPage.module.css';
import type { AssignmentItemContentType } from '../../services/assignments.service';
import type { AssignmentApiItem } from '../../types/api-items/assignment';
import type { AssignmentItemApiItem } from '../../types/api-items/assignment-item';
import { QuizResultsDisplay } from '../quiz/QuizResultsDisplay';

type Props = {
    studentId: string;
    onBack: () => void;
    onDeleted: () => void;
};

function getInitials(name: string): string {
    return name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');
}

const CONTENT_TYPES: { value: AssignmentItemContentType; label: string }[] = [
    { value: 'quiz', label: 'Quiz' },
    { value: 'reading', label: 'Reading' },
    { value: 'writing', label: 'Writing task' },
    { value: 'vocabulary', label: 'Vocabulary topic' },
];

function BackChevron() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="15 18 9 12 15 6" />
        </svg>
    );
}

export function StudentDetailPanel({ studentId, onBack, onDeleted }: Props) {
    const { data: students = [] } = useAllStudents();
    const student = students.find((s) => s.id === studentId);
    const removeStudent = useRemoveStudent();
    const [confirmingDelete, setConfirmingDelete] = useState(false);

    const handleDelete = async () => {
        await removeStudent.mutateAsync(studentId);
        onDeleted();
    };

    return (
        <div className={styles.section}>
            <button
                type="button"
                className={styles.backNavBtn}
                onClick={onBack}
            >
                <BackChevron />
                Back to students
            </button>

            {!student ? (
                <p className={styles.empty}>Student not found.</p>
            ) : (
                <>
                    <div className={styles.studentDetailHeader}>
                        <div className={styles.studentAvatar}>
                            {getInitials(student.name || '?')}
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3 className={styles.studentDetailName}>
                                {student.name}
                            </h3>
                            <p className={styles.meta}>{student.email}</p>
                        </div>
                        {confirmingDelete ? (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                }}
                            >
                                <span className={styles.meta}>
                                    Delete student and all their data?
                                </span>
                                <button
                                    type="button"
                                    className={styles.deleteBtn}
                                    disabled={removeStudent.isPending}
                                    onClick={() => void handleDelete()}
                                >
                                    {removeStudent.isPending
                                        ? 'Deleting…'
                                        : 'Confirm'}
                                </button>
                                <button
                                    type="button"
                                    className={styles.cancelBtn}
                                    onClick={() => setConfirmingDelete(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                className={styles.deleteBtn}
                                onClick={() => setConfirmingDelete(true)}
                            >
                                Delete Student
                            </button>
                        )}
                    </div>

                    <StudentProgress studentId={studentId} />
                    <StudentAssignments studentId={studentId} />
                </>
            )}
        </div>
    );
}

function StudentProgress({ studentId }: { studentId: string }) {
    const { data: attempts = [], isLoading: attemptsLoading } =
        useStudentQuizAttempts(studentId);
    const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(
        null,
    );

    const { data: quizzes = [] } = useQuizzes();
    const quizTitleMap = new Map(quizzes.map((q) => [q.id, q.title]));

    const selectedAttempt = attempts.find((a) => a.id === selectedAttemptId);
    const selectedAttemptQuizId = selectedAttempt?.quizId;

    const { data: questions = [] } = useQuizQuestions(selectedAttemptQuizId);
    const { data: answers = [] } = useStudentAnswersByAttempt(
        selectedAttemptId || undefined,
    );

    if (attemptsLoading) {
        return <p>Loading progress...</p>;
    }

    if (selectedAttempt && selectedAttemptQuizId && questions.length > 0) {
        const quizTitle = quizTitleMap.get(selectedAttemptQuizId) ?? 'Quiz';
        const totalPossible = questions.reduce(
            (sum, q) => sum + Number(q.maxPoints),
            0,
        );
        const finalScore = Number(selectedAttempt.points ?? 0);
        const gradePercent =
            totalPossible > 0
                ? Math.round((finalScore / totalPossible) * 100)
                : 0;

        return (
            <div>
                <button
                    type="button"
                    className={styles.backNavBtn}
                    onClick={() => setSelectedAttemptId(null)}
                >
                    <BackChevron />
                    Back to attempts
                </button>

                <QuizResultsDisplay
                    questions={questions}
                    answers={answers}
                    title={quizTitle}
                    finalScore={finalScore}
                    totalPossible={totalPossible}
                    gradePercent={gradePercent}
                />
            </div>
        );
    }

    return (
        <div>
            <h3 className={styles.subHeading}>Progress</h3>
            {attempts.length === 0 ? (
                <p className={styles.empty}>No completed attempts yet.</p>
            ) : (
                <div className={styles.attemptGrid}>
                    {attempts.map((attempt) => {
                        const completedAt = attempt.completedAt
                            ? new Date(attempt.completedAt)
                            : null;
                        const score = Number(attempt.points ?? 0);
                        const quizTitle =
                            quizTitleMap.get(attempt.quizId) ?? 'Quiz';

                        return (
                            <div
                                key={attempt.id}
                                className={styles.attemptCard}
                            >
                                <div className={styles.attemptCardIcon}>
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <rect
                                            x="9"
                                            y="2"
                                            width="6"
                                            height="4"
                                            rx="1"
                                        />
                                        <path d="M9 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-2" />
                                        <line x1="9" y1="12" x2="15" y2="12" />
                                        <line x1="9" y1="16" x2="13" y2="16" />
                                    </svg>
                                </div>
                                <div className={styles.attemptCardBody}>
                                    <p className={styles.attemptCardDate}>
                                        {quizTitle}
                                    </p>
                                    <span
                                        className={`${styles.attemptStatusBadge} ${completedAt ? styles.attemptStatusCompleted : styles.attemptStatusInProgress}`}
                                    >
                                        {completedAt
                                            ? `Completed at ${completedAt.toLocaleString()}`
                                            : 'In progress'}
                                    </span>
                                    <p className={styles.attemptCardScore}>
                                        Score:{' '}
                                        <strong>{score.toFixed(2)}</strong>
                                    </p>
                                </div>
                                <button
                                    className={styles.studentCardBtn}
                                    onClick={() =>
                                        setSelectedAttemptId(attempt.id)
                                    }
                                    type="button"
                                >
                                    View results
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

type ContentOptionMap = Record<
    AssignmentItemContentType,
    { id: string; label: string }[]
>;

function useContentOptions(): ContentOptionMap {
    const { data: quizzes = [] } = useQuizzes();
    const { data: readings = [] } = useReadings();
    const { data: writingTasks = [] } = useWritingTasks();
    const { data: vocabularyTopics = [] } = useVocabularyTopics();

    return {
        quiz: quizzes.map((q) => ({ id: q.id, label: q.title })),
        reading: readings.map((r) => ({ id: r.id, label: r.title })),
        writing: writingTasks.map((w) => ({ id: w.id, label: w.title })),
        vocabulary: vocabularyTopics.map((v) => ({
            id: v.id,
            label: v.topic,
        })),
    };
}

type DraftItem = { contentType: AssignmentItemContentType; contentId: string };

const CONTENT_ICON_CLASS: Record<AssignmentItemContentType, string> = {
    quiz: 'assignmentItemIconQuiz',
    reading: 'assignmentItemIconReading',
    writing: 'assignmentItemIconWriting',
    vocabulary: 'assignmentItemIconVocabulary',
};

const CONTENT_ICON_LETTER: Record<AssignmentItemContentType, string> = {
    quiz: 'Q',
    reading: 'R',
    writing: 'W',
    vocabulary: 'V',
};

function ItemPicker({
    options,
    draft,
    onChange,
    onRemove,
}: {
    options: ContentOptionMap;
    draft: DraftItem;
    onChange: (draft: DraftItem) => void;
    onRemove: () => void;
}) {
    const choices = options[draft.contentType];
    return (
        <div className={styles.addItemRow}>
            <select
                className={styles.addItemSelect}
                value={draft.contentType}
                onChange={(e) =>
                    onChange({
                        contentType: e.target
                            .value as AssignmentItemContentType,
                        contentId: '',
                    })
                }
            >
                {CONTENT_TYPES.map((ct) => (
                    <option key={ct.value} value={ct.value}>
                        {ct.label}
                    </option>
                ))}
            </select>
            <select
                className={styles.addItemSelect}
                value={draft.contentId}
                onChange={(e) =>
                    onChange({ ...draft, contentId: e.target.value })
                }
            >
                <option value="">Select…</option>
                {choices.map((choice) => (
                    <option key={choice.id} value={choice.id}>
                        {choice.label}
                    </option>
                ))}
            </select>
            <button
                type="button"
                className={styles.deleteBtn}
                onClick={onRemove}
            >
                Remove
            </button>
        </div>
    );
}

function AssignmentForm({
    contentOptions,
    isPending,
    onCancel,
    onSubmit,
}: {
    contentOptions: ContentOptionMap;
    isPending: boolean;
    onCancel: () => void;
    onSubmit: (values: {
        title: string;
        description: string;
        dueDate: string;
        items: DraftItem[];
    }) => void;
}) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [items, setItems] = useState<DraftItem[]>([]);

    const addItem = () =>
        setItems((prev) => [...prev, { contentType: 'quiz', contentId: '' }]);

    const handleSubmit = () => {
        if (!title.trim() || !dueDate) return;
        onSubmit({
            title,
            description,
            dueDate,
            items: items.filter((item) => item.contentId),
        });
    };

    return (
        <div className={styles.form}>
            <div className={styles.fieldRow}>
                <div className={styles.field}>
                    <label>Title</label>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div className={styles.field}>
                    <label>Due date</label>
                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                    />
                </div>
            </div>
            <div className={styles.field}>
                <label>Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                />
            </div>

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                }}
            >
                <p className={styles.subHeading}>Items</p>
                {items.map((item, index) => (
                    <ItemPicker
                        key={index}
                        options={contentOptions}
                        draft={item}
                        onChange={(draft) =>
                            setItems((prev) =>
                                prev.map((it, i) => (i === index ? draft : it)),
                            )
                        }
                        onRemove={() =>
                            setItems((prev) =>
                                prev.filter((_, i) => i !== index),
                            )
                        }
                    />
                ))}
                <button
                    type="button"
                    className={styles.ghostAddBtn}
                    onClick={addItem}
                >
                    + Add item
                </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                    type="button"
                    className={styles.submitButton}
                    disabled={isPending || !title.trim() || !dueDate}
                    onClick={handleSubmit}
                >
                    {isPending ? 'Creating…' : 'Create Assignment'}
                </button>
                <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={onCancel}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}

function AssignmentEditForm({
    assignment,
    isPending,
    onCancel,
    onSave,
}: {
    assignment: AssignmentApiItem;
    isPending: boolean;
    onCancel: () => void;
    onSave: (values: {
        title: string;
        description: string;
        dueDate: string;
        isCompleted: boolean;
    }) => void;
}) {
    const [title, setTitle] = useState(assignment.title);
    const [description, setDescription] = useState(assignment.description);
    const [dueDate, setDueDate] = useState(
        assignment.dueDate ? assignment.dueDate.slice(0, 10) : '',
    );
    const [isCompleted, setIsCompleted] = useState(assignment.isCompleted);

    return (
        <div className={styles.assignmentEditForm}>
            <div className={styles.fieldRow}>
                <div className={styles.field}>
                    <label>Title</label>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div className={styles.field}>
                    <label>Due date</label>
                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                    />
                </div>
            </div>
            <div className={styles.field}>
                <label>Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                />
            </div>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                }}
            >
                <label className={styles.checkLabel}>
                    <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={(e) => setIsCompleted(e.target.checked)}
                    />
                    Completed
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        type="button"
                        className={styles.saveBtn}
                        disabled={isPending}
                        onClick={() =>
                            onSave({ title, description, dueDate, isCompleted })
                        }
                    >
                        Save
                    </button>
                    <button
                        type="button"
                        className={styles.cancelBtn}
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

function AssignmentRow({
    studentId,
    assignment,
    items,
    contentOptions,
}: {
    studentId: string;
    assignment: AssignmentApiItem;
    items: AssignmentItemApiItem[];
    contentOptions: ContentOptionMap;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [newItem, setNewItem] = useState<DraftItem>({
        contentType: 'quiz',
        contentId: '',
    });

    const updateAssignment = useUpdateAssignment();
    const deleteAssignment = useDeleteAssignment();
    const createItem = useCreateAssignmentItem();
    const updateItem = useUpdateAssignmentItem();
    const deleteItem = useDeleteAssignmentItem();

    if (isEditing) {
        return (
            <li className={styles.assignmentCard}>
                <AssignmentEditForm
                    assignment={assignment}
                    isPending={updateAssignment.isPending}
                    onCancel={() => setIsEditing(false)}
                    onSave={async (values) => {
                        await updateAssignment.mutateAsync({
                            id: assignment.id,
                            userId: studentId,
                            ...values,
                        });
                        setIsEditing(false);
                    }}
                />
            </li>
        );
    }

    return (
        <li className={styles.assignmentCard}>
            <div className={styles.assignmentTop}>
                <div className={styles.assignmentTitleGroup}>
                    <div className={styles.assignmentTitleRow}>
                        <h4 className={styles.assignmentTitle}>
                            {assignment.title}
                        </h4>
                        {assignment.isCompleted && (
                            <span
                                className={`${styles.attemptStatusBadge} ${styles.attemptStatusCompleted}`}
                            >
                                Completed
                            </span>
                        )}
                    </div>
                    {assignment.dueDate && (
                        <span className={styles.assignmentDue}>
                            Due{' '}
                            {new Date(
                                assignment.dueDate,
                            ).toLocaleDateString()}
                        </span>
                    )}
                    {assignment.description && (
                        <p className={styles.assignmentDescription}>
                            {assignment.description}
                        </p>
                    )}
                </div>
                <div className={styles.assignmentActions}>
                    <button
                        type="button"
                        className={styles.editBtn}
                        onClick={() => setIsEditing(true)}
                    >
                        Edit
                    </button>
                    <button
                        type="button"
                        className={styles.deleteBtn}
                        onClick={() =>
                            void deleteAssignment.mutate({
                                id: assignment.id,
                                userId: studentId,
                            })
                        }
                    >
                        Delete
                    </button>
                </div>
            </div>

            <hr className={styles.assignmentDivider} />

            <div className={styles.assignmentItemsHeader}>
                <span className={styles.assignmentItemsLabel}>
                    Items{items.length > 0 ? ` (${items.length})` : ''}
                </span>
            </div>

            {items.length === 0 ? (
                <p className={styles.empty}>No items yet.</p>
            ) : (
                <ul className={styles.assignmentItemList}>
                    {items.map((item) => (
                        <li key={item.id} className={styles.assignmentItemRow}>
                            <div
                                className={`${styles.assignmentItemIcon} ${styles[CONTENT_ICON_CLASS[item.contentType]]}`}
                            >
                                {CONTENT_ICON_LETTER[item.contentType]}
                            </div>
                            <div className={styles.assignmentItemBody}>
                                <span className={styles.assignmentItemTitle}>
                                    {item.title ?? item.contentId}
                                </span>
                                <span className={styles.assignmentItemType}>
                                    {item.contentType}
                                </span>
                            </div>
                            <div className={styles.assignmentItemActions}>
                                <button
                                    type="button"
                                    className={`${styles.toggleChip} ${item.isCompleted ? styles.toggleChipActive : ''}`}
                                    onClick={() =>
                                        void updateItem.mutate({
                                            id: item.id,
                                            userId: studentId,
                                            isCompleted: !item.isCompleted,
                                        })
                                    }
                                >
                                    {item.isCompleted
                                        ? 'Completed'
                                        : 'Mark complete'}
                                </button>
                                <button
                                    type="button"
                                    className={styles.deleteBtn}
                                    onClick={() =>
                                        void deleteItem.mutate({
                                            id: item.id,
                                            userId: studentId,
                                        })
                                    }
                                >
                                    Remove
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {isAddingItem ? (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                    }}
                >
                    <ItemPicker
                        options={contentOptions}
                        draft={newItem}
                        onChange={setNewItem}
                        onRemove={() => setIsAddingItem(false)}
                    />
                    <button
                        type="button"
                        className={styles.ghostAddBtn}
                        disabled={!newItem.contentId || createItem.isPending}
                        onClick={async () => {
                            await createItem.mutateAsync({
                                userId: studentId,
                                assignmentId: assignment.id,
                                contentType: newItem.contentType,
                                contentId: newItem.contentId,
                            });
                            setNewItem({ contentType: 'quiz', contentId: '' });
                            setIsAddingItem(false);
                        }}
                    >
                        {createItem.isPending ? 'Adding…' : 'Add item'}
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    className={styles.ghostAddBtn}
                    onClick={() => setIsAddingItem(true)}
                >
                    + Add item
                </button>
            )}
        </li>
    );
}

function StudentAssignments({ studentId }: { studentId: string }) {
    const { data: assignments = [], isLoading } = useAssignments(studentId);
    const { data: items = [] } = useAssignmentItems(studentId);
    const contentOptions = useContentOptions();
    const createAssignment = useCreateAssignment();

    const [showForm, setShowForm] = useState(false);

    const itemsByAssignment = new Map<string, AssignmentItemApiItem[]>();
    for (const item of items) {
        const list = itemsByAssignment.get(item.assignmentId) ?? [];
        list.push(item);
        itemsByAssignment.set(item.assignmentId, list);
    }

    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h3 className={styles.subHeading}>Assignments</h3>
                <button
                    type="button"
                    className={styles.addButton}
                    onClick={() => setShowForm((v) => !v)}
                >
                    {showForm ? 'Cancel' : '+ New Assignment'}
                </button>
            </div>

            {showForm && (
                <AssignmentForm
                    contentOptions={contentOptions}
                    isPending={createAssignment.isPending}
                    onCancel={() => setShowForm(false)}
                    onSubmit={async (values) => {
                        await createAssignment.mutateAsync({
                            userId: studentId,
                            title: values.title,
                            description: values.description,
                            dueDate: values.dueDate,
                            items: values.items,
                        });
                        setShowForm(false);
                    }}
                />
            )}

            {isLoading ? (
                <p>Loading assignments...</p>
            ) : assignments.length === 0 ? (
                <p className={styles.empty}>No assignments yet.</p>
            ) : (
                <ul className={styles.assignmentList}>
                    {assignments.map((assignment) => (
                        <AssignmentRow
                            key={assignment.id}
                            studentId={studentId}
                            assignment={assignment}
                            items={itemsByAssignment.get(assignment.id) ?? []}
                            contentOptions={contentOptions}
                        />
                    ))}
                </ul>
            )}
        </div>
    );
}
