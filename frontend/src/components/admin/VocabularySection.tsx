import { useState } from 'react';
import { useVocabularyTopics } from '../../hooks/queries';
import {
    useCreateVocabularyTopic,
    useUpdateVocabularyTopic,
    useDeleteVocabularyTopic,
} from '../../hooks/mutations';
import type { VocabularyTopicPreview } from '../../types/vocabulary';
import { TopicForm } from './vocabulary/TopicForm';
import { TopicItem } from './vocabulary/TopicItem';
import styles from '../../pages/Admin/AdminPage.module.css';

type TopicEditState = {
    id: string;
    topic: string;
    description: string;
};

export function VocabularySection() {
    const { data: topics = [] } = useVocabularyTopics();
    const createTopic = useCreateVocabularyTopic();
    const updateTopic = useUpdateVocabularyTopic();
    const deleteTopic = useDeleteVocabularyTopic();

    const [showTopicForm, setShowTopicForm] = useState(false);
    const [topicEdit, setTopicEdit] = useState<TopicEditState | null>(null);
    const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

    const handleCreateTopic = async (values: {
        topic: string;
        description: string;
    }) => {
        if (!values.topic) return;
        await createTopic.mutateAsync({
            topic: values.topic,
            description: values.description || undefined,
        });
        setShowTopicForm(false);
    };

    const handleUpdateTopic = async (values: {
        topic: string;
        description: string;
    }) => {
        if (!topicEdit) return;
        await updateTopic.mutateAsync({
            id: topicEdit.id,
            topic: values.topic,
            description: values.description || undefined,
        });
        setTopicEdit(null);
    };

    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h3>Vocabulary Topics</h3>
                <button
                    type="button"
                    className={styles.addButton}
                    onClick={() => {
                        setShowTopicForm((v) => !v);
                        setTopicEdit(null);
                    }}
                >
                    {showTopicForm ? 'Cancel' : '+ Add Topic'}
                </button>
            </div>

            {showTopicForm && (
                <TopicForm
                    submitLabel="Create Topic"
                    isPending={createTopic.isPending}
                    isError={createTopic.isError}
                    errorMessage={(createTopic.error as Error)?.message}
                    onSubmit={(values) => void handleCreateTopic(values)}
                    onCancel={() => setShowTopicForm(false)}
                />
            )}

            {topicEdit && (
                <TopicForm
                    key={topicEdit.id}
                    heading="Editing topic"
                    initialTopic={topicEdit.topic}
                    initialDescription={topicEdit.description}
                    submitLabel="Save Topic"
                    isPending={updateTopic.isPending}
                    isError={updateTopic.isError}
                    errorMessage={(updateTopic.error as Error)?.message}
                    onSubmit={(values) => void handleUpdateTopic(values)}
                    onCancel={() => setTopicEdit(null)}
                />
            )}

            <ul className={styles.itemList}>
                {(topics as VocabularyTopicPreview[]).map((topic) => (
                    <TopicItem
                        key={topic.id}
                        topic={topic}
                        isSelected={selectedTopicId === topic.id}
                        onSelect={() =>
                            setSelectedTopicId((prev) =>
                                prev === topic.id ? null : topic.id,
                            )
                        }
                        onEdit={() => {
                            setShowTopicForm(false);
                            setTopicEdit({
                                id: topic.id,
                                topic: topic.topic,
                                description: topic.description ?? '',
                            });
                        }}
                        onDelete={() => void deleteTopic.mutate(topic.id)}
                    />
                ))}
                {topics.length === 0 && (
                    <li className={styles.empty}>No vocabulary topics yet.</li>
                )}
            </ul>
        </div>
    );
}
