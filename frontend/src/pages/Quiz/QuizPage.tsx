import { useParams } from 'react-router-dom';
import { QuizPageContent } from '../../components/quiz/QuizPageContent';
import { useQuiz } from '../../hooks/queries';

export function QuizPage() {
    const { quizId } = useParams<{ quizId: string }>();
    const { data: quiz } = useQuiz(quizId);

    if (!quizId) {
        return null;
    }

    return (
        <QuizPageContent
            key={quizId}
            quizId={quizId}
            quizTitle={quiz?.title ?? ''}
            quiz={quiz}
        />
    );
}
