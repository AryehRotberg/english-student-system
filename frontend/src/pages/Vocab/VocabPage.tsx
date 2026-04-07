import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { VocabStudyPanel } from "../../components/vocab/VocabStudyPanel";
import { VocabularyTopicGrid } from "../../components/vocab/VocabularyTopicGrid";
import {
    useVocabularyTopicWords,
    useVocabularyTopics,
} from "../../hooks/queries";
import type {
    VocabularyTopicPreview,
    VocabularyTopicWithWords,
} from "../../types/vocabulary";
import styles from "./VocabPage.module.css";

export function VocabPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { data: topics = [] } = useVocabularyTopics();
    const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
    const [filterQuery, setFilterQuery] = useState("");

    const topicIdFromUrl = searchParams.get("topicId");
    const activeTopicId = selectedTopicId ?? topicIdFromUrl;

    const { data: words = [], isLoading: isWordsLoading } =
        useVocabularyTopicWords(activeTopicId ?? undefined);

    useEffect(() => {
        if (!topicIdFromUrl) {
            return;
        }

        const topic = topics.find((item) => item.id === topicIdFromUrl);
        if (topic) {
            setSelectedTopicId(topic.id);
        }
    }, [topicIdFromUrl, topics]);

    const activeTopicMeta = activeTopicId
        ? (topics.find((topic) => topic.id === activeTopicId) ?? null)
        : null;

    const activeTopic: VocabularyTopicWithWords | null =
        activeTopicMeta === null
            ? null
            : {
                  id: activeTopicMeta.id,
                  topic: activeTopicMeta.topic,
                  description: activeTopicMeta.description,
                  createdAt: activeTopicMeta.createdAt,
                  words,
              };

    const filteredTopics = filterQuery.trim()
        ? topics.filter((t) =>
              t.topic.toLowerCase().includes(filterQuery.toLowerCase()),
          )
        : topics;

    const handleSelectTopic = (topic: VocabularyTopicPreview) => {
        setSelectedTopicId(topic.id);
        setSearchParams({ topicId: topic.id });
    };

    const handleBackToTopics = () => {
        setSelectedTopicId(null);
        setSearchParams({});
    };

    return (
        <div className={styles.stack}>
            {activeTopic ? (
                <VocabStudyPanel
                    topic={activeTopic}
                    isLoadingWords={isWordsLoading}
                    onBack={handleBackToTopics}
                />
            ) : (
                <section className={styles.topicSection}>
                    <div className={styles.sectionHeader}>
                        <div>
                            <h1 className={styles.heading}>
                                Vocabulary Studio
                            </h1>
                            <p className={styles.subtitle}>
                                Select a topic to study and expand your
                                vocabulary.
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
                                placeholder="Filter by topic…"
                                value={filterQuery}
                                onChange={(e) => setFilterQuery(e.target.value)}
                                aria-label="Filter vocabulary topics"
                            />
                        </div>
                    </div>

                    {filteredTopics.length > 0 ? (
                        <VocabularyTopicGrid
                            topics={filteredTopics}
                            onSelectTopic={handleSelectTopic}
                        />
                    ) : (
                        <p className={styles.emptyState}>
                            {filterQuery.trim()
                                ? "No topics match your search."
                                : "No vocabulary topics found yet."}
                        </p>
                    )}
                </section>
            )}
        </div>
    );
}
