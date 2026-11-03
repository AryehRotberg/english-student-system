import { useState } from 'react';
import {
    useCreateVocabularyTopic,
    useDeleteVocabularyTopic,
    useUpdateVocabularyTopic,
} from '../../hooks/mutations';
import { useVocabularyTopics } from '../../hooks/queries';
import type { VocabularyTopicPreview } from '../../types/vocabulary';
import {
    AdminEmpty,
    AdminListPanel,
    AdminSearch,
    BackLink,
    EditButton,
    RowMenu,
} from './list/AdminList';
import styles from './list/AdminList.module.css';
import { countLabel } from './list/countLabel';
import { useEditorParam } from './list/useEditorParam';
import { TopicForm } from './vocabulary/TopicForm';
import { TopicWords } from './vocabulary/TopicWords';

const createdFormat: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
};

/**
 * Vocabulary topics: a searchable table, and an editor page for one topic and
 * its words (?topic=<id>, or ?topic=new for the create form).
 */
export function VocabularySection() {
    const { data: topics = [], isLoading } = useVocabularyTopics();
    const createTopic = useCreateVocabularyTopic();
    const updateTopic = useUpdateVocabularyTopic();
    const deleteTopic = useDeleteVocabularyTopic();
    const editor = useEditorParam('topic');
    const [search, setSearch] = useState('');

    if (editor.isNew) {
        return (
            <div className={styles.editor}>
                <BackLink onClick={editor.close}>All topics</BackLink>
                <section className={styles.editorCard}>
                    <h2 className={styles.editorTitle}>New topic</h2>
                    <p className={styles.editorHint}>
                        Name the topic first; the next step is adding its words.
                    </p>
                    <TopicForm
                        submitLabel="Create topic"
                        isPending={createTopic.isPending}
                        isError={createTopic.isError}
                        errorMessage={(createTopic.error as Error)?.message}
                        onSubmit={async (values) => {
                            if (!values.topic) return;
                            const created = await createTopic.mutateAsync({
                                topic: values.topic,
                                description: values.description || undefined,
                            });
                            // Straight to the editor so words can be added.
                            editor.open(created.id);
                        }}
                        onCancel={editor.close}
                    />
                </section>
            </div>
        );
    }

    if (editor.openId) {
        const topic = (topics as VocabularyTopicPreview[]).find(
            (t) => t.id === editor.openId,
        );

        return (
            <div className={styles.editor}>
                <BackLink onClick={editor.close}>All topics</BackLink>
                {!topic ? (
                    <p className={styles.loading}>
                        {isLoading ? 'Loading topic…' : 'Topic not found.'}
                    </p>
                ) : (
                    <>
                        <section className={styles.editorCard}>
                            <h2 className={styles.editorTitle} dir="auto">
                                {topic.topic}
                            </h2>
                            <TopicForm
                                key={topic.id}
                                initialTopic={topic.topic}
                                initialDescription={topic.description ?? ''}
                                submitLabel="Save details"
                                isPending={updateTopic.isPending}
                                isError={updateTopic.isError}
                                errorMessage={(updateTopic.error as Error)?.message}
                                onSubmit={(values) =>
                                    updateTopic.mutate({
                                        id: topic.id,
                                        topic: values.topic,
                                        description:
                                            values.description || undefined,
                                    })
                                }
                            />
                        </section>
                        <section className={styles.editorCard}>
                            <TopicWords topic={topic} />
                        </section>
                    </>
                )}
            </div>
        );
    }

    const term = search.trim().toLowerCase();
    const visible = (topics as VocabularyTopicPreview[]).filter(
        (topic) =>
            !term ||
            topic.topic.toLowerCase().includes(term) ||
            (topic.description ?? '').toLowerCase().includes(term),
    );

    return (
        <AdminListPanel
            id="admin-vocab-heading"
            title="All topics"
            count={countLabel(visible.length, topics.length, Boolean(term))}
            toolbar={
                <AdminSearch
                    value={search}
                    onChange={setSearch}
                    placeholder="Search by topic or description"
                    label="Search vocabulary topics"
                />
            }
        >
            {isLoading ? (
                <p className={styles.loading} role="status">
                    Loading topics…
                </p>
            ) : visible.length > 0 ? (
                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th scope="col">Topic</th>
                                <th scope="col">Added</th>
                                <th scope="col">
                                    <span className={styles.srOnly}>Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {visible.map((topic) => (
                                <tr key={topic.id}>
                                    <td className={styles.primaryCell}>
                                        <button
                                            type="button"
                                            className={styles.rowTitle}
                                            dir="auto"
                                            onClick={() => editor.open(topic.id)}
                                        >
                                            {topic.topic}
                                        </button>
                                        {topic.description && (
                                            <span className={styles.rowDesc} dir="auto">
                                                {topic.description}
                                            </span>
                                        )}
                                    </td>
                                    <td
                                        data-label="Added"
                                        className={`${styles.time} ${styles.labelled}`}
                                    >
                                        {new Date(topic.createdAt).toLocaleDateString(
                                            'en',
                                            createdFormat,
                                        )}
                                    </td>
                                    <td className={styles.actionsCell}>
                                        <div className={styles.actions}>
                                            <EditButton
                                                label={`Edit ${topic.topic}`}
                                                onClick={() => editor.open(topic.id)}
                                            />
                                            <RowMenu
                                                label={`More actions for ${topic.topic}`}
                                                items={[
                                                    {
                                                        label: 'Delete topic',
                                                        danger: true,
                                                        disabled: deleteTopic.isPending,
                                                        onSelect: () => {
                                                            if (
                                                                !confirm(
                                                                    `Delete topic "${topic.topic}"?`,
                                                                )
                                                            )
                                                                return;
                                                            deleteTopic.mutate(topic.id);
                                                        },
                                                    },
                                                ]}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <AdminEmpty
                    title={
                        term
                            ? 'No topics match your search'
                            : 'No vocabulary topics yet'
                    }
                    hint={
                        term
                            ? 'Try a different word.'
                            : 'Create the first one with “New topic” above.'
                    }
                    onClear={term ? () => setSearch('') : undefined}
                />
            )}
        </AdminListPanel>
    );
}
