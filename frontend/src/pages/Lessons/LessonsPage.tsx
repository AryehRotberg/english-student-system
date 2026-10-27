import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useCurrentSubject } from '../../contexts/subject-context';
import { useLessons } from '../../hooks/queries';
import { lessonTitle } from '../../types/lesson';
// Same cards, search box and button as the quiz list.
import styles from '../QuizList/QuizListPage.module.css';

export function LessonsPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { currentSubject } = useCurrentSubject();
    const [filterQuery, setFilterQuery] = useState('');
    const { data: lessons = [], isLoading } = useLessons(
        currentSubject?.id,
        Boolean(currentSubject),
    );

    // The API sorts by topic in syllabus order, then by the lesson's own order.
    const query = filterQuery.trim().toLowerCase();
    const filtered = query
        ? lessons.filter(
              (lesson) =>
                  lessonTitle(lesson).toLowerCase().includes(query) ||
                  lesson.topicName.toLowerCase().includes(query),
          )
        : lessons;

    return (
        <div className={styles.page}>
            <section className={styles.content}>
                <div className={styles.introRow}>
                    <div>
                        <h1 className={styles.heading}>{t('lessons.heading')}</h1>
                        <p className={styles.subtitle}>{t('lessons.subtitle')}</p>
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
                                placeholder={t('lessons.filterTitle')}
                                value={filterQuery}
                                onChange={(e) => setFilterQuery(e.target.value)}
                                aria-label={t('lessons.filterTitleAria')}
                            />
                        </div>
                    </div>
                </div>

                {filtered.length > 0 ? (
                    <div className={styles.grid}>
                        {filtered.map((lesson) => (
                            <article className={styles.card} key={lesson.id}>
                                <div className={styles.badges}>
                                    <span
                                        className={`${styles.badge} ${styles.cat_custom}`}
                                        dir="auto"
                                    >
                                        {lesson.topicName}
                                    </span>
                                    {lesson.materialCount > 0 && (
                                        <span className={styles.badge}>
                                            {t('lessons.files', {
                                                count: lesson.materialCount,
                                            })}
                                        </span>
                                    )}
                                </div>
                                <h3 className={styles.title} dir="auto">
                                    {lessonTitle(lesson)}
                                </h3>
                                <p className={styles.description} />

                                <button
                                    className={styles.cta}
                                    onClick={() => navigate(`/lessons/${lesson.id}`)}
                                    type="button"
                                >
                                    <svg
                                        className={styles.ctaIcon}
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                                    </svg>
                                    {t('lessons.open')}
                                </button>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyWrap}>
                        <p className={styles.empty}>
                            {isLoading
                                ? t('common.loading')
                                : query
                                  ? t('lessons.noMatch')
                                  : t('lessons.none')}
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
}
