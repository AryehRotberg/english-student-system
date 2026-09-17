import { useState } from 'react';
import {
    useCreateQuestionAcceptedAnswer,
    useFinalizeAttemptGrading,
    useGradeStudentAnswer,
} from '../../hooks/mutations';
import { useAttemptGrading } from '../../hooks/queries';
import adminStyles from '../../pages/Admin/AdminPage.module.css';
import type { StudentAnswerApiItem } from '../../services/student-answers.service';
import type { GradingQuestion } from '../../types/api-items/attempt-grading';
import { getApiErrorMessage } from '../../utils/getApiErrorMessage';
import styles from './AttemptGradingPanel.module.css';

type Props = {
    attemptId: string;
    backLabel: string;
    onBack: () => void;
};

// Built from code points so file encoding can't corrupt the quote characters.
const QUOTE_VARIANTS = new RegExp(
    '[' +
        [0x2018, 0x2019, 0x201a, 0x201b, 0x02bc, 0x00b4, 0x0060]
            .map((codePoint) => String.fromCharCode(codePoint))
            .join('') +
        ']',
    'g',
);

// Approximates the backend's normalization; only used to decide whether a
// student's answer is already in the accepted list.
function normalizeAnswer(answer: string): string {
    return answer
        .replace(QUOTE_VARIANTS, "'")
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/[.,!?;:]+$/, '');
}

function formatPoints(value: number | null | undefined): string {
    if (value === null || value === undefined) return '—';
    return Number(value)
        .toFixed(2)
        .replace(/\.?0+$/, '');
}

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

export function AttemptGradingPanel({ attemptId, backLabel, onBack }: Props) {
    const { data: grading, isLoading, error } = useAttemptGrading(attemptId);
    const finalize = useFinalizeAttemptGrading();
    const [acceptSuggestions, setAcceptSuggestions] = useState(true);

    const backButton = (
        <button
            type="button"
            className={adminStyles.backNavBtn}
            onClick={onBack}
        >
            <BackChevron />
            {backLabel}
        </button>
    );

    if (isLoading) {
        return (
            <div className={adminStyles.section}>
                {backButton}
                <p>Loading attempt…</p>
            </div>
        );
    }

    if (!grading) {
        return (
            <div className={adminStyles.section}>
                {backButton}
                <p className={adminStyles.error}>
                    {error ? getApiErrorMessage(error) : 'Attempt not found.'}
                </p>
            </div>
        );
    }

    const answers = grading.questions.flatMap((question) => question.answers);
    const ungradedCount = answers.filter((a) => a.points === null).length;
    const gradedPoints = answers.reduce(
        (sum, a) => sum + Number(a.points ?? 0),
        0,
    );
    const isGraded = grading.status === 'graded';
    const canFinalize = ungradedCount === 0 || acceptSuggestions;

    return (
        <div className={adminStyles.section}>
            {backButton}

            <div className={styles.summary}>
                <div>
                    <p className={styles.summaryTitle}>
                        {grading.quizTitle ?? 'Quiz'}
                    </p>
                    <span
                        className={`${adminStyles.attemptStatusBadge} ${isGraded ? adminStyles.attemptStatusCompleted : adminStyles.attemptStatusInProgress}`}
                    >
                        {isGraded ? 'Graded' : 'Awaiting grading'}
                    </span>
                </div>
                <div className={styles.summaryStats}>
                    <Stat
                        label="Graded points"
                        value={`${formatPoints(gradedPoints)} / ${formatPoints(grading.totalMaxPoints)}`}
                    />
                    <Stat
                        label="Ungraded answers"
                        value={String(ungradedCount)}
                    />
                    {isGraded && (
                        <Stat
                            label="Final score"
                            value={`${formatPoints(grading.points)} / ${formatPoints(grading.totalMaxPoints)}`}
                        />
                    )}
                </div>
            </div>

            <div className={styles.questionList}>
                {grading.questions.map((question, index) => (
                    <QuestionGradingCard
                        key={question.questionId}
                        attemptId={attemptId}
                        question={question}
                        number={index + 1}
                    />
                ))}
            </div>

            <div className={styles.footer}>
                {isGraded ? (
                    <p className={styles.success}>
                        Grading is finalized and the student can see their
                        score. Changing a grade updates the score automatically.
                    </p>
                ) : (
                    <>
                        {ungradedCount > 0 && (
                            <label className={adminStyles.checkLabel}>
                                <input
                                    type="checkbox"
                                    checked={acceptSuggestions}
                                    onChange={(e) =>
                                        setAcceptSuggestions(e.target.checked)
                                    }
                                />
                                Use the suggested grade for the {ungradedCount}{' '}
                                answer{ungradedCount === 1 ? '' : 's'} you
                                haven&apos;t graded
                            </label>
                        )}
                        <div>
                            <button
                                type="button"
                                className={adminStyles.submitButton}
                                disabled={!canFinalize || finalize.isPending}
                                onClick={() =>
                                    finalize.mutate({
                                        attemptId,
                                        acceptSuggestions:
                                            acceptSuggestions &&
                                            ungradedCount > 0,
                                    })
                                }
                            >
                                {finalize.isPending
                                    ? 'Finalizing…'
                                    : 'Finalize grading'}
                            </button>
                        </div>
                        {!canFinalize && (
                            <p className={styles.hint}>
                                Grade every answer, or use the suggested grades,
                                before finalizing.
                            </p>
                        )}
                    </>
                )}
                {finalize.isError && (
                    <p className={adminStyles.error}>
                        {getApiErrorMessage(finalize.error)}
                    </p>
                )}
            </div>
        </div>
    );
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div className={styles.stat}>
            <span className={styles.statLabel}>{label}</span>
            <span className={styles.statValue}>{value}</span>
        </div>
    );
}

