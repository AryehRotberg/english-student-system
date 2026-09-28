import { useRef, useState } from 'react';
import {
    useCreateQuestionAcceptedAnswer,
    useFinalizeAttemptGrading,
    useGradeStudentAnswer,
    useRemoveFeedbackFile,
    useUploadFeedbackFile,
} from '../../hooks/mutations';
import { useAttemptGrading } from '../../hooks/queries';
import adminStyles from '../../pages/Admin/AdminPage.module.css';
import { ANSWER_FILE_TYPES } from '../../services/answer-files.service';
import type { StudentAnswerApiItem } from '../../services/student-answers.service';
import type { GradingQuestion } from '../../types/api-items/attempt-grading';
import { getApiErrorMessage } from '../../utils/getApiErrorMessage';
import { QuestionImage } from '../content/QuestionImage';
import { RichText } from '../content/RichText';
import { AnswerFileGallery } from '../exam/AnswerFileGallery';
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

function questionKind(question: GradingQuestion) {
    if (question.questionType === 'handwritten') return 'handwritten';
    if (question.questionType === 'multiple_choice') return 'multipleChoice';
    if (question.questionType === 'open_ended') return 'openEnded';
    // Older questions have no stored type.
    return question.choices.length > 0 ? 'multipleChoice' : 'openEnded';
}

