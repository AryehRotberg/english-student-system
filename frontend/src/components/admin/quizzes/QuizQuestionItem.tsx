import { useState } from 'react';
import {
    useDeleteQuestion,
    useRemoveQuizQuestion,
    useUpdateQuizQuestion,
} from '../../../hooks/mutations';
import type {
    QuestionAdminItem,
    RawQuizQuestionAdminItem,
} from '../../../types/admin-query-items';
import { getApiErrorMessage } from '../../../utils/getApiErrorMessage';
import { QuestionDetail } from '../QuestionDetail';
import { QuestionForm } from '../QuestionForm';
import { QuestionBadges, QuestionPreview } from './QuestionPreview';
import styles from './QuizEditor.module.css';

type Props = {
    link: RawQuizQuestionAdminItem;
    /** Full question from the subject's bank; missing while it loads. */
    question?: QuestionAdminItem;
    position: number;
    count: number;
    expanded: boolean;
    allowHandwritten: boolean;
    reordering: boolean;
    onToggle: () => void;
    onMove: (delta: -1 | 1) => void;
};

export function QuizQuestionItem({
    link,
    question,
    position,
    count,
    expanded,
    allowHandwritten,
    reordering,
    onToggle,
    onMove,
}: Props) {
    const updateLink = useUpdateQuizQuestion();
    const removeLink = useRemoveQuizQuestion();
    const deleteQuestion = useDeleteQuestion();
    const [points, setPoints] = useState(String(link.maxPoints));
    const [savedPoints, setSavedPoints] = useState(link.maxPoints);
    // Follow the server value after a save or refetch.
    if (savedPoints !== link.maxPoints) {
        setSavedPoints(link.maxPoints);
        setPoints(String(link.maxPoints));
    }
    const error = updateLink.error ?? removeLink.error ?? deleteQuestion.error;

    const savePoints = () => {
        const value = Number(points);
        if (!Number.isFinite(value) || value < 0) {
            setPoints(String(link.maxPoints));
            return;
        }
        if (value !== Number(link.maxPoints)) {
            updateLink.mutate({
                id: link.id,
                quizId: link.quizId,
                maxPoints: value,
            });
        }
    };

    return (
        <li className={`${styles.questionItem} ${expanded ? styles.questionItemOpen : ''}`}>
            <div className={styles.questionRow}>
                <span className={styles.position}>{position + 1}</span>

                <button
                    type="button"
                    className={styles.questionBody}
                    onClick={onToggle}
                    aria-expanded={expanded}
                >
                    <QuestionPreview
                        content={question?.question ?? link.question}
                        format={question?.contentFormat}
                    />
                    <QuestionBadges question={question} />
                </button>

                <div className={styles.rowControls}>
                    <label className={styles.pointsField}>
                        <input
                            type="number"
                            min={0}
                            step={0.5}
                            value={points}
                            onChange={(e) => setPoints(e.target.value)}
                            onBlur={savePoints}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    e.currentTarget.blur();
                                }
                            }}
                            aria-label={`Points for question ${position + 1}`}
                        />
                        <span>pts</span>
                    </label>
                    <div className={styles.moveButtons}>
                        <button
                            type="button"
                            className={styles.iconButton}
                            disabled={position === 0 || reordering}
                            onClick={() => onMove(-1)}
                            aria-label="Move up"
                            title="Move up"
                        >
                            ↑
                        </button>
                        <button
                            type="button"
                            className={styles.iconButton}
                            disabled={position === count - 1 || reordering}
                            onClick={() => onMove(1)}
                            aria-label="Move down"
                            title="Move down"
                        >
                            ↓
                        </button>
                    </div>
                    <button
                        type="button"
                        className={styles.textButton}
                        onClick={onToggle}
                    >
                        {expanded ? 'Close' : 'Edit'}
                    </button>
                    <button
                        type="button"
                        className={styles.removeButton}
                        disabled={removeLink.isPending}
                        onClick={() =>
                            removeLink.mutate({
                                id: link.id,
                                quizId: link.quizId,
                            })
                        }
                        title="Remove from this quiz (the question stays in the question bank)"
                    >
                        Remove
                    </button>
                </div>
            </div>

            {error && (
                <p className={styles.error}>{getApiErrorMessage(error)}</p>
            )}

            {expanded && question && (
                <div className={styles.questionEditor}>
                    <QuestionForm
                        key={`${question.id}-${question.hasImage}`}
                        question={question}
                        lockSubject
                        allowHandwritten={allowHandwritten}
                        onDone={onToggle}
                        onCancel={onToggle}
                    />
                    <QuestionDetail question={question} />
                    <div className={styles.dangerZone}>
                        <span>
                            Deleting removes the question from the question
                            bank and from every quiz that uses it.
                        </span>
                        <button
                            type="button"
                            className={styles.removeButton}
                            disabled={deleteQuestion.isPending}
                            onClick={() => {
                                if (
                                    confirm(
                                        'Delete this question permanently? It will be removed from every quiz that uses it.',
                                    )
                                ) {
                                    deleteQuestion.mutate(question.id);
                                }
                            }}
                        >
                            Delete question
                        </button>
                    </div>
                </div>
            )}
        </li>
    );
}
