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
                    <h2 className={styles.heading}>Vocabulary Studio</h2>

                    {topics.length > 0 ? (
                        <VocabularyTopicGrid
                            topics={topics}
                            onSelectTopic={handleSelectTopic}
                        />
                    ) : (
                        <p className={styles.emptyState}>
                            No vocabulary topics found yet.
                        </p>
                    )}
                </section>
            )}
        </div>
    );
}
