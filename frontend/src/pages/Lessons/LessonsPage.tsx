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
import { ContentTypeTile } from '../../components/hub/ContentTile';
import {
    ArrowForwardIcon,
    ChevronForwardIcon,
    ListIcon,
} from '../../components/hub/icons';
import { toneClass } from '../../components/hub/tones';
import { useCurrentSubject } from '../../contexts/subject-context';
import { useLessons } from '../../hooks/queries';
import { byAssignedDue, useAssignedContent } from '../../hooks/useAssignedContent';
import type { LessonSummary } from '../../types/lesson';
import { lessonTitle } from '../../types/lesson';
import { isPastDue } from '../../utils/assignments';
import { subjectName } from '../../utils/subjects';

function FileCount({ lesson }: { lesson: LessonSummary }) {
    const { t } = useTranslation();

    if (lesson.materialCount === 0) return <span />;

    return (
        <div className={styles.facts}>
            <span className={styles.fact}>
                <ListIcon size={15} />
                {t('lessons.files', { count: lesson.materialCount })}
            </span>
        </div>
    );
}

export function LessonsPage() {
    const { t, i18n } = useTranslation();
    const { currentSubject } = useCurrentSubject();
    const [filterQuery, setFilterQuery] = useState('');
    const [topicFilter, setTopicFilter] = useState('');
    const { data: lessons = [], isLoading } = useLessons(
        currentSubject?.id,
        Boolean(currentSubject),
    );
    const dueByLesson = useAssignedContent('lesson');

    // The API sorts by topic in syllabus order, then by the lesson's own
    // order, so first appearance keeps the syllabus order here too.
    const topics = [
        ...new Map(lessons.map((l) => [l.topicId, l.topicName])).entries(),
    ];

    const query = filterQuery.trim().toLowerCase();
    const shown = lessons.filter(
        (lesson) =>
            (!topicFilter || lesson.topicId === topicFilter) &&
            (!query ||
                lessonTitle(lesson).toLowerCase().includes(query) ||
                lesson.topicName.toLowerCase().includes(query)),
    );
    const assigned = shown
        .filter((lesson) => dueByLesson.has(lesson.id))
        .sort(byAssignedDue(dueByLesson));
    const library = shown.filter((lesson) => !dueByLesson.has(lesson.id));
    const totalAssigned = lessons.filter((lesson) =>
        dueByLesson.has(lesson.id),
    ).length;
    const isFiltered = Boolean(query || topicFilter);

    const clearFilters = () => {
        setFilterQuery('');
        setTopicFilter('');
    };

    return (
        <div className={styles.page}>
            <CatalogHero
                id="lessons-heading"
                breadcrumb={
                    currentSubject && (
                        <>
                            {t('nav.learn')} <span aria-hidden="true">/</span>{' '}
                            {subjectName(currentSubject, i18n.language)}
                        </>
                    )
                }
                title={t('lessons.heading')}
                subtitle={t('lessons.subtitle')}
                stats={[
                    { label: t('catalog.statAssigned'), value: totalAssigned },
                    { label: t('lessons.statLessons'), value: lessons.length },
                ]}
            />

            <div className={styles.filterBar} role="search">
                <SearchField
                    value={filterQuery}
                    onChange={setFilterQuery}
                    placeholder={t('lessons.filterTitle')}
                    ariaLabel={t('lessons.filterTitleAria')}
                />
                {topics.length > 1 && (
                    <div className={styles.selectField}>
                        <label htmlFor="lesson-topic" className={styles.selectLabel}>
                            {t('lessons.topic')}
                        </label>
                        <select
                            id="lesson-topic"
                            className={styles.select}
                            value={topicFilter}
                            onChange={(e) => setTopicFilter(e.target.value)}
                        >
                            <option value="">{t('lessons.allTopics')}</option>
                            {topics.map(([id, name]) => (
                                <option key={id} value={id}>
                                    {name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {assigned.length > 0 && (
                <CatalogGroup
                    id="assigned-lessons-heading"
                    title={t('catalog.assignedHeading')}
                    countLabel={t('lessons.count', { count: assigned.length })}
                >
                    <div className={styles.assignedGrid}>
                        {assigned.map((lesson) => {
                            const due = dueByLesson.get(lesson.id) ?? null;
                            const title = lessonTitle(lesson);

                            return (
                                <article key={lesson.id} className={styles.assignedCard}>
                                    <div className={styles.cardTop}>
                                        <div className={styles.homework}>
                                            <ContentTypeTile type="lesson" size="sm" />
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
                                            {title}
                                        </h3>
                                        {title !== lesson.topicName && (
                                            <p className={styles.description} dir="auto">
                                                {lesson.topicName}
                                            </p>
                                        )}
                                    </div>
                                    <div className={styles.assignedFoot}>
                                        <FileCount lesson={lesson} />
                                        <Link
                                            to={`/lessons/${lesson.id}`}
                                            className={styles.primaryButton}
                                            aria-label={t('lessons.openAria', { title })}
                                        >
                                            {t('lessons.open')}
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
                id="all-lessons-heading"
                title={t('lessons.libraryHeading')}
                countLabel={t('lessons.count', { count: library.length })}
            >
                {library.length > 0 ? (
                    <div className={styles.libraryGrid}>
                        {library.map((lesson) => {
                            const title = lessonTitle(lesson);

                            return (
                                <article key={lesson.id} className={styles.libraryCard}>
                                    <div className={styles.cardTop}>
                                        <ContentTypeTile type="lesson" />
                                        <div className={styles.badges}>
                                            <span
                                                className={`${styles.badge} ${toneClass.rose}`}
                                                dir="auto"
                                            >
                                                {lesson.topicName}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={styles.cardText}>
                                        <h3 className={styles.libraryTitle} dir="auto">
                                            {title}
                                        </h3>
                                    </div>
                                    <div className={styles.libraryFoot}>
                                        <FileCount lesson={lesson} />
                                        <Link
                                            to={`/lessons/${lesson.id}`}
                                            className={styles.softButton}
                                            aria-label={t('lessons.openAria', { title })}
                                        >
                                            {t('lessons.openShort')}
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
                    <p className={styles.groupEmpty}>{t('lessons.allAssigned')}</p>
                ) : isLoading ? (
                    <p className={styles.groupEmpty} role="status">
                        {t('common.loading')}
                    </p>
                ) : (
                    <CatalogEmpty
                        title={isFiltered ? t('lessons.noMatch') : t('lessons.none')}
                        hint={isFiltered ? t('lessons.noMatchHint') : undefined}
                        onClear={isFiltered ? clearFilters : undefined}
                    />
                )}
            </CatalogGroup>
        </div>
    );
}
