import { useState } from 'react';
import { useTexts, useQuizzes, useVocabularyTopics } from '../../hooks/queries';
import {
    useCreateText,
    useUpdateText,
    useDeleteText,
} from '../../hooks/mutations';
import { audioService } from '../../services/audio.service';
import type { TextAdminItem } from '../../types/admin-query-items';
import { TextForm } from './texts/TextForm';
import type { TextFormValues } from './texts/TextForm';
import { TextItem } from './texts/TextItem';
import styles from '../../pages/Admin/AdminPage.module.css';

type EditState = { id: string } & TextFormValues;

export function TextsSection() {
    const { data: texts = [] } = useTexts();
    const { data: quizzes = [] } = useQuizzes();
    const { data: vocabTopics = [] } = useVocabularyTopics();
    const createText = useCreateText();
    const updateText = useUpdateText();
    const deleteText = useDeleteText();

    const [showForm, setShowForm] = useState(false);
    const [editState, setEditState] = useState<EditState | null>(null);
    const [expandedTextId, setExpandedTextId] = useState<string | null>(null);

    const handleCreate = async (values: TextFormValues) => {
        const created = await createText.mutateAsync({
            title: values.title,
            content: values.content,
            level: values.level,
            quizId: values.quizId || undefined,
            vocabularyTopicId: values.vocabularyTopicId || undefined,
        });
        if (values.includeAudio && created?.id) {
            await audioService.generateAndSaveTts(
                values.content,
                'texts',
                `${created.id}.mp3`,
            );
        }
        setShowForm(false);
    };

    const startEdit = (text: TextAdminItem) => {
        setEditState({
            id: text.id,
            title: text.title,
            content: text.content,
            level: text.level,
            quizId: text.quiz?.id ?? '',
            vocabularyTopicId: text.vocabularyTopic?.id ?? '',
            includeAudio: false,
        });
    };

    const handleUpdate = async (values: TextFormValues) => {
        if (!editState) return;
        await updateText.mutateAsync({
            id: editState.id,
            title: values.title,
            content: values.content,
            level: values.level,
            quizId: values.quizId || null,
            vocabularyTopicId: values.vocabularyTopicId || null,
        });
        setEditState(null);
    };

    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h3>Reading Texts</h3>
                <button
                    type="button"
                    className={styles.addButton}
                    onClick={() => {
                        setShowForm((v) => !v);
                        setEditState(null);
                    }}
                >
                    {showForm ? 'Cancel' : '+ Add Text'}
                </button>
            </div>

            {showForm && (
                <TextForm
                    submitLabel="Create Text"
                    showAudioCheckbox
                    isPending={createText.isPending}
                    isError={createText.isError}
                    errorMessage={(createText.error as Error | null)?.message}
                    quizzes={quizzes}
                    vocabTopics={vocabTopics}
                    onSubmit={(values) => void handleCreate(values)}
                    onCancel={() => setShowForm(false)}
                />
            )}

            {editState && (
                <TextForm
                    heading="Editing text"
                    initialTitle={editState.title}
                    initialContent={editState.content}
                    initialLevel={editState.level}
                    initialQuizId={editState.quizId}
                    initialVocabularyTopicId={editState.vocabularyTopicId}
                    submitLabel="Save Changes"
                    isPending={updateText.isPending}
                    isError={updateText.isError}
                    errorMessage={(updateText.error as Error | null)?.message}
                    quizzes={quizzes}
                    vocabTopics={vocabTopics}
                    onSubmit={(values) => void handleUpdate(values)}
                    onCancel={() => setEditState(null)}
                />
            )}

            <ul className={styles.itemList}>
                {(texts as TextAdminItem[]).map((text) => (
                    <TextItem
                        key={text.id}
                        text={text}
                        isExpanded={expandedTextId === text.id}
                        onToggle={() =>
                            setExpandedTextId((prev) =>
                                prev === text.id ? null : text.id,
                            )
                        }
                        onEdit={() => {
                            setShowForm(false);
                            startEdit(text);
                        }}
                        onDelete={() => void deleteText.mutate(text.id)}
                        deleteIsPending={deleteText.isPending}
                    />
                ))}
                {texts.length === 0 && (
                    <li className={styles.empty}>No texts yet.</li>
                )}
            </ul>
        </div>
    );
}
