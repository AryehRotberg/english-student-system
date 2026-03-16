import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import { useParams } from 'react-router-dom';
import { QuizCard } from '../../components/quiz/QuizCard';
import { quizAttemptsService } from '../../services/quiz-attempts.service';
import { useAuthUser, useQuizAttemptId, useQuizAttempts, useQuizQuestions, useQuizTopics, useStudentAnswersByAttempt } from '../../hooks/queries';
import type { QuizTopic } from '../../types/quiz';
import styles from './QuizPage.module.css';

export function QuizPage() {
    const { quizId } = useParams<{ quizId: string }>();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const [viewAttemptId, setViewAttemptId] = useState<string | null>(null);
    const [selectedTopic, setSelectedTopic] = useState<QuizTopic | null>(null);

    // Configure sanitize schema to allow table elements
    const sanitizeSchema = {
        ...defaultSchema,
        tagNames: [...(defaultSchema.tagNames || []), 'table', 'thead', 'tbody', 'tr', 'td', 'th'],
        attributes: {
            ...defaultSchema.attributes,
            th: ['align'],
            td: ['align'],
        },
    };

    const { data: user } = useAuthUser();
    const { data: questions } = useQuizQuestions(quizId);
    const { data: topics = [] } = useQuizTopics(quizId);
    const { data: attemptId, isLoading: isAttemptLoading } = useQuizAttemptId(quizId, user?.id);
    const { data: attempts = [], refetch: refetchAttempts } = useQuizAttempts(quizId, user?.id);

    const selectedAttemptId = viewAttemptId ?? (isCompleted ? attemptId : undefined);
    const { data: studentAnswers = [] } = useStudentAnswersByAttempt(selectedAttemptId);

    useEffect(() => {
        setCurrentIndex(0);
        setIsCompleted(false);
        setViewAttemptId(null);
        setSelectedTopic(null);
    }, [quizId]);

    if (!quizId || !questions || questions.length === 0 || isAttemptLoading || !attemptId) {
        return null;
    }

    const currentQuestion = questions[Math.min(currentIndex, questions.length - 1)];

    const handleQuestionSubmitted = async () => {
        const isLastQuestion = currentIndex >= questions.length - 1;

        if (!isLastQuestion) {
            setCurrentIndex((previous) => previous + 1);
            return;
        }

        setIsCompleted(true);

        if (user?.id) {
            await quizAttemptsService.update(attemptId, {
                quizId,
                userId: user.id,
                completedAt: new Date().toISOString(),
            });

            await refetchAttempts();

            setViewAttemptId(attemptId);
        }
    };

    const selectedAttempt = attempts.find((attempt) => attempt.id === selectedAttemptId) ?? null;
    const totalPossible = questions.reduce((sum, question) => sum + question.maxPoints, 0);
    const earned = questions.reduce((sum, question) => {
        const studentAnswer = studentAnswers.find((answer) => answer.questionId === question.questionId);
        return sum + Number(studentAnswer?.points ?? 0);
    }, 0);

    const selectedAttemptPoints = selectedAttempt?.points ?? null;
    const isCurrentAttemptResult = selectedAttemptId === attemptId;
    const finalScore = isCurrentAttemptResult
        ? earned
        : selectedAttemptPoints === null
            ? earned
            : Number(selectedAttemptPoints);
    const gradePercent = totalPossible > 0 ? Math.round((finalScore / totalPossible) * 100) : 0;

    const completedAttempts = attempts.filter((attempt) => attempt.completedAt !== null);
    const isViewingResults = Boolean(selectedAttemptId);

    return (
        <div className={styles.stack}>
            {topics.length > 0 ? (
                <section className={styles.topicSection}>
                    <h3>Topics for this quiz</h3>
                    <div className={styles.topicGrid}>
                        {topics.map((topic) => (
                            <button
                                className={styles.topicCard}
                                key={topic.id}
                                onClick={() => setSelectedTopic(topic)}
                                type="button"
                            >
                                <span>{topic.topic}</span>
                                <small>Open explanation</small>
                            </button>
                        ))}
                    </div>
                </section>
            ) : null}

            {isViewingResults ? (
                <section className={styles.completedPanel}>
                    <h2>{isCompleted ? 'Quiz completed' : 'Quiz results'}</h2>
                    <p>{isCompleted ? `You answered all ${questions.length} questions.` : 'Review a previous attempt result.'}</p>

                    <div className={styles.scoreSummary}>
                        <p className={styles.gradeLabel}>Grade: {gradePercent}%</p>
                        <p>
                            Score: {finalScore.toFixed(2)} / {totalPossible.toFixed(2)}
                        </p>
                    </div>

                    <ul className={styles.resultList}>
                        {questions.map((question) => {
                            const answer = studentAnswers.find((item) => item.questionId === question.questionId);
                            const isCorrect = Number(answer?.points ?? 0) >= question.maxPoints;

                            return (
                                <li className={styles.resultRow} key={question.id}>
                                    <div>
                                        <span className={styles.resultQuestion}>Question {question.questionNumber}</span>
                                        <p className={styles.resultPrompt}>{question.prompt}</p>
                                    </div>
                                    <span className={isCorrect ? styles.correct : styles.wrong}>
                                        {isCorrect ? 'Correct' : 'Wrong'}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>

                    <button
                        className={styles.resumeButton}
                        onClick={() => {
                            setViewAttemptId(null);
                            setIsCompleted(false);
                        }}
                        type="button"
                    >
                        Back to current quiz
                    </button>

                    {completedAttempts.length > 0 ? (
                        <section className={styles.historyPanel}>
                            <h3>Previous attempts</h3>
                            <ul className={styles.historyList}>
                                {completedAttempts.map((attempt) => {
                                    const completedAt = attempt.completedAt ? new Date(attempt.completedAt) : null;

                                    return (
                                        <li className={styles.historyRow} key={attempt.id}>
                                            <div>
                                                <strong>{completedAt ? completedAt.toLocaleString() : 'Completed attempt'}</strong>
                                                <p>Score: {Number(attempt.points ?? 0).toFixed(2)}</p>
                                            </div>
                                            <button
                                                className={styles.viewButton}
                                                onClick={() => {
                                                    setViewAttemptId(attempt.id);
                                                    setIsCompleted(false);
                                                }}
                                                type="button"
                                            >
                                                View results
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>
                    ) : null}
                </section>
            ) : (
                <>
                    <QuizCard
                        attemptId={attemptId}
                        question={currentQuestion}
                        onSubmitted={() => void handleQuestionSubmitted()}
                        isLastQuestion={currentIndex >= questions.length - 1}
                    />

                    {completedAttempts.length > 0 ? (
                        <section className={styles.historyPanel}>
                            <h3>Previous attempts</h3>
                            <ul className={styles.historyList}>
                                {completedAttempts.map((attempt) => {
                                    const completedAt = attempt.completedAt ? new Date(attempt.completedAt) : null;

                                    return (
                                        <li className={styles.historyRow} key={attempt.id}>
                                            <div>
                                                <strong>{completedAt ? completedAt.toLocaleString() : 'Completed attempt'}</strong>
                                                <p>Score: {Number(attempt.points ?? 0).toFixed(2)}</p>
                                            </div>
                                            <button
                                                className={styles.viewButton}
                                                onClick={() => {
                                                    setViewAttemptId(attempt.id);
                                                    setIsCompleted(false);
                                                }}
                                                type="button"
                                            >
                                                View results
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>
                    ) : null}
                </>
            )}

            {selectedTopic ? (
                <div className={styles.topicModalOverlay} onClick={() => setSelectedTopic(null)} role="presentation">
                    <section
                        aria-label="Topic explanation"
                        className={styles.topicModal}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className={styles.topicModalHeader}>
                            <h3>{selectedTopic.topic}</h3>
                            <button
                                aria-label="Close explanation"
                                className={styles.closeTopicButton}
                                onClick={() => setSelectedTopic(null)}
                                type="button"
                            >
                                Close
                            </button>
                        </div>

                        <div className={styles.topicMarkdown}>
                            <ReactMarkdown
                                rehypePlugins={[[rehypeSanitize, sanitizeSchema]]}
                                remarkPlugins={[remarkGfm]}
                            >
                                {selectedTopic.explanation}
                            </ReactMarkdown>
                        </div>
                    </section>
                </div>
            ) : null}
        </div>
    );
}
