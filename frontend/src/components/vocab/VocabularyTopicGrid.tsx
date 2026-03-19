import type { VocabularyTopicWithWords } from "../../types/vocabulary";
import { VocabularyTopicCard } from "./VocabularyTopicCard";
import styles from "../../pages/Vocab/VocabPage.module.css";

type VocabularyTopicGridProps = {
    topics: VocabularyTopicWithWords[];
    onSelectTopic: (topic: VocabularyTopicWithWords) => void;
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
