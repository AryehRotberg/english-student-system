import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { useParams } from "react-router-dom";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { QuizAttemptHistoryPanel } from "../../components/quiz/QuizAttemptHistoryPanel";
import { QuizCard } from "../../components/quiz/QuizCard";
import { QuizResultsPanel } from "../../components/quiz/QuizResultsPanel";
import {
    useAuthUser,
    useQuizAttemptId,
    useQuizAttempts,
    useQuizQuestions,
    useQuizTopics,
    useStudentAnswersByAttempt,
} from "../../hooks/queries";
import { assignmentEmailService } from "../../services/assignment-email.service";
import { quizAttemptsService } from "../../services/quiz-attempts.service";
import type { QuizTopic } from "../../types/quiz";
import styles from "./QuizPage.module.css";

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

export function QuizPage() {
    const { quizId } = useParams<{ quizId: string }>();

    if (!quizId) {
        return null;
    }

    return <QuizPageContent key={quizId} quizId={quizId} />;
}

type QuizPageContentProps = {
    quizId: string;
};

function QuizPageContent({ quizId }: QuizPageContentProps) {
    const [isCompleted, setIsCompleted] = useState(false);
    const [viewAttemptId, setViewAttemptId] = useState<string | null>(null);
    const [selectedTopic, setSelectedTopic] = useState<QuizTopic | null>(null);

    const { data: user } = useAuthUser();
    const { data: questions } = useQuizQuestions(quizId);
    const { data: topics = [] } = useQuizTopics(quizId);
    const { data: attemptId, isLoading: isAttemptLoading } = useQuizAttemptId(
        quizId,
        user?.id,
    );
    const { data: attempts = [], refetch: refetchAttempts } = useQuizAttempts(
        quizId,
        user?.id,
    );

    // Always load active attempt answers so we can resume where the student left off.
    const { data: activeAttemptAnswers = [] } =
        useStudentAnswersByAttempt(attemptId);

    const selectedAttemptId =
        viewAttemptId ?? (isCompleted ? attemptId : undefined);
    const { data: viewedStudentAnswers = [] } =
        useStudentAnswersByAttempt(selectedAttemptId);

    if (
        !quizId ||
        !questions ||
        questions.length === 0 ||
        isAttemptLoading ||
        !attemptId
    ) {
        return null;
    }

    const currentIndex = (() => {
        if (isCompleted || Boolean(viewAttemptId)) {
            return Math.max(0, questions.length - 1);
        }

        const answeredQuestionIds = new Set(
            activeAttemptAnswers.map((answer) => answer.questionId),
        );
        const firstUnansweredIndex = questions.findIndex(
            (question) => !answeredQuestionIds.has(question.questionId),
        );

        if (firstUnansweredIndex === -1) {
            return Math.max(0, questions.length - 1);
        }

        return firstUnansweredIndex;
    })();
    const currentQuestion =
        questions[Math.min(currentIndex, questions.length - 1)];

    const handleQuestionSubmitted = async () => {
        const isLastQuestion = currentIndex >= questions.length - 1;

        if (!isLastQuestion) {
            return;
        }

        setIsCompleted(true);

        if (user?.id) {
            await quizAttemptsService.update(attemptId, {
                quizId,
                userId: user.id,
                completedAt: new Date().toISOString(),
            });

            await assignmentEmailService.sendCompletionEmail(attemptId);

            await refetchAttempts();

            setViewAttemptId(attemptId);
        }
    };

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

    const selectedAttemptPoints = selectedAttempt?.points ?? null;
    const isCurrentAttemptResult = selectedAttemptId === attemptId;
    const finalScore = isCurrentAttemptResult
        ? earned
        : selectedAttemptPoints === null
          ? earned
          : Number(selectedAttemptPoints);
    const gradePercent =
        totalPossible > 0 ? Math.round((finalScore / totalPossible) * 100) : 0;

    const completedAttempts = attempts.filter(
        (attempt) => attempt.completedAt !== null,
    );
    const isViewingResults = Boolean(selectedAttemptId);
    const handleViewAttempt = (selectedAttemptIdValue: string) => {
        setViewAttemptId(selectedAttemptIdValue);
        setIsCompleted(false);
    };
    const handleBackToCurrentQuiz = () => {
        setViewAttemptId(null);
        setIsCompleted(false);
    };

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
                <>
                    <QuizCard
                        key={currentQuestion.id}
                        attemptId={attemptId}
                        question={currentQuestion}
                        onSubmitted={() => void handleQuestionSubmitted()}
                        isLastQuestion={currentIndex >= questions.length - 1}
                    />
                    <QuizAttemptHistoryPanel
                        attempts={completedAttempts}
                        onViewAttempt={handleViewAttempt}
                    />
                </>
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
