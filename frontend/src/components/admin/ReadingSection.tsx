import { useState } from 'react';
import {
    useCreateText,
    useDeleteText,
    useUpdateText,
} from '../../hooks/mutations';
import {
    useQuizzes,
    useReadings,
    useVocabularyTopics,
} from '../../hooks/queries';
import styles from '../../pages/Admin/AdminPage.module.css';
import { audioService } from '../../services/audio.service';
import type { ReadingAdminItem } from '../../types/admin-query-items';
import type { ReadingFormValues } from './texts/ReadingForm';
import { ReadingForm } from './texts/ReadingForm';
import { TextItem } from './texts/TextItem';

type EditState = { id: string } & ReadingFormValues;

export function TextsSection() {
    const { data: readings = [] } = useReadings();
    const { data: quizzes = [] } = useQuizzes();
    const { data: vocabTopics = [] } = useVocabularyTopics();
    const createText = useCreateText();
    const updateText = useUpdateText();
    const deleteText = useDeleteText();

    const [showForm, setShowForm] = useState(false);
    const [editState, setEditState] = useState<EditState | null>(null);
    const [expandedTextId, setExpandedTextId] = useState<string | null>(null);

    const handleCreate = async (values: ReadingFormValues) => {
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

    const startEdit = (text: ReadingAdminItem) => {
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

    const handleUpdate = async (values: ReadingFormValues) => {
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
                <ReadingForm
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
                <ReadingForm
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
                {(readings as ReadingAdminItem[]).map((text) => (
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
                {readings.length === 0 && (
                    <li className={styles.empty}>No readings yet.</li>
                )}
            </ul>
        </div>
    );
}
