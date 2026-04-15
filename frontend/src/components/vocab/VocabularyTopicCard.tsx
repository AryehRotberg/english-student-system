import type { VocabularyTopicPreview } from '../../types/vocabulary';
import styles from './VocabularyTopicCard.module.css';

type VocabularyTopicCardProps = {
    topic: VocabularyTopicPreview;
    onSelectTopic: (topic: VocabularyTopicPreview) => void;
};

export function VocabularyTopicCard({
    topic,
    onSelectTopic,
}: VocabularyTopicCardProps) {
    return (
        <button
            type="button"
            className={styles.card}
            onClick={() => onSelectTopic(topic)}
        >
            <h3 className={styles.title}>{topic.topic}</h3>

            {topic.description ? (
                <p className={styles.description}>{topic.description}</p>
            ) : null}
        </button>
    );
}
