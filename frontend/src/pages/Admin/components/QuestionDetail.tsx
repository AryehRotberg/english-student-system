import { useState } from 'react';
import {
    useAnswers,
    useQuestionOptionsByQuestion,
    type AnswerAdminItem,
    type QuestionAdminItem,
    type QuestionOptionAdminItem,
} from '../../../hooks/queries';
import {
    useCreateAnswer,
    useCreateQuestionOption,
    useUpdateAnswer,
    useUpdateQuestionOption,
} from '../../../hooks/mutations';
import styles from '../AdminPage.module.css';

type Props = {
    question: QuestionAdminItem;
};

export function QuestionDetail({ question }: Props) {
    const isMultipleChoice = question.questionType === 'multiple_choice';
    const { data: options = [] } = useQuestionOptionsByQuestion(isMultipleChoice ? question.id : undefined);
    const { data: allAnswers = [] } = useAnswers();
    const questionAnswers = allAnswers.filter((a) => a.questionId === question.id);

    const createOption = useCreateQuestionOption();
    const updateOption = useUpdateQuestionOption();
    const createAnswer = useCreateAnswer();
    const updateAnswer = useUpdateAnswer();

    const [optionText, setOptionText] = useState('');
    const [isCorrect, setIsCorrect] = useState(false);
    const [answerText, setAnswerText] = useState('');
    const [blankIndex, setBlankIndex] = useState(1);

    const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
    const [editOptionText, setEditOptionText] = useState('');
    const [editIsCorrect, setEditIsCorrect] = useState(false);
    const [editingAnswerId, setEditingAnswerId] = useState<string | null>(null);
    const [editAnswerText, setEditAnswerText] = useState('');
    const [editBlankIndex, setEditBlankIndex] = useState(1);

    if (isMultipleChoice) {
        return (
            <div className={styles.subSection}>
                <h4>Answer Options</h4>
                <ul className={styles.subList}>
                    {(options as QuestionOptionAdminItem[]).map((opt) => (
                        <li key={opt.id} className={styles.subItem}>
                            {editingOptionId === opt.id ? (
                                <div className={styles.inlineEdit}>
                                    <input value={editOptionText} onChange={(e) => setEditOptionText(e.target.value)} />
                                    <label className={styles.checkLabel}>
                                        <input type="checkbox" checked={editIsCorrect} onChange={(e) => setEditIsCorrect(e.target.checked)} />
                                        Correct
                                    </label>
                                    <button type="button" className={styles.saveBtn} onClick={async () => {
                                        await updateOption.mutateAsync({ id: opt.id, questionId: question.id, optionText: editOptionText, isCorrect: editIsCorrect });
                                        setEditingOptionId(null);
                                    }}>Save</button>
                                    <button type="button" className={styles.cancelBtn} onClick={() => setEditingOptionId(null)}>Cancel</button>
                                </div>
                            ) : (
                                <div className={styles.subItemRow}>
                                    <span>{opt.optionText}</span>
                                    {opt.isCorrect && <span className={styles.correctBadge}>✓ Correct</span>}
                                    <button type="button" className={styles.editBtn} onClick={() => {
                                        setEditingOptionId(opt.id);
                                        setEditOptionText(opt.optionText);
                                        setEditIsCorrect(opt.isCorrect);
                                    }}>Edit</button>
                                </div>
                            )}
                        </li>
                    ))}
                    {options.length === 0 && <li className={styles.empty}>No options yet.</li>}
                </ul>
                <form className={styles.inlineForm} onSubmit={async (e) => {
                    e.preventDefault();
                    if (!optionText.trim()) return;
                    await createOption.mutateAsync({ questionId: question.id, optionText: optionText.trim(), isCorrect });
                    setOptionText('');
                    setIsCorrect(false);
                }}>
                    <input value={optionText} onChange={(e) => setOptionText(e.target.value)} placeholder="Option text" required />
                    <label className={styles.checkLabel}>
                        <input type="checkbox" checked={isCorrect} onChange={(e) => setIsCorrect(e.target.checked)} />
                        Correct
                    </label>
                    <button type="submit" className={styles.addOptionBtn} disabled={createOption.isPending}>Add Option</button>
                </form>
            </div>
        );
    }

    return (
        <div className={styles.subSection}>
            <h4>Correct Answers (open-ended blanks)</h4>
            <ul className={styles.subList}>
                {(questionAnswers as AnswerAdminItem[]).map((answer) => (
                    <li key={answer.id} className={styles.subItem}>
                        {editingAnswerId === answer.id ? (
                            <div className={styles.inlineEdit}>
                                <input value={editAnswerText} onChange={(e) => setEditAnswerText(e.target.value)} />
                                <input type="number" value={editBlankIndex} onChange={(e) => setEditBlankIndex(Number(e.target.value))} min={1} className={styles.numberInput} />
                                <button type="button" className={styles.saveBtn} onClick={async () => {
                                    await updateAnswer.mutateAsync({ id: answer.id, answer: editAnswerText, blankIndex: editBlankIndex });
                                    setEditingAnswerId(null);
                                }}>Save</button>
                                <button type="button" className={styles.cancelBtn} onClick={() => setEditingAnswerId(null)}>Cancel</button>
                            </div>
                        ) : (
                            <div className={styles.subItemRow}>
                                <span>Blank {answer.blankIndex}: <strong>{answer.answer}</strong></span>
                                <button type="button" className={styles.editBtn} onClick={() => {
                                    setEditingAnswerId(answer.id);
                                    setEditAnswerText(answer.answer);
                                    setEditBlankIndex(answer.blankIndex);
                                }}>Edit</button>
                            </div>
                        )}
                    </li>
                ))}
                {questionAnswers.length === 0 && <li className={styles.empty}>No answers yet.</li>}
            </ul>
            <form className={styles.inlineForm} onSubmit={async (e) => {
                e.preventDefault();
                if (!answerText.trim()) return;
                await createAnswer.mutateAsync({ questionId: question.id, answer: answerText.trim(), blankIndex });
                setAnswerText('');
                setBlankIndex((prev) => prev + 1);
            }}>
                <input value={answerText} onChange={(e) => setAnswerText(e.target.value)} placeholder="Correct answer" required />
                <input type="number" value={blankIndex} onChange={(e) => setBlankIndex(Number(e.target.value))} min={1} className={styles.numberInput} placeholder="Blank #" />
                <button type="submit" className={styles.addOptionBtn} disabled={createAnswer.isPending}>Add Answer</button>
            </form>
        </div>
    );
}
