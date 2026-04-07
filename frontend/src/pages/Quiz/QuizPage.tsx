import { useParams } from "react-router-dom";
import { QuizPageContent } from "../../components/quiz/QuizPageContent";
import { useQuizzes } from "../../hooks/queries";

export function QuizPage() {
    const { quizId } = useParams<{ quizId: string }>();
    const { data: quizzes = [] } = useQuizzes();

    if (!quizId) {
        return null;
    }

    const quiz = quizzes.find((q) => q.id === quizId);
    const quizTitle = quiz?.title ?? "";

    return (
        <QuizPageContent key={quizId} quizId={quizId} quizTitle={quizTitle} />
    );
}
