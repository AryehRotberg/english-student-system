import type { VocabularyTopicPreview } from "../../types/vocabulary";
import { VocabularyTopicCard } from "./VocabularyTopicCard";
import styles from "../../pages/Vocab/VocabPage.module.css";

type VocabularyTopicGridProps = {
    topics: VocabularyTopicPreview[];
    onSelectTopic: (topic: VocabularyTopicPreview) => void;
};

export function VocabularyTopicGrid({
    topics,
    onSelectTopic,
}: VocabularyTopicGridProps) {
    return (
        <div className={styles.topicGrid}>
            {topics.map((topic) => (
                <VocabularyTopicCard
                    key={topic.id}
                    topic={topic}
                    onSelectTopic={onSelectTopic}
                />
            ))}
        </div>
    );
}
