import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
    answerFilesService,
    type AnswerFile,
} from '../../services/answer-files.service';
import type { StudentAnswerApiItem } from '../../services/student-answers.service';
import type { QuizQuestion } from '../../types/quiz';
import { isHandwritten } from '../../utils/exam';
import { fillPromptBlanks } from '../../utils/fillPromptBlanks.tsx';
import { QuestionImage } from '../content/QuestionImage';
import { RichText } from '../content/RichText';
import { AnswerFileGallery } from '../exam/AnswerFileGallery';
import styles from './QuizResultsDisplay.module.css';

type Props = {
    questions: QuizQuestion[];
    answers: StudentAnswerApiItem[];
    files?: AnswerFile[];
    title: string;
    finalScore: number;
    totalPossible: number;
    gradePercent: number;
    // Teacher-graded attempt that has not been finalized: no score or
    // correct/wrong verdicts exist yet.
    isPendingReview?: boolean;
};

type CardStatus =
    | 'unanswered'
    | 'submitted'
    | 'correct'
    | 'wrong'
    | 'graded'
    | 'notCounted';

const CARD_CLASS: Record<CardStatus, string> = {
    unanswered: styles.cardUnanswered,
    submitted: styles.cardPending,
    correct: styles.cardCorrect,
    wrong: styles.cardWrong,
    graded: styles.cardGraded,
    notCounted: styles.cardUnanswered,
};

const BADGE_CLASS: Record<CardStatus, string> = {
    unanswered: styles.badgeUnanswered,
    submitted: styles.badgePending,
    correct: styles.badgeCorrect,
    wrong: styles.badgeWrong,
    graded: styles.badgeGraded,
    notCounted: styles.badgeUnanswered,
};

function formatPoints(value: number): string {
    return Number(value)
        .toFixed(2)
        .replace(/\.?0+$/, '');
}

export function QuizResultsDisplay({
    questions,
    answers,
    files = [],
    title,
    finalScore,
    totalPossible,
    gradePercent,
    isPendingReview = false,
}: Props) {
    const { t } = useTranslation();

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
                                <strong>{t('results.awaitingTitle')}</strong>{' '}
                                {t('results.awaitingBody')}
                            </>
                        ) : (
                            <>
                                {t('results.score')}{' '}
                                <strong>
                                    {t('results.scoreOf', {
                                        score: finalScore.toFixed(2),
                                        total: totalPossible.toFixed(2),
                                    })}
                                </strong>
                            </>
                        )}
                    </p>
                </div>
            </div>

            <div className={styles.questionList}>
                {questions.map((question) => {
                    const questionAnswers = answers.filter(
                        (a) => a.questionId === question.questionId,
                    );
                    const handwritten = isHandwritten(question);
                    const questionFiles = files
                        .filter((f) => f.questionId === question.questionId)
                        .sort((a, b) => a.pageOrder - b.pageOrder);
                    const points =
                        pointsByQuestionId.get(question.questionId) ?? 0;
                    const hasAnswer = questionAnswers.length > 0;
                    const isCounted = questionAnswers.every(
                        (a) => a.isCounted !== false,
                    );

                    const status: CardStatus = !hasAnswer
                        ? 'unanswered'
                        : isPendingReview
                          ? 'submitted'
                          : !isCounted
                            ? 'notCounted'
                            : handwritten
                              ? 'graded'
                              : points >= question.maxPoints
                                ? 'correct'
                                : 'wrong';

                    const feedbackAnswer = questionAnswers.find(
                        (a) => a.feedback || a.hasFeedbackFile,
                    );

                    return (
                        <div
                            className={`${styles.card} ${CARD_CLASS[status]}`}
                            key={question.id}
                        >
                            <div className={styles.cardTop}>
                                <span className={styles.cardNum}>
                                    Q{question.questionNumber}
                                </span>
                                <span className={styles.cardMeta}>
                                    {hasAnswer &&
                                        !isPendingReview &&
                                        isCounted && (
                                            <span className={styles.cardPoints}>
                                                {t('results.pointsOf', {
                                                    points: formatPoints(points),
                                                    max: formatPoints(
                                                        question.maxPoints,
                                                    ),
                                                })}
                                            </span>
                                        )}
                                    <span className={BADGE_CLASS[status]}>
                                        {t(`results.${status}`)}
                                    </span>
                                </span>
                            </div>

                            {handwritten ? (
                                <>
                                    <RichText
                                        className={styles.cardPrompt}
                                        content={question.prompt}
                                        format={question.contentFormat}
                                    />
                                    <QuestionImage
                                        questionId={question.questionId}
                                        hasImage={question.hasImage}
                                    />
                                    {questionFiles.length > 0 && (
                                        <div className={styles.pages}>
                                            <span className={styles.label}>
                                                {t('results.yourPages')}
                                            </span>
                                            <AnswerFileGallery
                                                files={questionFiles}
                                            />
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className={styles.cardPrompt} dir="auto">
                                    {fillPromptBlanks(question, answers)}
                                </p>
                            )}

                            {feedbackAnswer && (
                                <Feedback answer={feedbackAnswer} />
                            )}
                        </div>
                    );
                })}
            </div>
        </>
    );
}

function Feedback({ answer }: { answer: StudentAnswerApiItem }) {
    const { t } = useTranslation();
    // Fetched up front so the link opens synchronously on tap (a window opened
    // after an await is blocked as a popup on phones).
    const { data: fileUrl } = useQuery({
        queryKey: ['feedback-file-url', answer.id],
        enabled: answer.hasFeedbackFile,
        queryFn: () => answerFilesService.getFeedbackFileUrl(answer.id),
        staleTime: 1000 * 60 * 10,
        retry: false,
    });

    return (
        <div className={styles.feedback}>
            <span className={styles.label}>{t('results.feedback')}</span>
            {answer.feedback && (
                <RichText content={answer.feedback} format="markdown" />
            )}
            {fileUrl && (
                <a
                    className={styles.feedbackLink}
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                >
                    {t('results.annotatedFile')}
                </a>
            )}
        </div>
    );
}
