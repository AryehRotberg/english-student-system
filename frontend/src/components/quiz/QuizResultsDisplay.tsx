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
};

export function QuizResultsDisplay({
    questions,
    answers,
    title,
    finalScore,
    totalPossible,
    gradePercent,
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
                >
                    {gradePercent}%
                </div>
                <div>
                    <p className={styles.gradeTitle}>{title}</p>
                    <p className={styles.gradeSub}>
                        Score: <strong>{finalScore.toFixed(2)}</strong> /{' '}
                        {totalPossible.toFixed(2)} points
                    </p>
                </div>
            </div>

            <div className={styles.questionList}>
                {questions.map((question) => {
                    const points =
                        pointsByQuestionId.get(question.questionId) ?? 0;
                    const isCorrect = points >= question.maxPoints;
                    const hasAnswer = answers.some(
                        (a) => a.questionId === question.questionId,
                    );

                    const cardClass = !hasAnswer
                        ? styles.cardUnanswered
                        : isCorrect
                          ? styles.cardCorrect
                          : styles.cardWrong;

                    return (
                        <div
                            className={`${styles.card} ${cardClass}`}
                            key={question.id}
                        >
                            <div className={styles.cardTop}>
                                <span className={styles.cardNum}>
                                    Q{question.questionNumber}
                                </span>
                                <span
                                    className={
                                        !hasAnswer
                                            ? styles.badgeUnanswered
                                            : isCorrect
                                              ? styles.badgeCorrect
                                              : styles.badgeWrong
                                    }
                                >
                                    {!hasAnswer
                                        ? 'Unanswered'
                                        : isCorrect
                                          ? 'Correct'
                                          : 'Wrong'}
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
