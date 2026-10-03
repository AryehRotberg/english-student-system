import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useCurrentSubject } from '../../contexts/subject-context';
import { useQuizzes } from '../../hooks/queries';
import type { QuizCategory } from '../../types/quiz';
import { levelName } from '../../utils/subjects';
import styles from './QuizListPage.module.css';

const CATEGORIES: QuizCategory[] = [
    'grammar',
    'vocabulary',
    'reading',
    'listening',
    'custom',
];

export function QuizListPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { currentSubject, currentLevel, isEnglish } = useCurrentSubject();
    const [filterQuery, setFilterQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<QuizCategory | ''>('');
    // Starts at the student's own level when the teacher set one.
    const [levelFilter, setLevelFilter] = useState<string>(
        currentLevel?.id ?? '',
    );

    const { data: quizzes = [] } = useQuizzes({
        ...(currentSubject && { subjectId: currentSubject.id }),
        ...(isEnglish && categoryFilter && { category: categoryFilter }),
        ...(levelFilter && { levelId: levelFilter }),
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
                        <h1 className={styles.heading}>
                            {isEnglish
                                ? t('quizList.heading')
                                : t('quizList.headingExams')}
                        </h1>
                        <p className={styles.subtitle}>
                            {t('quizList.subtitle')}
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
                                placeholder={t('quizList.filterTitle')}
                                value={filterQuery}
                                onChange={(e) => setFilterQuery(e.target.value)}
                                aria-label={t('quizList.filterTitleAria')}
                            />
                        </div>
                        {isEnglish && (
                            <select
                                className={styles.filterSelect}
                                value={categoryFilter}
                                onChange={(e) =>
                                    setCategoryFilter(
                                        e.target.value as QuizCategory | '',
                                    )
                                }
                                aria-label={t('quizList.categoryAria')}
                            >
                                <option value="">
                                    {t('quizList.allCategories')}
                                </option>
                                {CATEGORIES.map((category) => (
                                    <option key={category} value={category}>
                                        {t(`quizList.categories.${category}`)}
                                    </option>
                                ))}
                            </select>
                        )}
                        {currentSubject && currentSubject.levels.length > 0 && (
                            <select
                                className={styles.filterSelect}
                                value={levelFilter}
                                onChange={(e) => setLevelFilter(e.target.value)}
                                aria-label={t('quizList.levelAria')}
                            >
                                <option value="">
                                    {t('quizList.allLevels')}
                                </option>
                                {currentSubject.levels.map((level) => (
                                    <option key={level.id} value={level.id}>
                                        {level.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>

                {filtered.length > 0 ? (
                    <div className={styles.grid}>
                        {filtered.map((quiz) => {
                            const level = levelName(
                                currentSubject,
                                quiz.levelId,
                            );

                            return (
                                <article className={styles.card} key={quiz.id}>
                                    <div className={styles.badges}>
                                        {isEnglish && (
                                            <span
                                                className={`${styles.badge} ${styles[`cat_${quiz.category}`]}`}
                                            >
                                                {t(
                                                    `quizList.categories.${quiz.category}`,
                                                )}
                                            </span>
                                        )}
                                        {level && (
                                            <span className={styles.badge}>
                                                {level}
                                            </span>
                                        )}
                                        {quiz.gradingMode === 'teacher' && (
                                            <span className={styles.badge}>
                                                {t('quizList.teacherGraded')}
                                            </span>
                                        )}
                                        {quiz.questionsToAnswer && (
                                            <span className={styles.badge}>
                                                {t('quizList.answerNofM', {
                                                    count: quiz.questionsToAnswer,
                                                })}
                                            </span>
                                        )}
                                        {quiz.timeLimitMinutes && (
                                            <span className={styles.badge}>
                                                {t('quizList.timeLimit', {
                                                    minutes:
                                                        quiz.timeLimitMinutes,
                                                })}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className={styles.title} dir="auto">
                                        {quiz.title}
                                    </h3>
                                    <p className={styles.description} dir="auto">
                                        {quiz.description ||
                                            t('quizList.noDescription')}
                                    </p>

                                    <button
                                        className={styles.cta}
                                        onClick={() =>
                                            navigate(`/quiz/${quiz.id}`)
                                        }
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
                                        {t('quizList.start')}
                                    </button>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className={styles.emptyWrap}>
                        <p className={styles.empty}>
                            {hasActiveFilter
                                ? t('quizList.noMatch')
                                : t('quizList.none')}
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
}
