import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAnswerFiles } from '../../hooks/queries';
import type { QuizAttemptApiItem } from '../../types/api-items/quiz-attempt';
import type { QuizQuestion, QuizSummary } from '../../types/quiz';
import {
    answeredQuestionIds,
    formatDuration,
    isHandwritten,
    remainingTime,
} from '../../utils/exam';
import { getApiErrorMessage } from '../../utils/getApiErrorMessage';
import { QuestionImage } from '../content/QuestionImage';
import { RichText } from '../content/RichText';
import { QuizCard } from '../quiz/QuizCard';
import { AnswerUploader } from './AnswerUploader';
import styles from './HandwrittenExamView.module.css';

type Props = {
    attempt: QuizAttemptApiItem;
    quiz: QuizSummary | undefined;
    questions: QuizQuestion[];
    // Questions with a saved typed/selected answer (non-handwritten questions).
    savedAnswerQuestionIds: Set<string>;
    isSubmitting: boolean;
    submitError: unknown;
    onSubmit: () => void;
};

/**
 * Exam-style attempt for quizzes with handwritten questions: every question is
 * visible and reachable in any order, the student uploads pages per question,
 * and submits once at the end (Bagrut style, including "answer N of M").
 */
export function HandwrittenExamView({
    attempt,
    quiz,
    questions,
    savedAnswerQuestionIds,
    isSubmitting,
    submitError,
    onSubmit,
}: Props) {
    const { t } = useTranslation();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isConfirming, setIsConfirming] = useState(false);
    const { data: files = [] } = useAnswerFiles(attempt.id);

    const filesByQuestion = useMemo(() => {
        const grouped = new Map<string, typeof files>();
        for (const file of files) {
            grouped.set(file.questionId, [
                ...(grouped.get(file.questionId) ?? []),
                file,
            ]);
        }
        for (const list of grouped.values()) {
            list.sort((a, b) => a.pageOrder - b.pageOrder);
        }
        return grouped;
    }, [files]);

    const answered = answeredQuestionIds(
        questions,
        savedAnswerQuestionIds,
        new Set(filesByQuestion.keys()),
    );

    const required = quiz?.questionsToAnswer ?? null;
    const current = questions[Math.min(currentIndex, questions.length - 1)];
    const unanswered = questions.filter((q) => !answered.has(q.questionId));

    return (
        <div className={styles.exam}>
            <section className={styles.header}>
                <p className={styles.instructions}>{t('exam.instructions')}</p>
                {required !== null && required < questions.length && (
                    <p className={styles.notice}>
                        {t('exam.answerNofM', {
                            required,
                            total: questions.length,
                        })}
                    </p>
                )}
                <div className={styles.statusRow}>
                    <span className={styles.counter}>
                        {required !== null && required < questions.length
                            ? t('exam.answeredCountRequired', {
                                  answered: answered.size,
                                  required,
                              })
                            : t('exam.answeredCount', {
                                  answered: answered.size,
                                  total: questions.length,
                              })}
                    </span>
                    {quiz?.timeLimitMinutes ? (
                        <Countdown
                            startedAt={attempt.startedAt}
                            timeLimitMinutes={quiz.timeLimitMinutes}
                        />
                    ) : null}
                </div>

                <nav
                    className={styles.overview}
                    aria-label={t('exam.overviewLabel')}
                >
                    {questions.map((question, index) => {
                        const isAnswered = answered.has(question.questionId);
                        return (
                            <button
                                key={question.id}
                                type="button"
                                className={styles.overviewChip}
                                data-current={index === currentIndex}
                                data-answered={isAnswered}
                                aria-current={
                                    index === currentIndex ? 'step' : undefined
                                }
                                title={`${t('exam.questionNumber', { number: index + 1 })} · ${isAnswered ? t('exam.answered') : t('exam.notAnswered')}`}
                                onClick={() => setCurrentIndex(index)}
                            >
                                {index + 1}
                            </button>
                        );
                    })}
                </nav>
            </section>

            {current && (
                <section className={styles.questionCard} key={current.id}>
                    <div className={styles.questionTop}>
                        <h2 className={styles.questionTitle}>
                            {t('exam.questionNumber', {
                                number: currentIndex + 1,
                            })}
                        </h2>
                        <span className={styles.points}>
                            {t('exam.points', {
                                count: Number(current.maxPoints),
                            })}
                        </span>
                    </div>

                    {isHandwritten(current) ? (
                        <>
                            <RichText
                                className={styles.prompt}
                                content={current.prompt}
                                format={current.contentFormat}
                            />
                            <QuestionImage
                                questionId={current.questionId}
                                hasImage={current.hasImage}
                            />
                            {current.hints && (
                                <p className={styles.hint} dir="auto">
                                    {t('quiz.hint', { hint: current.hints })}
                                </p>
                            )}
                            <AnswerUploader
                                attemptId={attempt.id}
                                questionId={current.questionId}
                                files={
                                    filesByQuestion.get(current.questionId) ??
                                    []
                                }
                            />
                        </>
                    ) : (
                        <QuizCard
                            attemptId={attempt.id}
                            question={current}
                            isLastQuestion={false}
                            embedded
                            onSubmitted={() =>
                                setCurrentIndex((i) =>
                                    Math.min(i + 1, questions.length - 1),
                                )
                            }
                        />
                    )}

                    <div className={styles.questionNav}>
                        <button
                            type="button"
                            className={styles.navButton}
                            disabled={currentIndex === 0}
                            onClick={() => setCurrentIndex((i) => i - 1)}
                        >
                            {t('exam.previous')}
                        </button>
                        <button
                            type="button"
                            className={styles.navButton}
                            disabled={currentIndex >= questions.length - 1}
                            onClick={() => setCurrentIndex((i) => i + 1)}
                        >
                            {t('exam.next')}
                        </button>
                    </div>
                </section>
            )}

            <section className={styles.submitPanel}>
                {isConfirming ? (
                    <div className={styles.confirm} role="alertdialog">
                        <h3>{t('exam.confirmSubmitTitle')}</h3>
                        <p>{t('exam.confirmSubmitBody')}</p>
                        {unanswered.length > 0 && (
                            <p className={styles.warning}>
                                {t('exam.confirmUnanswered', {
                                    count: unanswered.length,
                                    list: unanswered
                                        .map(
                                            (q) =>
                                                questions.indexOf(q) + 1,
                                        )
                                        .join(', '),
                                })}
                            </p>
                        )}
                        <div className={styles.confirmActions}>
                            <button
                                type="button"
                                className={styles.submitButton}
                                disabled={isSubmitting}
                                onClick={onSubmit}
                            >
                                {isSubmitting
                                    ? t('exam.submitting')
                                    : t('exam.confirmSubmit')}
                            </button>
                            <button
                                type="button"
                                className={styles.navButton}
                                disabled={isSubmitting}
                                onClick={() => setIsConfirming(false)}
                            >
                                {t('exam.keepWorking')}
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        type="button"
                        className={styles.submitButton}
                        onClick={() => setIsConfirming(true)}
                    >
                        {t('exam.submit')}
                    </button>
                )}
                {submitError ? (
                    <p className={styles.error}>
                        {getApiErrorMessage(submitError)}
                    </p>
                ) : null}
            </section>
        </div>
    );
}

function Countdown({
    startedAt,
    timeLimitMinutes,
}: {
    startedAt: string;
    timeLimitMinutes: number;
}) {
    const { t } = useTranslation();
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const timer = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(timer);
    }, []);

    const left = remainingTime(startedAt, timeLimitMinutes, now);

    return (
        <span
            className={styles.countdown}
            data-urgent={left < 5 * 60_000}
            role="timer"
        >
            {left > 0
                ? t('exam.timeLeft', { time: formatDuration(left) })
                : t('exam.timeUp')}
        </span>
    );
}
