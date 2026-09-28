import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSubmitStudentAnswer } from '../../hooks/mutations';
import type { QuizQuestion } from '../../types/quiz';
import { isUuid } from '../../utils/isUuid';
import { QuestionImage } from '../content/QuestionImage';
import { RichText } from '../content/RichText';
import { QuestionAudioButton } from './QuestionAudioButton';
import styles from './QuizCard.module.css';

type QuizCardProps = {
    attemptId: string;
    question: QuizQuestion;
    isLastQuestion: boolean;
    onSubmitted: () => void;
    // Inside the exam view, which shows its own question header and navigation.
    embedded?: boolean;
};

export function QuizCard({
    attemptId,
    question,
    isLastQuestion,
    onSubmitted,
    embedded = false,
}: QuizCardProps) {
    const { t } = useTranslation();
    const [selectedOptionId, setSelectedOptionId] = useState<string>('');
    const [blankAnswers, setBlankAnswers] = useState<string[]>(
        Array.from({ length: question.blankCount || 1 }, () => ''),
    );
    const submitMutation = useSubmitStudentAnswer();
    // Older questions have no stored type; they are multiple choice when they
    // have options.
    const isMultipleChoice = question.questionType
        ? question.questionType === 'multiple_choice'
        : question.options.length > 0;
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
            selectedOptionId: isMultipleChoice ? selectedOptionId : null,
            textAnswers: isMultipleChoice ? null : blankAnswers,
        });

        onSubmitted();
    };

    const Container = embedded ? 'div' : 'section';

    return (
        <Container className={embedded ? undefined : styles.panel}>
            {!embedded && (
                <p className={styles.counter}>
                    {t('quiz.questionOf', {
                        number: question.questionNumber,
                        total: question.totalQuestions,
                    })}
                </p>
            )}

            <div className={styles.promptRow}>
                <RichText
                    className={styles.prompt}
                    content={question.prompt}
                    format={question.contentFormat}
                />
                <QuestionAudioButton questionId={question.questionId} />
            </div>

            <QuestionImage
                questionId={question.questionId}
                hasImage={question.hasImage}
            />

            {question.hints && (
                <p className={styles.hints} dir="auto">
                    {t('quiz.hint', { hint: question.hints })}
                </p>
            )}

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
                            <span dir="auto">{option.label}</span>
                        </label>
                    ))}
                </div>
            ) : (
                <div className={styles.openEndedList}>
                    {blankAnswers.map((answer, index) => (
                        <input
                            className={styles.openEndedInput}
                            dir="auto"
                            key={`blank-${index + 1}`}
                            onChange={(event) => {
                                const nextAnswers = [...blankAnswers];
                                nextAnswers[index] = event.target.value;
                                setBlankAnswers(nextAnswers);
                            }}
                            placeholder={t('quiz.blank', { number: index + 1 })}
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
                    ? t('quiz.submitting')
                    : embedded
                      ? t('common.save')
                      : isLastQuestion
                        ? t('quiz.finish')
                        : t('quiz.next')}
            </button>

            {!isUuid(attemptId) ? (
                <p className={styles.error}>{t('quiz.invalidAttempt')}</p>
            ) : null}

            {submitMutation.isError ? (
                <p className={styles.error}>
                    {t('quiz.submitFailed', {
                        message: (submitMutation.error as Error).message,
                    })}
                </p>
            ) : null}
        </Container>
    );
}
