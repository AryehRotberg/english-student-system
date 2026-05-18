import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizzes } from '../../hooks/queries';
import type { QuizCategory, ProficiencyLevel } from '../../types/quiz';
import styles from './QuizListPage.module.css';

const CATEGORY_LABELS: Record<QuizCategory, string> = {
    grammar: 'Grammar',
    vocabulary: 'Vocabulary',
    reading: 'Reading',
    listening: 'Listening',
    custom: 'Custom',
};

const LEVEL_LABELS: Record<ProficiencyLevel, string> = {
    A1: 'A1',
    A2: 'A2',
    B1: 'B1',
    B2: 'B2',
    C1: 'C1',
    C2: 'C2',
    any: 'Any',
};

export function QuizListPage() {
    const navigate = useNavigate();
    const [filterQuery, setFilterQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<QuizCategory | ''>('');
    const [levelFilter, setLevelFilter] = useState<ProficiencyLevel | ''>('');

    const { data: quizzes = [] } = useQuizzes({
        ...(categoryFilter && { category: categoryFilter }),
        ...(levelFilter && { level: levelFilter }),
    });

    const filtered = filterQuery.trim()
        ? quizzes.filter((q) =>
              q.title.toLowerCase().includes(filterQuery.toLowerCase()),
          )
        : quizzes;

    const hasActiveFilter = filterQuery.trim() || categoryFilter || levelFilter;

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
                    <div className={styles.filters}>
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
                        <select
                            className={styles.filterSelect}
                            value={categoryFilter}
                            onChange={(e) =>
                                setCategoryFilter(
                                    e.target.value as QuizCategory | '',
                                )
                            }
                            aria-label="Filter by category"
                        >
                            <option value="">All categories</option>
                            {(
                                Object.keys(CATEGORY_LABELS) as QuizCategory[]
                            ).map((cat) => (
                                <option key={cat} value={cat}>
                                    {CATEGORY_LABELS[cat]}
                                </option>
                            ))}
                        </select>
                        <select
                            className={styles.filterSelect}
                            value={levelFilter}
                            onChange={(e) =>
                                setLevelFilter(
                                    e.target.value as ProficiencyLevel | '',
                                )
                            }
                            aria-label="Filter by level"
                        >
                            <option value="">All levels</option>
                            {(
                                Object.keys(LEVEL_LABELS) as ProficiencyLevel[]
                            ).map((lvl) => (
                                <option key={lvl} value={lvl}>
                                    {LEVEL_LABELS[lvl]}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {filtered.length > 0 ? (
                    <div className={styles.grid}>
                        {filtered.map((quiz) => (
                            <article className={styles.card} key={quiz.id}>
                                <div className={styles.badges}>
                                    <span
                                        className={`${styles.badge} ${styles[`cat_${quiz.category}`]}`}
                                    >
                                        {CATEGORY_LABELS[quiz.category]}
                                    </span>
                                    {quiz.level !== 'any' && (
                                        <span className={styles.badge}>
                                            {quiz.level}
                                        </span>
                                    )}
                                </div>
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
                            {hasActiveFilter
                                ? 'No quizzes match your filters.'
                                : 'No quizzes found.'}
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
}
