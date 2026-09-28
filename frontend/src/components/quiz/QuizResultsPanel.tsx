import { useTranslation } from 'react-i18next';
import styles from '../../pages/Quiz/QuizPage.module.css';
import type { AnswerFile } from '../../services/answer-files.service';
import type { StudentAnswerApiItem } from '../../services/student-answers.service';
import type { QuizAttemptApiItem } from '../../types/api-items/quiz-attempt';
import type { QuizQuestion } from '../../types/quiz';
import { isHandwritten } from '../../utils/exam';
import { QuizAttemptHistoryPanel } from './QuizAttemptHistoryPanel';
import { QuizResultsDisplay } from './QuizResultsDisplay';

type Props = {
    questions: QuizQuestion[];
    answers: StudentAnswerApiItem[];
    files: AnswerFile[];
    isCompleted: boolean;
    gradePercent: number;
    finalScore: number;
    totalPossible: number;
    completedAttempts: QuizAttemptApiItem[];
    isPendingReview: boolean;
    onBackToCurrentQuiz: () => void;
    onViewAttempt: (attemptId: string) => void;
};

export function QuizResultsPanel({
    questions,
    answers,
    files,
    isCompleted,
    gradePercent,
    finalScore,
    totalPossible,
    completedAttempts,
    isPendingReview,
    onBackToCurrentQuiz,
    onViewAttempt,
}: Props) {
    const { t } = useTranslation();
    const isExam = questions.some(isHandwritten);

    const completedMessage = isExam
        ? t('results.submittedForGrading')
        : isPendingReview
          ? t('results.answeredAllTeacher', { count: questions.length })
          : t('results.answeredAll', { count: questions.length });

    return (
        <section className={styles.completedPanel}>
            <h2>{isCompleted ? t('results.completed') : t('results.results')}</h2>
            <p>{isCompleted ? completedMessage : t('results.reviewPrevious')}</p>

            <QuizResultsDisplay
                questions={questions}
                answers={answers}
                files={files}
                title={t('results.title')}
                finalScore={finalScore}
                totalPossible={totalPossible}
                gradePercent={gradePercent}
                isPendingReview={isPendingReview}
            />

            <button
                className={styles.resumeButton}
                onClick={onBackToCurrentQuiz}
                type="button"
            >
                {t('results.backToQuiz')}
            </button>

            <QuizAttemptHistoryPanel
                attempts={completedAttempts}
                onViewAttempt={onViewAttempt}
            />
        </section>
    );
}