function QuestionGradingCard({
    attemptId,
    question,
    number,
}: {
    attemptId: string;
    question: GradingQuestion;
    number: number;
}) {
    const isMultipleChoice = question.choices.length > 0;
    const isFullyGraded =
        question.answers.length > 0 &&
        question.answers.every((a) => a.points !== null);

    return (
        <section className={styles.questionCard} data-graded={isFullyGraded}>
            <div className={styles.questionTop}>
                <span className={styles.questionNum}>
                    Q{number} · {formatPoints(question.maxPoints)} pt
                    {Number(question.maxPoints) === 1 ? '' : 's'}
                </span>
                <span className={adminStyles.typeBadge}>
                    {isMultipleChoice ? 'Multiple choice' : 'Open-ended'}
                </span>
            </div>
            <p className={styles.questionText}>{question.questionText}</p>

            {isMultipleChoice ? (
                <MultipleChoiceGrading
                    attemptId={attemptId}
                    question={question}
                />
            ) : (
                <OpenEndedGrading attemptId={attemptId} question={question} />
            )}
        </section>
    );
}

function answerRowKey(answer: StudentAnswerApiItem) {
    // Remount after a save so the input resets to the stored grade.
    return `${answer.id}-${answer.gradedAt ?? 'ungraded'}-${answer.points ?? ''}`;
}

function MultipleChoiceGrading({
    attemptId,
    question,
}: {
    attemptId: string;
    question: GradingQuestion;
}) {
    const answer = question.answers[0];

    return (
        <>
            <ul className={styles.choiceList}>
                {question.choices.map((choice) => {
                    const isSelected = answer?.selectedOptionId === choice.id;
                    return (
                        <li
                            key={choice.id}
                            className={styles.choice}
                            data-selected={isSelected}
                        >
                            <span>{choice.text}</span>
                            {choice.isCorrect && (
                                <span className={adminStyles.correctBadge}>
                                    Correct
                                </span>
                            )}
                            {isSelected && (
                                <span className={styles.chosenBadge}>
                                    Student&apos;s choice
                                </span>
                            )}
                        </li>
                    );
                })}
            </ul>
            {answer ? (
                <AnswerGradeRow
                    key={answerRowKey(answer)}
                    attemptId={attemptId}
                    answer={answer}
                    maxPoints={Number(question.maxPoints)}
                />
            ) : (
                <p className={styles.noAnswer}>No answer submitted.</p>
            )}
        </>
    );
}

