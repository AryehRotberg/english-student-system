import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import {
    CatalogEmpty,
    CatalogGroup,
    CatalogHero,
    DuePill,
    SearchField,
} from '../../components/hub/Catalog';
import styles from '../../components/hub/Catalog.module.css';
import { ContentTypeTile } from '../../components/hub/ContentTile';
import { ArrowForwardIcon, ChevronForwardIcon } from '../../components/hub/icons';
import { VocabStudyPanel } from '../../components/vocab/VocabStudyPanel';
import { useCurrentSubject } from '../../contexts/subject-context';
import {
    useVocabularyTopicWords,
    useVocabularyTopics,
} from '../../hooks/queries';
import { byAssignedDue, useAssignedContent } from '../../hooks/useAssignedContent';
import type { VocabularyTopicWithWords } from '../../types/vocabulary';
import { isPastDue } from '../../utils/assignments';
import { subjectName } from '../../utils/subjects';

function topicLink(topicId: string) {
    return `/vocab?topicId=${topicId}`;
}

export function VocabPage() {
    const { t, i18n } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const { currentSubject } = useCurrentSubject();
    const { data: topics = [], isLoading } = useVocabularyTopics();
    const [filterQuery, setFilterQuery] = useState('');
    const dueByTopic = useAssignedContent('vocabulary');

    const activeTopicId = searchParams.get('topicId');
    const activeWord = searchParams.get('word') ?? undefined;

    const { data: words = [], isLoading: isWordsLoading } =
        useVocabularyTopicWords(activeTopicId ?? undefined);

    const activeTopicMeta = activeTopicId
        ? (topics.find((topic) => topic.id === activeTopicId) ?? null)
        : null;

    if (activeTopicMeta) {
        const activeTopic: VocabularyTopicWithWords = {
            id: activeTopicMeta.id,
            topic: activeTopicMeta.topic,
            description: activeTopicMeta.description,
            createdAt: activeTopicMeta.createdAt,
            words,
        };

        return (
            <VocabStudyPanel
                topic={activeTopic}
                isLoadingWords={isWordsLoading}
                initialWord={activeWord}
                onBack={() => setSearchParams({})}
            />
        );
    }

    const query = filterQuery.trim().toLowerCase();
    const shown = query
        ? topics.filter(
              (topic) =>
                  topic.topic.toLowerCase().includes(query) ||
                  (topic.description ?? '').toLowerCase().includes(query),
          )
        : topics;
    const assigned = shown
        .filter((topic) => dueByTopic.has(topic.id))
        .sort(byAssignedDue(dueByTopic));
    const library = shown.filter((topic) => !dueByTopic.has(topic.id));
    const totalAssigned = topics.filter((topic) =>
        dueByTopic.has(topic.id),
    ).length;

    return (
        <div className={styles.page}>
            <CatalogHero
                id="vocab-heading"
                breadcrumb={
                    currentSubject && (
                        <>
                            {t('nav.learn')} <span aria-hidden="true">/</span>{' '}
                            {subjectName(currentSubject, i18n.language)}
                        </>
                    )
                }
                title={t('vocabList.heading')}
                subtitle={t('vocabList.subtitle')}
                stats={[
                    { label: t('catalog.statAssigned'), value: totalAssigned },
                    { label: t('vocabList.statTopics'), value: topics.length },
                ]}
            />

            <div className={styles.filterBar} role="search">
                <SearchField
                    value={filterQuery}
                    onChange={setFilterQuery}
                    placeholder={t('vocabList.filterTitle')}
                    ariaLabel={t('vocabList.filterTitleAria')}
                />
            </div>

            {assigned.length > 0 && (
                <CatalogGroup
                    id="assigned-vocab-heading"
                    title={t('catalog.assignedHeading')}
                    countLabel={t('vocabList.count', { count: assigned.length })}
                >
                    <div className={styles.assignedGrid}>
                        {assigned.map((topic) => {
                            const due = dueByTopic.get(topic.id) ?? null;

                            return (
                                <article key={topic.id} className={styles.assignedCard}>
                                    <div className={styles.cardTop}>
                                        <div className={styles.homework}>
                                            <ContentTypeTile type="vocabulary" size="sm" />
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
                                            {topic.topic}
                                        </h3>
                                        {topic.description && (
                                            <p className={styles.description} dir="auto">
                                                {topic.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className={styles.assignedFoot}>
                                        <span />
                                        <Link
                                            to={topicLink(topic.id)}
                                            className={styles.primaryButton}
                                            aria-label={t('vocabList.studyAria', {
                                                title: topic.topic,
                                            })}
                                        >
                                            {t('vocabList.study')}
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
                id="all-vocab-heading"
                title={t('vocabList.libraryHeading')}
                countLabel={t('vocabList.count', { count: library.length })}
            >
                {library.length > 0 ? (
                    <div className={styles.libraryGrid}>
                        {library.map((topic) => (
                            <article key={topic.id} className={styles.libraryCard}>
                                <div className={styles.cardTop}>
                                    <ContentTypeTile type="vocabulary" />
                                </div>
                                <div className={styles.cardText}>
                                    <h3 className={styles.libraryTitle} dir="auto">
                                        {topic.topic}
                                    </h3>
                                    {topic.description && (
                                        <p className={styles.descriptionSm} dir="auto">
                                            {topic.description}
                                        </p>
                                    )}
                                </div>
                                <div className={styles.libraryFoot}>
                                    <span />
                                    <Link
                                        to={topicLink(topic.id)}
                                        className={styles.softButton}
                                        aria-label={t('vocabList.studyAria', {
                                            title: topic.topic,
                                        })}
                                    >
                                        {t('vocabList.studyShort')}
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
                    <p className={styles.groupEmpty}>{t('vocabList.allAssigned')}</p>
                ) : isLoading ? (
                    <p className={styles.groupEmpty} role="status">
                        {t('common.loading')}
                    </p>
                ) : (
                    <CatalogEmpty
                        title={query ? t('vocabList.noMatch') : t('vocabList.none')}
                        hint={query ? t('vocabList.noMatchHint') : undefined}
                        onClear={query ? () => setFilterQuery('') : undefined}
                    />
                )}
            </CatalogGroup>
        </div>
    );
}
