import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizzes } from '../../hooks/queries';
import styles from './QuizListPage.module.css';

export function QuizListPage() {
    const navigate = useNavigate();
    const { data: quizzes = [] } = useQuizzes();
    const [filterQuery, setFilterQuery] = useState('');

    const filtered = filterQuery.trim()
        ? quizzes.filter((q) =>
              q.title.toLowerCase().includes(filterQuery.toLowerCase()),
          )
        : quizzes;

    return (
        <div className={styles.page}>
            <section className={styles.content}>
                <div className={styles.introRow}>
                    <div>
                        <h1 className={styles.heading}>Available Quizzes</h1>
                        <p className={styles.subtitle}>
                            Select a quiz to test your knowledge and track your
                            progress.
                        </p>
                    </div>
                    <div className={styles.filterWrap}>
                        <svg
                            className={styles.filterIcon}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                            width="18"
                            height="18"
                        >
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                            />
                        </svg>
                        <input
                            className={styles.filterInput}
                            type="search"
                            placeholder="Filter by title…"
                            value={filterQuery}
                            onChange={(e) => setFilterQuery(e.target.value)}
                            aria-label="Filter quizzes by title"
                        />
                    </div>
                </div>

                {filtered.length > 0 ? (
                    <div className={styles.grid}>
                        {filtered.map((quiz) => (
                            <article className={styles.card} key={quiz.id}>
                                <h3 className={styles.title}>{quiz.title}</h3>
                                <p className={styles.description}>
                                    {quiz.description || 'No description.'}
                                </p>

                                <button
                                    className={styles.cta}
                                    onClick={() => navigate(`/quiz/${quiz.id}`)}
                                    type="button"
                                >
                                    <svg
                                        className={styles.ctaIcon}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            clipRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                        />
                                    </svg>
                                    Start Quiz
                                </button>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyWrap}>
                        <p className={styles.empty}>
                            {filterQuery.trim()
                                ? 'No quizzes match your search.'
                                : 'No quizzes found.'}
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
}