const KIND_LABEL = {
    handwritten: 'Handwritten',
    multipleChoice: 'Multiple choice',
    openEnded: 'Open-ended',
} as const;

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
    const countedAnswers = answers.filter((a) => a.isCounted);
    const ungraded = countedAnswers.filter((a) => a.points === null);
    const ungradedCount = ungraded.length;
    // Suggestions exist only for auto-gradable answers; handwritten work always
    // needs a grade from the teacher.
    const ungradedWithoutSuggestion = ungraded.filter(
        (a) => a.autoPoints === null,
    ).length;
    const gradedPoints = countedAnswers.reduce(
        (sum, a) => sum + Number(a.points ?? 0),
        0,
    );
    const countedQuestions = new Set(countedAnswers.map((a) => a.questionId))
        .size;
    const required = grading.questionsToAnswer;
    const tooManyCounted = required !== null && countedQuestions > required;
    const isGraded = grading.status === 'graded';
    const canFinalize =
        !tooManyCounted &&
        (ungradedCount === 0 ||
            (acceptSuggestions && ungradedWithoutSuggestion === 0));

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
                    {required !== null && (
                        <Stat
                            label="Counted questions"
                            value={`${countedQuestions} / ${required}`}
                        />
                    )}
                    {isGraded && (
                        <Stat
                            label="Final score"
                            value={`${formatPoints(grading.points)} / ${formatPoints(grading.totalMaxPoints)}`}
                        />
                    )}
                </div>
            </div>

            {tooManyCounted && (
                <p className={styles.banner}>
                    The student answered {countedQuestions} questions but only{' '}
                    {required} count. Untick “Counts toward the grade” on the
                    answers that should not count.
                </p>
            )}

            <div className={styles.questionList}>
                {grading.questions.map((question, index) => (
                    <QuestionGradingCard
                        key={question.questionId}
                        attemptId={attemptId}
                        question={question}
                        number={index + 1}
                        showCountedToggle={required !== null}
                    />
                ))}
            </div>

            <div className={styles.footer}>
                {isGraded ? (
                    <p className={styles.success}>
                        Grading is finalized and the student can see their score
                        and feedback. Changing a grade updates the score
                        automatically.
                    </p>
                ) : (
                    <>
                        {ungradedCount > ungradedWithoutSuggestion && (
                            <label className={adminStyles.checkLabel}>
                                <input
                                    type="checkbox"
                                    checked={acceptSuggestions}
                                    onChange={(e) =>
                                        setAcceptSuggestions(e.target.checked)
                                    }
                                />
                                Use the suggested grade for the{' '}
                                {ungradedCount - ungradedWithoutSuggestion}{' '}
                                auto-gradable answer
                                {ungradedCount - ungradedWithoutSuggestion === 1
                                    ? ''
                                    : 's'}{' '}
                                you haven&apos;t graded
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
                                {tooManyCounted
                                    ? `Only ${required} answers can count toward the grade.`
                                    : ungradedWithoutSuggestion > 0
                                      ? 'Grade every handwritten answer before finalizing.'
                                      : 'Grade every answer, or use the suggested grades, before finalizing.'}
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
    showCountedToggle,
}: {
    attemptId: string;
    question: GradingQuestion;
    number: number;
    showCountedToggle: boolean;
}) {
    const kind = questionKind(question);
    const counted = question.answers.filter((a) => a.isCounted);
    const isFullyGraded =
        question.answers.length > 0 &&
        (counted.length === 0 || counted.every((a) => a.points !== null));

    return (
        <section className={styles.questionCard} data-graded={isFullyGraded}>
            <div className={styles.questionTop}>
                <span className={styles.questionNum}>
                    Q{number} · {formatPoints(question.maxPoints)} pt
                    {Number(question.maxPoints) === 1 ? '' : 's'}
                </span>
                <span className={adminStyles.typeBadge}>
                    {KIND_LABEL[kind]}
                </span>
            </div>
            <RichText
                className={styles.questionText}
                content={question.questionText}
                format={question.contentFormat}
            />
            <QuestionImage
                questionId={question.questionId}
                hasImage={question.hasImage}
            />

            {showCountedToggle && question.answers.length > 0 && (
                <CountedToggle attemptId={attemptId} question={question} />
            )}

            {kind === 'handwritten' ? (
                <HandwrittenGrading attemptId={attemptId} question={question} />
            ) : kind === 'multipleChoice' ? (
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

// "Answer N of M": the teacher decides which answered questions count.
function CountedToggle({
    attemptId,
    question,
}: {
    attemptId: string;
    question: GradingQuestion;
}) {
    const grade = useGradeStudentAnswer();
    const isCounted = question.answers.every((a) => a.isCounted);

    return (
        <label className={adminStyles.checkLabel}>
            <input
                type="checkbox"
                checked={isCounted}
                disabled={grade.isPending}
                onChange={(e) => {
                    for (const answer of question.answers) {
                        grade.mutate({
                            id: answer.id,
                            attemptId,
                            isCounted: e.target.checked,
                        });
                    }
                }}
            />
            Counts toward the grade
            {grade.isError && (
                <span className={adminStyles.error}>
                    {getApiErrorMessage(grade.error)}
                </span>
            )}
        </label>
    );
}

function answerRowKey(answer: StudentAnswerApiItem) {
    // Remount after a save so the inputs reset to the stored values.
    return `${answer.id}-${answer.gradedAt ?? 'ungraded'}-${answer.points ?? ''}-${answer.feedback ?? ''}`;
}

function HandwrittenGrading({
    attemptId,
    question,
}: {
    attemptId: string;
    question: GradingQuestion;
}) {
    const answer = question.answers[0];
    const files = [...question.files].sort((a, b) => a.pageOrder - b.pageOrder);

    if (!answer) {
        return <p className={styles.noAnswer}>No pages submitted.</p>;
    }

    return (
        <>
            {files.length > 0 ? (
                <AnswerFileGallery files={files} />
            ) : (
                <p className={styles.noAnswer}>No pages submitted.</p>
            )}
            {answer.isCounted ? (
                <AnswerGradeRow
                    key={answerRowKey(answer)}
                    attemptId={attemptId}
                    answer={answer}
                    maxPoints={Number(question.maxPoints)}
                    showSuggestion={false}
                    withFeedback
                />
            ) : (
                <p className={styles.hint}>Not counted — no grade needed.</p>
            )}
            <FeedbackFileRow attemptId={attemptId} answer={answer} />
        </>
    );
}

function FeedbackFileRow({
    attemptId,
    answer,
}: {
    attemptId: string;
    answer: StudentAnswerApiItem;
}) {
    const upload = useUploadFeedbackFile();
    const remove = useRemoveFeedbackFile();
    const inputRef = useRef<HTMLInputElement>(null);
    const error = upload.error ?? remove.error;

    return (
        <div className={styles.feedbackFileRow}>
            <span className={styles.statLabel}>Marked-up copy</span>
            {answer.hasFeedbackFile ? (
                <>
                    <span className={styles.gradedBadge}>Attached</span>
                    <button
                        type="button"
                        className={adminStyles.editBtn}
                        disabled={upload.isPending}
                        onClick={() => inputRef.current?.click()}
                    >
                        Replace
                    </button>
                    <button
                        type="button"
                        className={adminStyles.deleteBtn}
                        disabled={remove.isPending}
                        onClick={() =>
                            remove.mutate({ answerId: answer.id, attemptId })
                        }
                    >
                        Remove
                    </button>
                </>
            ) : (
                <button
                    type="button"
                    className={adminStyles.ghostAddBtn}
                    disabled={upload.isPending}
                    onClick={() => inputRef.current?.click()}
                >
                    {upload.isPending
                        ? 'Uploading…'
                        : '+ Upload annotated PDF or image'}
                </button>
            )}
            <input
                ref={inputRef}
                type="file"
                accept={ANSWER_FILE_TYPES.join(',')}
                hidden
                onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = '';
                    if (file) {
                        upload.mutate({ answerId: answer.id, attemptId, file });
                    }
                }}
            />
            {error && (
                <span className={adminStyles.error}>
                    {getApiErrorMessage(error)}
                </span>
            )}
        </div>
    );
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
                            <span dir="auto">{choice.text}</span>
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
                                <span
                                    className={styles.studentAnswer}
                                    dir="auto"
                                >
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
                                        dir="auto"
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
    showSuggestion = true,
    withFeedback = false,
}: {
    attemptId: string;
    answer: StudentAnswerApiItem;
    maxPoints: number;
    showSuggestion?: boolean;
    withFeedback?: boolean;
}) {
    const grade = useGradeStudentAnswer();
    const [value, setValue] = useState(
        answer.points !== null
            ? String(answer.points)
            : showSuggestion
              ? String(answer.autoPoints ?? 0)
              : '',
    );
    const [feedback, setFeedback] = useState(answer.feedback ?? '');

    const parsed = Number(value);
    const isValid =
        value.trim() !== '' &&
        Number.isFinite(parsed) &&
        parsed >= 0 &&
        parsed <= maxPoints;
    const isGraded = answer.points !== null;
    const pointsChanged = !isGraded || parsed !== Number(answer.points);
    const feedbackChanged = feedback !== (answer.feedback ?? '');
    const isChanged = pointsChanged || (withFeedback && feedbackChanged);

    return (
        <div className={styles.gradeBlock}>
            <div className={styles.gradeRow}>
                <span
                    className={
                        isGraded ? styles.gradedBadge : styles.pendingBadge
                    }
                >
                    {isGraded ? 'Graded' : 'Not graded'}
                </span>
                {showSuggestion && (
                    <span className={styles.hint}>
                        Suggested: {formatPoints(answer.autoPoints)} /{' '}
                        {formatPoints(maxPoints)}
                    </span>
                )}
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
                        grade.mutate({
                            id: answer.id,
                            attemptId,
                            points: parsed,
                            feedback: withFeedback ? feedback : undefined,
                        })
                    }
                >
                    {grade.isPending
                        ? 'Saving…'
                        : isGraded
                          ? 'Update grade'
                          : 'Save grade'}
                </button>
                {!isValid && value.trim() !== '' && (
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
            {withFeedback && (
                <label className={styles.feedbackField}>
                    <span className={styles.statLabel}>
                        Feedback for the student (Markdown and $LaTeX$ work)
                    </span>
                    <textarea
                        className={styles.feedbackInput}
                        dir="auto"
                        rows={3}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="What was right, what to fix…"
                    />
                </label>
            )}
        </div>
    );
}
