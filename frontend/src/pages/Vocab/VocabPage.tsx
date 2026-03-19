import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { VocabStudyPanel } from "../../components/vocab/VocabStudyPanel";
import { VocabularyTopicGrid } from "../../components/vocab/VocabularyTopicGrid";
import { useVocabularyTopicsWithWords } from "../../hooks/queries";
import type { VocabularyTopicWithWords } from "../../types/vocabulary";
import styles from "./VocabPage.module.css";

export function VocabPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { data: topics = [] } = useVocabularyTopicsWithWords();
    const [selectedTopic, setSelectedTopic] =
        useState<VocabularyTopicWithWords | null>(null);

    const topicIdFromUrl = searchParams.get("topicId");

    useEffect(() => {
        if (!topicIdFromUrl) {
            return;
        }

        const topic = topics.find((item) => item.id === topicIdFromUrl);
        if (topic) {
            setSelectedTopic(topic);
        }
    }, [topicIdFromUrl, topics]);

    const activeTopic =
        selectedTopic === null
            ? null
            : topics.find((topic) => topic.id === selectedTopic.id) ||
              selectedTopic;

    const handleSelectTopic = (topic: VocabularyTopicWithWords) => {
        setSelectedTopic(topic);
        setSearchParams({ topicId: topic.id });
    };

    const handleBackToTopics = () => {
        setSelectedTopic(null);
        setSearchParams({});
    };

    return (
        <div className={styles.stack}>
            {activeTopic ? (
                <VocabStudyPanel
                    topic={activeTopic}
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
