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
    ClockIcon,
} from '../../components/hub/icons';
import { useCurrentSubject } from '../../contexts/subject-context';
import { useReadingLibrary } from '../../hooks/queries';
import { byAssignedDue, useAssignedContent } from '../../hooks/useAssignedContent';
import type { ReadingItem, ReadingLevel } from '../../types/reading';
import { isPastDue } from '../../utils/assignments';
import { markdownExcerpt } from '../../utils/plainText';
import { subjectName } from '../../utils/subjects';

const LEVEL_ORDER: ReadingLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

function ReadTime({ item }: { item: ReadingItem }) {
    const { t } = useTranslation();

    return (
        <div className={styles.facts}>
            <span className={styles.fact}>
                <ClockIcon size={15} />
                {t('readingList.minutes', { count: item.minutes })}
            </span>
        </div>
    );
}

export function ReadingPage() {
    const { t, i18n } = useTranslation();
    const { currentSubject, currentLevel } = useCurrentSubject();
    const { data: texts = [], isLoading } = useReadingLibrary();
    const dueByText = useAssignedContent('reading');
    const [filterQuery, setFilterQuery] = useState('');
    // Starts at the student's own level when the teacher set one.
    const [levelFilter, setLevelFilter] = useState<string>(
        currentLevel?.code?.toUpperCase() ?? '',
    );

    const levels = LEVEL_ORDER.filter((level) =>
        texts.some((text) => text.level === level),
    );
    // A remembered level with no texts would hide everything.
    const activeLevel = levels.includes(levelFilter as ReadingLevel)
        ? levelFilter
        : '';

    const query = filterQuery.trim().toLowerCase();
    const shown = texts.filter(
        (text) =>
            (!activeLevel || text.level === activeLevel) &&
            (!query || text.title.toLowerCase().includes(query)),
    );
    const assigned = shown
        .filter((text) => dueByText.has(text.id))
        .sort(byAssignedDue(dueByText));
    const library = shown.filter((text) => !dueByText.has(text.id));
    const totalAssigned = texts.filter((text) => dueByText.has(text.id)).length;
    const isFiltered = Boolean(query || activeLevel);

    const clearFilters = () => {
        setFilterQuery('');
        setLevelFilter('');
    };

    return (
        <div className={styles.page}>
            <CatalogHero
                id="reading-heading"
                breadcrumb={
                    currentSubject && (
                        <>
                            {t('nav.learn')} <span aria-hidden="true">/</span>{' '}
                            {subjectName(currentSubject, i18n.language)}
                        </>
                    )
                }
                title={t('readingList.heading')}
                subtitle={t('readingList.subtitle')}
                stats={[
                    { label: t('catalog.statAssigned'), value: totalAssigned },
                    { label: t('readingList.statTexts'), value: texts.length },
                ]}
            />

            <div className={styles.filterBar} role="search">
                <SearchField
                    value={filterQuery}
                    onChange={setFilterQuery}
                    placeholder={t('readingList.filterTitle')}
                    ariaLabel={t('readingList.filterTitleAria')}
                />
                {levels.length > 1 && (
                    <div
                        className={styles.chips}
                        role="group"
                        aria-label={t('readingList.levelAria')}
                    >
                        {['', ...levels].map((level) => (
                            <button
                                key={level || 'all'}
                                type="button"
                                className={styles.chip}
                                aria-pressed={activeLevel === level}
                                onClick={() => setLevelFilter(level)}
                            >
                                {level || t('readingList.allLevels')}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {assigned.length > 0 && (
                <CatalogGroup
                    id="assigned-reading-heading"
                    title={t('catalog.assignedHeading')}
                    countLabel={t('readingList.count', { count: assigned.length })}
                >
                    <div className={styles.assignedGrid}>
                        {assigned.map((text) => {
                            const due = dueByText.get(text.id) ?? null;

                            return (
                                <article key={text.id} className={styles.assignedCard}>
                                    <div className={styles.cardTop}>
                                        <div className={styles.homework}>
                                            <ContentTypeTile type="reading" size="sm" />
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
                                            {text.title}
                                        </h3>
                                        <p className={styles.description} dir="auto">
                                            {markdownExcerpt(text.content)}
                                        </p>
                                    </div>
                                    <div className={styles.assignedFoot}>
                                        <ReadTime item={text} />
                                        <Link
                                            to={`/reading/${text.id}`}
                                            state={{ item: text }}
                                            className={styles.primaryButton}
                                            aria-label={t('readingList.readAria', {
                                                title: text.title,
                                            })}
                                        >
                                            {t('readingList.read')}
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
                id="all-reading-heading"
                title={t('readingList.libraryHeading')}
                countLabel={t('readingList.count', { count: library.length })}
            >
                {library.length > 0 ? (
                    <div className={styles.libraryGrid}>
                        {library.map((text) => (
                            <article key={text.id} className={styles.libraryCard}>
                                <div className={styles.cardTop}>
                                    <ContentTypeTile type="reading" />
                                    <div className={styles.badges}>
                                        <span className={styles.levelBadge}>
                                            {text.level}
                                        </span>
                                    </div>
                                </div>
                                <div className={styles.cardText}>
                                    <h3 className={styles.libraryTitle} dir="auto">
                                        {text.title}
                                    </h3>
                                    <p className={styles.descriptionSm} dir="auto">
                                        {markdownExcerpt(text.content)}
                                    </p>
                                </div>
                                <div className={styles.libraryFoot}>
                                    <ReadTime item={text} />
                                    <Link
                                        to={`/reading/${text.id}`}
                                        state={{ item: text }}
                                        className={styles.softButton}
                                        aria-label={t('readingList.readAria', {
                                            title: text.title,
                                        })}
                                    >
                                        {t('readingList.readShort')}
                                        <ChevronForwardIcon
                                            size={16}
                                            className={styles.flipRtl}
                                        />
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : assigned.length > 0 ? (
                    <p className={styles.groupEmpty}>
                        {t('readingList.allAssigned')}
                    </p>
                ) : isLoading ? (
                    <p className={styles.groupEmpty} role="status">
                        {t('common.loading')}
                    </p>
                ) : (
                    <CatalogEmpty
                        title={
                            isFiltered
                                ? t('readingList.noMatch')
                                : t('readingList.none')
                        }
                        hint={isFiltered ? t('readingList.noMatchHint') : undefined}
                        onClear={isFiltered ? clearFilters : undefined}
                    />
                )}
            </CatalogGroup>
        </div>
    );
}
