import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
    CatalogEmpty,
    CatalogGroup,
    CatalogHero,
    DuePill,
    SearchField,
} from '../../components/hub/Catalog';
import styles from '../../components/hub/Catalog.module.css';
import { QuizCategoryTile } from '../../components/hub/ContentTile';
import {
    ArrowForwardIcon,
    ChecklistIcon,
    ChevronForwardIcon,
    ClockIcon,
    UserIcon,
} from '../../components/hub/icons';
import { quizCategoryTone, toneClass } from '../../components/hub/tones';
import { useCurrentSubject } from '../../contexts/subject-context';
import { useQuizzes } from '../../hooks/queries';
import { byAssignedDue, useAssignedContent } from '../../hooks/useAssignedContent';
import type { QuizCategory, QuizSummary } from '../../types/quiz';
import { isPastDue } from '../../utils/assignments';
import { levelName, subjectName } from '../../utils/subjects';

const CATEGORIES: QuizCategory[] = [
    'grammar',
    'vocabulary',
    'reading',
    'listening',
    'custom',
];

function QuizFacts({ quiz }: { quiz: QuizSummary }) {
    const { t } = useTranslation();

    return (
        <div className={styles.facts}>
            {quiz.timeLimitMinutes && (
                <span className={styles.fact}>
                    <ClockIcon size={15} />
                    {t('quizList.timeLimit', {
                        minutes: quiz.timeLimitMinutes,
                    })}
                </span>
            )}
            {quiz.questionsToAnswer && (
                <span className={styles.fact}>
                    <ChecklistIcon size={15} />
                    {t('quizList.answerNofM', {
                        count: quiz.questionsToAnswer,
                    })}
                </span>
            )}
            {quiz.gradingMode === 'teacher' ? (
                <span className={styles.fact}>
                    <UserIcon size={15} />
                    {t('quizList.teacherGraded')}
                </span>
            ) : (
                <span className={styles.fact}>{t('quizList.selfChecked')}</span>
            )}
        </div>
    );
}

