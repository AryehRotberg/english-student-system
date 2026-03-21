import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { QuizAttemptHistoryPanel } from "../../components/quiz/QuizAttemptHistoryPanel";
import { QuizCard } from "../../components/quiz/QuizCard";
import { QuizResultsPanel } from "../../components/quiz/QuizResultsPanel";
import {
    useStartQuizAttempt,
    useSubmitQuizAttempt,
} from "../../hooks/mutations";
import {
    useAuthUser,
    useQuizAttempts,
    useQuizQuestions,
    useQuizTopics,
    useStudentAnswersByAttempt
} from "../../hooks/queries";
import styles from "../../pages/Quiz/QuizPage.module.css";
import { assignmentEmailService } from "../../services/assignment-email.service";
import type { QuizTopic } from "../../types/quiz";

const SANITIZE_SCHEMA = {
    ...defaultSchema,
    tagNames: [
        ...(defaultSchema.tagNames || []),
        "table",
        "thead",
        "tbody",
        "tr",
        "td",
        "th",
    ],
    attributes: {
        ...defaultSchema.attributes,
        th: ["align"],
        td: ["align"],
    },
};

type QuizPageContentProps = {
    quizId: string;
};

export function QuizPageContent({ quizId }: QuizPageContentProps) {
    const [isCompleted, setIsCompleted] = useState(false);
    const [viewAttemptId, setViewAttemptId] = useState<string | null>(null);
    const [selectedTopic, setSelectedTopic] = useState<QuizTopic | null>(null);

    const hasAutoStarted = useRef(false);

    const { data: user } = useAuthUser();
    const { data: questions } = useQuizQuestions(quizId);
    const { data: topics = [] } = useQuizTopics(quizId);

    const { data: attempts = [], isLoading: isAttemptLoading } =
        useQuizAttempts(quizId, user?.id);
    const activeAttempt = attempts.find((a) => a.completedAt === null);
    const attemptId = activeAttempt?.id ?? null;

    const submitAttemptMutation = useSubmitQuizAttempt();
    const startAttemptMutation = useStartQuizAttempt();

    const { data: activeAttemptAnswers = [] } = useStudentAnswersByAttempt(
        attemptId ?? undefined,
    );

    const selectedAttemptId =
        viewAttemptId ?? (isCompleted ? attemptId : undefined);
    const { data: viewedStudentAnswers = [] } = useStudentAnswersByAttempt(
        selectedAttemptId ?? undefined,
    );

    useEffect(() => {
        if (
            !isAttemptLoading &&
            attempts.length === 0 &&
            user?.id &&
            !hasAutoStarted.current
        ) {
            hasAutoStarted.current = true;
            startAttemptMutation.mutate({ quizId, userId: user.id });
        }
    }, [
        isAttemptLoading,
        attempts.length,
        user?.id,
        quizId,
        startAttemptMutation,
    ]);

    if (!quizId || !questions || questions.length === 0 || isAttemptLoading) {
        return <p>Loading...</p>;
    }

    const completedAttempts = attempts.filter(
        (attempt) => attempt.completedAt !== null,
    );
    const isViewingResults = Boolean(selectedAttemptId);

    const handleStartOrRetake = async () => {
        if (user?.id) {
            setIsCompleted(false);
            setViewAttemptId(null);
            await startAttemptMutation.mutateAsync({ quizId, userId: user.id });
        }
    };

    const handleQuestionSubmitted = async () => {
        const answeredQuestionIds = new Set(
            activeAttemptAnswers.map((answer) => answer.questionId),
        );
        const firstUnansweredIndex = questions.findIndex(
            (q) => !answeredQuestionIds.has(q.questionId),
        );
        const currentIndex =
            firstUnansweredIndex === -1
                ? questions.length - 1
                : firstUnansweredIndex;

        const isLastQuestion = currentIndex >= questions.length - 1;

        if (!isLastQuestion || !attemptId) {
            return;
        }

        await submitAttemptMutation.mutateAsync(attemptId);

        setIsCompleted(true);
        setViewAttemptId(attemptId);

        if (user?.id) {
            await assignmentEmailService.sendCompletionEmail(attemptId);
        }
    };

    const handleViewAttempt = (id: string) => {
        setViewAttemptId(id);
        setIsCompleted(false);
    };

    const handleBackToCurrentQuiz = () => {
        setViewAttemptId(null);
        setIsCompleted(false);
    };

    if (!attemptId && !isViewingResults) {
        if (attempts.length === 0) {
            return (
                <div className={styles.stack}>
                    <section
                        className={styles.panel}
                        style={{ textAlign: "center", padding: "3rem" }}
                    >
                        <h2>Setting up your quiz...</h2>
                    </section>
                </div>
            );
        }

        return (
            <div className={styles.stack}>
                <section
                    className={styles.panel}
                    style={{ textAlign: "center", padding: "3rem" }}
                >
                    <h2>Ready to try again?</h2>
                    <p>You have {questions.length} questions to answer.</p>
                    <button
                        className={styles.nextButton}
                        onClick={() => void handleStartOrRetake()}
                        disabled={startAttemptMutation.isPending}
                        type="button"
                    >
                        {startAttemptMutation.isPending
                            ? "Starting..."
                            : "Retake Quiz"}
                    </button>
                </section>
                <QuizAttemptHistoryPanel
                    attempts={completedAttempts}
                    onViewAttempt={handleViewAttempt}
                />
            </div>
        );
    }

    const selectedAttempt =
        attempts.find((attempt) => attempt.id === selectedAttemptId) ?? null;
    const totalPossible = questions.reduce(
        (sum, question) => sum + question.maxPoints,
        0,
    );
    const earned = questions.reduce((sum, question) => {
        const studentAnswer = viewedStudentAnswers.find(
            (answer) => answer.questionId === question.questionId,
        );
        return sum + Number(studentAnswer?.points ?? 0);
    }, 0);

    const finalScore =
        selectedAttemptId === attemptId
            ? earned
            : Number(selectedAttempt?.points ?? earned);

    const gradePercent =
        totalPossible > 0 ? Math.round((finalScore / totalPossible) * 100) : 0;

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
                <QuizResultsPanel
                    questions={questions}
                    answers={viewedStudentAnswers}
                    isCompleted={isCompleted}
                    gradePercent={gradePercent}
                    finalScore={finalScore}
                    totalPossible={totalPossible}
                    completedAttempts={completedAttempts}
                    onBackToCurrentQuiz={handleBackToCurrentQuiz}
                    onViewAttempt={handleViewAttempt}
                />
            ) : (
                (() => {
                    const answeredQuestionIds = new Set(
                        activeAttemptAnswers.map((answer) => answer.questionId),
                    );
                    const firstUnansweredIndex = questions.findIndex(
                        (q) => !answeredQuestionIds.has(q.questionId),
                    );
                    const currentIndex =
                        firstUnansweredIndex === -1
                            ? questions.length - 1
                            : firstUnansweredIndex;
                    const currentQuestion = questions[currentIndex];

                    return (
                        <>
                            <QuizCard
                                key={currentQuestion.id}
                                attemptId={attemptId as string}
                                question={currentQuestion}
                                onSubmitted={() =>
                                    void handleQuestionSubmitted()
                                }
                                isLastQuestion={
                                    currentIndex >= questions.length - 1
                                }
                            />
                            <QuizAttemptHistoryPanel
                                attempts={completedAttempts}
                                onViewAttempt={handleViewAttempt}
                            />
                        </>
                    );
                })()
            )}

            {selectedTopic ? (
                <div
                    className={styles.topicModalOverlay}
                    onClick={() => setSelectedTopic(null)}
                    role="presentation"
                >
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
                                rehypePlugins={[
                                    [rehypeSanitize, SANITIZE_SCHEMA],
                                ]}
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
