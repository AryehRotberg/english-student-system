import { useParams } from "react-router-dom";
import { QuizPageContent } from "../../components/quiz/QuizPageContent";

export function QuizPage() {
    const { quizId } = useParams<{ quizId: string }>();

    if (!quizId) {
        return null;
    }

    return <QuizPageContent key={quizId} quizId={quizId} />;
}
