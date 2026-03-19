import { useState } from "react";
import { useSubmitStudentAnswer } from "../../hooks/mutations";
import type { QuizQuestion } from "../../types/quiz";
import styles from "./QuizCard.module.css";

function isUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        value,
    );
}

type QuizCardProps = {
    attemptId: string;
    question: QuizQuestion;
    isLastQuestion: boolean;
    onSubmitted: () => void;
};

export function QuizCard({
    attemptId,
    question,
    isLastQuestion,
    onSubmitted,
}: QuizCardProps) {
    const [selectedOptionId, setSelectedOptionId] = useState<string>("");
    const [blankAnswers, setBlankAnswers] = useState<string[]>(
        Array.from({ length: question.blankCount || 1 }, () => ""),
    );
    const submitMutation = useSubmitStudentAnswer();
    const isMultipleChoice = question.options.length > 0;
    const hasOpenEndedAnswers = blankAnswers.every(
        (answer) => answer.trim().length > 0,
    );
    const canSubmit =
        isUuid(attemptId) &&
        (isMultipleChoice ? selectedOptionId.length > 0 : hasOpenEndedAnswers);

    const handleNext = async () => {
        if (!canSubmit) return;

        await submitMutation.mutateAsync({
            attemptId,
            questionId: question.questionId,
            selectedOptionId: isMultipleChoice ? selectedOptionId : undefined,
            answers: isMultipleChoice ? undefined : blankAnswers,
        });

        onSubmitted();
    };

    return (
        <section className={styles.panel}>
            <p className={styles.counter}>
                Question {question.questionNumber} / {question.totalQuestions}
            </p>

            <h2 className={styles.prompt}>{question.prompt}</h2>

            {isMultipleChoice ? (
                <div className={styles.options}>
                    {question.options.map((option) => (
                        <label key={option.id} className={styles.option}>
                            <input
                                checked={selectedOptionId === option.id}
                                name="quiz-option"
                                onChange={() => setSelectedOptionId(option.id)}
                                type="radio"
                                value={option.id}
                            />
                            <span>{option.label}</span>
                        </label>
                    ))}
                </div>
            ) : (
                <div className={styles.openEndedList}>
                    {blankAnswers.map((answer, index) => (
                        <input
                            className={styles.openEndedInput}
                            key={`blank-${index + 1}`}
                            onChange={(event) => {
                                const nextAnswers = [...blankAnswers];
                                nextAnswers[index] = event.target.value;
                                setBlankAnswers(nextAnswers);
                            }}
                            placeholder={`Blank ${index + 1}`}
                            type="text"
                            value={answer}
                        />
                    ))}
                </div>
            )}

            <button
                className={styles.nextButton}
                onClick={() => void handleNext()}
                type="button"
                disabled={!canSubmit || submitMutation.isPending}
            >
                {submitMutation.isPending
                    ? "Submitting..."
                    : isLastQuestion
                      ? "Finish Quiz"
                      : "Next"}
            </button>

            {!isUuid(attemptId) ? (
                <p className={styles.error}>
                    Invalid quiz setup: missing a valid quiz attempt ID from
                    backend.
                </p>
            ) : null}

            {submitMutation.isError ? (
                <p className={styles.error}>
                    Submission failed: {(submitMutation.error as Error).message}
                </p>
            ) : null}
        </section>
    );
}
