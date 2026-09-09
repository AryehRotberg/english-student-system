import { useState } from 'react';
import {
    useCreateText,
    useDeleteText,
    useUpdateText,
    useUploadTextAudio,
} from '../../hooks/mutations';
import {
    useQuizzes,
    useReadings,
    useVocabularyTopics,
} from '../../hooks/queries';
import styles from '../../pages/Admin/AdminPage.module.css';
import { audioService } from '../../services/audio.service';
import type { ReadingAdminItem } from '../../types/admin-query-items';
import type { ReadingFormValues } from './readings/ReadingForm';
import { ReadingForm } from './readings/ReadingForm';
import { TextItem } from './readings/TextItem';

type EditState = { id: string } & ReadingFormValues;

export function ReadingsSection() {
    const { data: readings = [] } = useReadings();
    const { data: quizzes = [] } = useQuizzes();
    const { data: vocabTopics = [] } = useVocabularyTopics();
    const createText = useCreateText();
    const updateText = useUpdateText();
    const deleteText = useDeleteText();
    const uploadTextAudio = useUploadTextAudio();

    const [showForm, setShowForm] = useState(false);
    const [editState, setEditState] = useState<EditState | null>(null);
    const [expandedTextId, setExpandedTextId] = useState<string | null>(null);
    const [createAudioError, setCreateAudioError] = useState<string | null>(
        null,
    );
    const [uploadingTextId, setUploadingTextId] = useState<string | null>(null);
    const [uploadErrors, setUploadErrors] = useState<Record<string, string>>(
        {},
    );

    const handleCreate = async (values: ReadingFormValues) => {
        setCreateAudioError(null);

        const created = await createText.mutateAsync({
            title: values.title,
            content: values.content,
            level: values.level,
            quizId: values.quizId || undefined,
            vocabularyTopicId: values.vocabularyTopicId || undefined,
        });

        if (created?.id && values.audioFile) {
            try {
                await uploadTextAudio.mutateAsync({
                    textId: created.id,
                    file: values.audioFile,
                });
            } catch (err) {
                setCreateAudioError(
                    `The text was created, but the audio upload failed: ${
                        (err as Error).message
                    }`,
                );
                return;
            }
        } else if (created?.id && values.includeAudio) {
            await audioService.generateAndSaveTts(
                values.content,
                'texts',
                `${created.id}.mp3`,
            );
        }

        setShowForm(false);
    };

    const handleUploadAudio = async (textId: string, file: File) => {
        setUploadingTextId(textId);
        setUploadErrors((prev) => {
            if (!prev[textId]) return prev;
            const next = { ...prev };
            delete next[textId];
            return next;
        });

        try {
            await uploadTextAudio.mutateAsync({ textId, file });
        } catch (err) {
            setUploadErrors((prev) => ({
                ...prev,
                [textId]: (err as Error).message,
            }));
        } finally {
            setUploadingTextId(null);
        }
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
            audioFile: null,
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
                    showAudioOptions
                    isPending={
                        createText.isPending || uploadTextAudio.isPending
                    }
                    isError={createText.isError || Boolean(createAudioError)}
                    errorMessage={
                        createAudioError ??
                        (createText.error as Error | null)?.message
                    }
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
                        onUploadAudio={(file) =>
                            void handleUploadAudio(text.id, file)
                        }
                        uploadIsPending={uploadingTextId === text.id}
                        uploadErrorMessage={uploadErrors[text.id]}
                    />
                ))}
                {readings.length === 0 && (
                    <li className={styles.empty}>No readings yet.</li>
                )}
            </ul>
        </div>
    );
}
