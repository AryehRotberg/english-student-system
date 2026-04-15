import { useState } from 'react';
import {
    useCreateQuizQuestion,
    useUpdateQuizQuestion,
} from '../../hooks/mutations';
import {
    useQuestions,
    useQuizzes,
    useRawQuizQuestions,
    type QuestionAdminItem,
    type RawQuizQuestionAdminItem,
} from '../../hooks/queries';
import styles from '../../pages/Admin/AdminPage.module.css';

export function QuizBuilderSection() {
    const { data: quizzes = [] } = useQuizzes();
    const { data: allQuestions = [] } = useQuestions();
    const [selectedQuizId, setSelectedQuizId] = useState('');
    const { data: quizQuestionsData = [] } =
        useRawQuizQuestions(selectedQuizId);
    const createQQ = useCreateQuizQuestion();
    const updateQQ = useUpdateQuizQuestion();

    const [addQuestionId, setAddQuestionId] = useState('');
    const [addMaxPoints, setAddMaxPoints] = useState(10);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editMaxPoints, setEditMaxPoints] = useState(10);

    const assignedIds = new Set(quizQuestionsData.map((qq) => qq.questionId));
    const available = (allQuestions as QuestionAdminItem[]).filter(
        (q) => !assignedIds.has(q.id),
    );

    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h3>Quiz Builder</h3>
            </div>

            <div className={styles.field}>
                <label>Select Quiz</label>
                <select
                    value={selectedQuizId}
                    onChange={(e) => setSelectedQuizId(e.target.value)}
                >
                    <option value="">— choose a quiz —</option>
                    {quizzes.map((q) => (
                        <option key={q.id} value={q.id}>
                            {q.title}
                        </option>
                    ))}
                </select>
            </div>

            {selectedQuizId && (
                <>
                    <ul className={styles.itemList}>
                        {(quizQuestionsData as RawQuizQuestionAdminItem[]).map(
                            (qq) => (
                                <li key={qq.id} className={styles.item}>
                                    <div className={styles.builderRow}>
                                        <span className={styles.questionText}>
                                            {qq.question}
                                        </span>
                                        <div className={styles.builderActions}>
                                            {editingId === qq.id ? (
                                                <>
                                                    <input
                                                        type="number"
                                                        value={editMaxPoints}
                                                        onChange={(e) =>
                                                            setEditMaxPoints(
                                                                Number(
                                                                    e.target
                                                                        .value,
                                                                ),
                                                            )
                                                        }
                                                        min={0}
                                                        className={
                                                            styles.numberInput
                                                        }
                                                    />
                                                    <button
                                                        type="button"
                                                        className={
                                                            styles.saveBtn
                                                        }
                                                        onClick={async () => {
                                                            await updateQQ.mutateAsync(
                                                                {
                                                                    id: qq.id,
                                                                    quizId: qq.quizId,
                                                                    maxPoints:
                                                                        editMaxPoints,
                                                                },
                                                            );
                                                            setEditingId(null);
                                                        }}
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={
                                                            styles.cancelBtn
                                                        }
                                                        onClick={() =>
                                                            setEditingId(null)
                                                        }
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <span
                                                        className={
                                                            styles.typeBadge
                                                        }
                                                    >
                                                        {qq.maxPoints} pts
                                                    </span>
                                                    <button
                                                        type="button"
                                                        className={
                                                            styles.editBtn
                                                        }
                                                        onClick={() => {
                                                            setEditingId(qq.id);
                                                            setEditMaxPoints(
                                                                qq.maxPoints,
                                                            );
                                                        }}
                                                    >
                                                        Edit pts
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ),
                        )}
                        {quizQuestionsData.length === 0 && (
                            <li className={styles.empty}>
                                No questions linked yet.
                            </li>
                        )}
                    </ul>

                    <form
                        className={styles.form}
                        onSubmit={async (e) => {
                            e.preventDefault();
                            if (!addQuestionId) return;
                            await createQQ.mutateAsync({
                                quizId: selectedQuizId,
                                questionId: addQuestionId,
                                maxPoints: addMaxPoints,
                            });
                            setAddQuestionId('');
                            setAddMaxPoints(10);
                        }}
                    >
                        <h4 className={styles.subHeading}>
                            Link question to this quiz
                        </h4>
                        <div className={styles.fieldRow}>
                            <div className={styles.field}>
                                <label>Question</label>
                                <select
                                    value={addQuestionId}
                                    onChange={(e) =>
                                        setAddQuestionId(e.target.value)
                                    }
                                    required
                                >
                                    <option value="">
                                        — select question —
                                    </option>
                                    {available.map((q) => (
                                        <option key={q.id} value={q.id}>
                                            {q.question}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div
                                className={styles.field}
                                style={{ maxWidth: 140 }}
                            >
                                <label>Max Points</label>
                                <input
                                    type="number"
                                    value={addMaxPoints}
                                    onChange={(e) =>
                                        setAddMaxPoints(Number(e.target.value))
                                    }
                                    min={0}
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={createQQ.isPending || !addQuestionId}
                        >
                            {createQQ.isPending ? 'Adding…' : 'Add to Quiz'}
                        </button>
                    </form>
                </>
            )}
        </div>
    );
}