function OpenEndedGrading({
    attemptId,
    question,
}: {
    attemptId: string;
    question: GradingQuestion;
}) {
    const blankCount = Math.max(
        question.blankMaxPoints.length,
        ...question.answers.map((a) => Number(a.blankIndex)),
        1,
    );
    const blankIndexes = Array.from({ length: blankCount }, (_, i) => i + 1);

    return (
        <>
            {blankIndexes.map((blankIndex) => {
                const answer = question.answers.find(
                    (a) => Number(a.blankIndex) === blankIndex,
                );
                const accepted = question.acceptedAnswers.filter(
                    (a) => a.blankIndex === blankIndex,
                );
                const maxPoints = Number(
                    question.blankMaxPoints[blankIndex - 1] ??
                        question.maxPoints,
                );
                const studentText = answer?.textAnswer?.trim() ?? '';
                const isAlreadyAccepted =
                    studentText !== '' &&
                    accepted.some(
                        (a) =>
                            normalizeAnswer(a.answer ?? '') ===
                            normalizeAnswer(studentText),
                    );

                return (
                    <div key={blankIndex} className={styles.blank}>
                        {blankCount > 1 && (
                            <span className={styles.statLabel}>
                                Blank {blankIndex}
                            </span>
                        )}
                        <div className={styles.answerLine}>
                            Student answer:{' '}
                            {studentText ? (
                                <span className={styles.studentAnswer}>
                                    {studentText}
                                </span>
                            ) : (
                                <span className={styles.noAnswer}>
                                    No answer
                                </span>
                            )}
                        </div>
                        <div className={styles.acceptedList}>
                            <span>Accepted:</span>
                            {accepted.length === 0 ? (
                                <span className={styles.noAnswer}>none</span>
                            ) : (
                                accepted.map((a) => (
                                    <span
                                        key={a.id}
                                        className={styles.acceptedChip}
                                    >
                                        {a.answer}
                                    </span>
                                ))
                            )}
                            {studentText && !isAlreadyAccepted && (
                                <AddAcceptedAnswerButton
                                    questionId={question.questionId}
                                    blankIndex={blankIndex}
                                    answer={studentText}
                                />
                            )}
                        </div>
                        {answer && (
                            <AnswerGradeRow
                                key={answerRowKey(answer)}
                                attemptId={attemptId}
                                answer={answer}
                                maxPoints={maxPoints}
                            />
                        )}
                    </div>
                );
            })}
        </>
    );
}

function AddAcceptedAnswerButton({
    questionId,
    blankIndex,
    answer,
}: {
    questionId: string;
    blankIndex: number;
    answer: string;
}) {
    const create = useCreateQuestionAcceptedAnswer();

    return (
        <>
            <button
                type="button"
                className={adminStyles.ghostAddBtn}
                disabled={create.isPending}
                title="Future attempts will grade this answer as correct automatically"
                onClick={() =>
                    create.mutate({ questionId, answer, blankIndex })
                }
            >
                {create.isPending ? 'Adding…' : '+ Add to accepted answers'}
            </button>
            {create.isError && (
                <span className={adminStyles.error}>
                    {getApiErrorMessage(create.error)}
                </span>
            )}
        </>
    );
}

function AnswerGradeRow({
    attemptId,
    answer,
    maxPoints,
}: {
    attemptId: string;
    answer: StudentAnswerApiItem;
    maxPoints: number;
}) {
    const grade = useGradeStudentAnswer();
    const [value, setValue] = useState(
        String(answer.points ?? answer.autoPoints ?? 0),
    );

    const parsed = Number(value);
    const isValid =
        value.trim() !== '' &&
        Number.isFinite(parsed) &&
        parsed >= 0 &&
        parsed <= maxPoints;
    const isGraded = answer.points !== null;
    const isChanged = !isGraded || parsed !== Number(answer.points);

    return (
        <div className={styles.gradeRow}>
            <span
                className={isGraded ? styles.gradedBadge : styles.pendingBadge}
            >
                {isGraded ? 'Graded' : 'Not graded'}
            </span>
            <span className={styles.hint}>
                Suggested: {formatPoints(answer.autoPoints)} /{' '}
                {formatPoints(maxPoints)}
            </span>
            <input
                className={styles.pointsInput}
                type="number"
                min={0}
                max={maxPoints}
                step={0.01}
                value={value}
                aria-label="Points"
                onChange={(e) => setValue(e.target.value)}
            />
            <span className={styles.hint}>/ {formatPoints(maxPoints)}</span>
            <button
                type="button"
                className={adminStyles.editBtn}
                onClick={() => setValue(String(maxPoints))}
            >
                Full
            </button>
            <button
                type="button"
                className={adminStyles.editBtn}
                onClick={() => setValue('0')}
            >
                Zero
            </button>
            <button
                type="button"
                className={adminStyles.saveBtn}
                disabled={!isValid || !isChanged || grade.isPending}
                onClick={() =>
                    grade.mutate({ id: answer.id, attemptId, points: parsed })
                }
            >
                {grade.isPending
                    ? 'Saving…'
                    : isGraded
                      ? 'Update grade'
                      : 'Save grade'}
            </button>
            {!isValid && (
                <span className={adminStyles.error}>
                    Enter a value from 0 to {formatPoints(maxPoints)}
                </span>
            )}
            {grade.isError && (
                <span className={adminStyles.error}>
                    {getApiErrorMessage(grade.error)}
                </span>
            )}
        </div>
    );
}
