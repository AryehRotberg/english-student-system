import { useNavigate } from 'react-router-dom';
import { useQuizzes } from '../../hooks/queries';
import styles from './QuizListPage.module.css';

export function QuizListPage() {
    const navigate = useNavigate();
    const { data: quizzes = [] } = useQuizzes();

    return (
        <section className={styles.panel}>
            <h2 className={styles.heading}>Available Quizzes</h2>
            <p className={styles.subtitle}>Choose a quiz to start.</p>

            <div className={styles.grid}>
                {quizzes.map((quiz) => (
                    <button
                        className={styles.card}
                        key={quiz.id}
                        onClick={() => navigate(`/quiz/${quiz.id}`)}
                        type="button"
                    >
                        <h3 className={styles.title}>{quiz.title}</h3>
                        <p className={styles.description}>{quiz.description || 'No description.'}</p>
                        <span className={styles.cta}>Start Quiz</span>
                    </button>
                ))}
            </div>

            {quizzes.length === 0 ? <p className={styles.empty}>No quizzes found.</p> : null}
        </section>
    );
}