export function QuizListPage() {
    const { t, i18n } = useTranslation();
    const { currentSubject, currentLevel, isEnglish } = useCurrentSubject();
    const [filterQuery, setFilterQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<QuizCategory | ''>('');
    // Starts at the student's own level when the teacher set one.
    const [levelFilter, setLevelFilter] = useState<string>(
        currentLevel?.id ?? '',
    );

    const subjectFilter = currentSubject ? { subjectId: currentSubject.id } : {};
    const { data: allQuizzes = [] } = useQuizzes(subjectFilter);
    const { data: quizzes = [], isLoading } = useQuizzes({
        ...subjectFilter,
        ...(isEnglish && categoryFilter && { category: categoryFilter }),
        ...(levelFilter && { levelId: levelFilter }),
    });
    const dueByQuiz = useAssignedContent('quiz');

    const term = filterQuery.trim().toLowerCase();
    const shown = term
        ? quizzes.filter((q) => q.title.toLowerCase().includes(term))
        : quizzes;
    const assigned = shown
        .filter((quiz) => dueByQuiz.has(quiz.id))
        .sort(byAssignedDue(dueByQuiz));
    const library = shown.filter((quiz) => !dueByQuiz.has(quiz.id));
    const totalAssigned = allQuizzes.filter((quiz) =>
        dueByQuiz.has(quiz.id),
    ).length;
    const isFiltered = Boolean(term || categoryFilter || levelFilter);
    const levels = currentSubject?.levels ?? [];

    const clearFilters = () => {
        setFilterQuery('');
        setCategoryFilter('');
        setLevelFilter('');
    };

    return (
        <div className={styles.page}>
            <CatalogHero
                id="quiz-page-heading"
                breadcrumb={
                    currentSubject && (
                        <>
                            {t('nav.practice')} <span aria-hidden="true">/</span>{' '}
                            {subjectName(currentSubject, i18n.language)}
                        </>
                    )
                }
                title={
                    isEnglish
                        ? t('quizList.heading')
                        : t('quizList.headingExams')
                }
                subtitle={t('quizList.subtitle')}
                stats={[
                    { label: t('catalog.statAssigned'), value: totalAssigned },
                    {
                        label: t('quizList.statAvailable'),
                        value: allQuizzes.length,
                    },
                ]}
            />

            <div className={styles.filterBar} role="search">
                <SearchField
                    value={filterQuery}
                    onChange={setFilterQuery}
                    placeholder={t('quizList.filterTitle')}
                    ariaLabel={t('quizList.filterTitleAria')}
                />

                {isEnglish && (
                    <div
                        className={styles.chips}
                        role="group"
                        aria-label={t('quizList.categoryAria')}
                    >
                        {(['', ...CATEGORIES] as const).map((category) => (
                            <button
                                key={category || 'all'}
                                type="button"
                                className={styles.chip}
                                aria-pressed={categoryFilter === category}
                                onClick={() => setCategoryFilter(category)}
                            >
                                {category && (
                                    <span
                                        aria-hidden="true"
                                        className={`${styles.chipDot} ${styles[`dot_${quizCategoryTone[category]}`]}`}
                                    />
                                )}
                                {category
                                    ? t(`quizList.categories.${category}`)
                                    : t('quizList.allCategories')}
                            </button>
                        ))}
                    </div>
                )}

                {levels.length > 0 && (
                    <div className={styles.selectField}>
                        <label htmlFor="quiz-level" className={styles.selectLabel}>
                            {t('quizList.level')}
                        </label>
                        <select
                            id="quiz-level"
                            className={styles.select}
                            value={levelFilter}
                            onChange={(e) => setLevelFilter(e.target.value)}
                        >
                            <option value="">{t('quizList.allLevels')}</option>
                            {levels.map((level) => (
                                <option key={level.id} value={level.id}>
                                    {level.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {assigned.length > 0 && (
                <CatalogGroup
                    id="assigned-heading"
                    title={t('catalog.assignedHeading')}
                    countLabel={t('quizList.count', { count: assigned.length })}
                >
                    <div className={styles.assignedGrid}>
                        {assigned.map((quiz) => {
                            const due = dueByQuiz.get(quiz.id) ?? null;

                            return (
                                <article key={quiz.id} className={styles.assignedCard}>
                                    <div className={styles.cardTop}>
                                        <div className={styles.homework}>
                                            <QuizCategoryTile
                                                category={isEnglish ? quiz.category : null}
                                                size="sm"
                                            />
                                            <span className={styles.homeworkLabel}>
                                                {t('catalog.homework')}
                                            </span>
                                        </div>
                                        {due && (
                                            <DuePill due={due} overdue={isPastDue(due)} />
                                        )}
                                    </div>
                                    <div className={styles.cardText}>
                                        <h3 className={styles.assignedTitle} dir="auto">
                                            {quiz.title}
                                        </h3>
                                        {quiz.description && (
                                            <p className={styles.description} dir="auto">
                                                {quiz.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className={styles.assignedFoot}>
                                        <QuizFacts quiz={quiz} />
                                        <Link
                                            to={`/quiz/${quiz.id}`}
                                            className={styles.primaryButton}
                                            aria-label={t('quizList.startAria', {
                                                title: quiz.title,
                                            })}
                                        >
                                            {t('quizList.start')}
                                            <ArrowForwardIcon className={styles.flipRtl} />
                                        </Link>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </CatalogGroup>
            )}

            <CatalogGroup
                id="library-heading"
                title={t('quizList.practiceHeading')}
                countLabel={t('quizList.count', { count: library.length })}
            >
                {library.length > 0 ? (
                    <div className={styles.libraryGrid}>
                        {library.map((quiz) => {
                            const level = levelName(currentSubject, quiz.levelId);

                            return (
                                <article key={quiz.id} className={styles.libraryCard}>
                                    <div className={styles.cardTop}>
                                        <QuizCategoryTile
                                            category={isEnglish ? quiz.category : null}
                                        />
                                        <div className={styles.badges}>
                                            {isEnglish && (
                                                <span
                                                    className={`${styles.badge} ${toneClass[quizCategoryTone[quiz.category]]}`}
                                                >
                                                    {t(`quizList.categories.${quiz.category}`)}
                                                </span>
                                            )}
                                            {level && (
                                                <span className={styles.levelBadge}>
                                                    {level}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className={styles.cardText}>
                                        <h3 className={styles.libraryTitle} dir="auto">
                                            {quiz.title}
                                        </h3>
                                        {quiz.description && (
                                            <p className={styles.descriptionSm} dir="auto">
                                                {quiz.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className={styles.libraryFoot}>
                                        <QuizFacts quiz={quiz} />
                                        <Link
                                            to={`/quiz/${quiz.id}`}
                                            className={styles.softButton}
                                            aria-label={t('quizList.startAria', {
                                                title: quiz.title,
                                            })}
                                        >
                                            {t('quizList.startShort')}
                                            <ChevronForwardIcon
                                                size={16}
                                                className={styles.flipRtl}
                                            />
                                        </Link>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : assigned.length > 0 ? (
                    <p className={styles.groupEmpty}>{t('quizList.allAssigned')}</p>
                ) : isLoading ? (
                    <p className={styles.groupEmpty} role="status">
                        {t('common.loading')}
                    </p>
                ) : (
                    <CatalogEmpty
                        title={
                            isFiltered ? t('quizList.noMatch') : t('quizList.none')
                        }
                        hint={isFiltered ? t('quizList.noMatchHint') : undefined}
                        onClear={isFiltered ? clearFilters : undefined}
                    />
                )}
            </CatalogGroup>
        </div>
    );
}
