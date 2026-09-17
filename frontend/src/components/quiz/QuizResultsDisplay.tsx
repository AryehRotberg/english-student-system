import type { StudentAnswerApiItem } from '../../services/student-answers.service';
import type { QuizQuestion } from '../../types/quiz';
import { fillPromptBlanks } from '../../utils/fillPromptBlanks.tsx';
import styles from './QuizResultsDisplay.module.css';

type Props = {
    questions: QuizQuestion[];
    answers: StudentAnswerApiItem[];
    title: string;
    finalScore: number;
    totalPossible: number;
    gradePercent: number;
    // Teacher-graded attempt that has not been finalized: no score or
    // correct/wrong verdicts exist yet.
    isPendingReview?: boolean;
};

type CardStatus = 'unanswered' | 'submitted' | 'correct' | 'wrong';

const CARD_CLASS: Record<CardStatus, string> = {
    unanswered: styles.cardUnanswered,
    submitted: styles.cardPending,
    correct: styles.cardCorrect,
    wrong: styles.cardWrong,
};

const BADGE_CLASS: Record<CardStatus, string> = {
    unanswered: styles.badgeUnanswered,
    submitted: styles.badgePending,
    correct: styles.badgeCorrect,
    wrong: styles.badgeWrong,
};

const BADGE_LABEL: Record<CardStatus, string> = {
    unanswered: 'Unanswered',
    submitted: 'Submitted',
    correct: 'Correct',
    wrong: 'Wrong',
};

export function QuizResultsDisplay({
    questions,
    answers,
    title,
    finalScore,
    totalPossible,
    gradePercent,
    isPendingReview = false,
}: Props) {
    const pointsByQuestionId = new Map<string, number>();
    for (const answer of answers) {
        const current = pointsByQuestionId.get(answer.questionId) ?? 0;
        pointsByQuestionId.set(
            answer.questionId,
            current + Number(answer.points ?? 0),
        );
    }

    return (
        <>
            <div className={styles.gradeHeader}>
                <div
                    className={styles.gradeBadge}
                    data-pass={gradePercent >= 60}
                    data-pending={isPendingReview}
                >
                    {isPendingReview ? '…' : `${gradePercent}%`}
                </div>
                <div>
                    <p className={styles.gradeTitle}>{title}</p>
                    <p className={styles.gradeSub}>
                        {isPendingReview ? (
                            <>
                                <strong>Awaiting teacher grading.</strong> The
                                score will appear once the answers are graded.
                            </>
                        ) : (
                            <>
                                Score: <strong>{finalScore.toFixed(2)}</strong>{' '}
                                / {totalPossible.toFixed(2)} points
                            </>
                        )}
                    </p>
                </div>
            </div>

            <div className={styles.questionList}>
                {questions.map((question) => {
                    const points =
                        pointsByQuestionId.get(question.questionId) ?? 0;
                    const hasAnswer = answers.some(
                        (a) => a.questionId === question.questionId,
                    );
                    const status: CardStatus = !hasAnswer
                        ? 'unanswered'
                        : isPendingReview
                          ? 'submitted'
                          : points >= question.maxPoints
                            ? 'correct'
                            : 'wrong';

                    return (
                        <div
                            className={`${styles.card} ${CARD_CLASS[status]}`}
                            key={question.id}
                        >
                            <div className={styles.cardTop}>
                                <span className={styles.cardNum}>
                                    Q{question.questionNumber}
                                </span>
                                <span className={BADGE_CLASS[status]}>
                                    {BADGE_LABEL[status]}
                                </span>
                            </div>
                            <p className={styles.cardPrompt}>
                                {fillPromptBlanks(question, answers)}
                            </p>
                        </div>
                    );
                })}
            </div>
        </>
    );
}
