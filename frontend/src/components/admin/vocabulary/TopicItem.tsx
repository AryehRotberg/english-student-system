import { useState } from 'react';
import { useVocabularyTopicWords } from '../../../hooks/queries';
import {
    useCreateVocabularyWord,
    useUpdateVocabularyWord,
    useDeleteVocabularyWord,
} from '../../../hooks/mutations';
import { audioService } from '../../../services/audio.service';
import type {
    VocabularyTopicPreview,
    VocabularyWord,
} from '../../../types/vocabulary';
import { WordForm, type WordFormValues } from './WordForm';
import { WordItem } from './WordItem';
import styles from '../../../pages/Admin/AdminPage.module.css';

type WordEditState = {
    vocabularyId: string;
    word: string;
    meaning: string;
    example: string;
    translation: string;
};

type TopicItemProps = {
    topic: VocabularyTopicPreview;
    isSelected: boolean;
    onSelect: () => void;
    onEdit: () => void;
    onDelete: () => void;
};

export function TopicItem({
    topic,
    isSelected,
    onSelect,
    onEdit,
    onDelete,
}: TopicItemProps) {
    const { data: words = [] } = useVocabularyTopicWords(
        isSelected ? topic.id : undefined,
    );
    const createWord = useCreateVocabularyWord();
    const updateWord = useUpdateVocabularyWord();
    const deleteWord = useDeleteVocabularyWord();

    const [showWordForm, setShowWordForm] = useState(false);
    const [wordEdit, setWordEdit] = useState<WordEditState | null>(null);

    const handleCreateWord = async (values: WordFormValues) => {
        await createWord.mutateAsync({
            topicId: topic.id,
            word: values.word,
            meaning: values.meaning || undefined,
            example: values.example || undefined,
            translation: values.translation || undefined,
        });
        if (values.includeAudio) {
            const wordLower = values.word.toLowerCase();
            const promises: Promise<void>[] = [
                audioService.generateAndSaveTts(
                    values.word,
                    'vocabulary',
                    `${wordLower}.mp3`,
                ),
            ];
            if (values.meaning)
                promises.push(
                    audioService.generateAndSaveTts(
                        values.meaning,
                        'vocabulary',
                        `${wordLower}_meaning.mp3`,
                    ),
                );
            if (values.example)
                promises.push(
                    audioService.generateAndSaveTts(
                        values.example,
                        'vocabulary',
                        `${wordLower}_example.mp3`,
                    ),
                );
            await Promise.all(promises);
        }
        setShowWordForm(false);
    };

    const handleUpdateWord = async (values: WordFormValues) => {
        if (!wordEdit) return;
        await updateWord.mutateAsync({
            id: wordEdit.vocabularyId,
            topicId: topic.id,
            word: values.word,
            meaning: values.meaning || undefined,
            example: values.example || undefined,
            translation: values.translation || undefined,
        });
        setWordEdit(null);
    };

    const startEditWord = (w: VocabularyWord) => {
        setShowWordForm(false);
        setWordEdit({
            vocabularyId: w.vocabularyId,
            word: w.word,
            meaning: w.meaning ?? '',
            example: w.example ?? '',
            translation: w.translation ?? '',
        });
    };

    return (
        <li className={`${styles.item} ${styles.expandable}`}>
            {/* Topic row */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <button
                    type="button"
                    className={styles.expandRow}
                    style={{ flex: 1 }}
                    onClick={onSelect}
                >
                    <div className={styles.expandRowLeft}>
                        <strong>{topic.topic}</strong>
                        {topic.description && (
                            <span
                                style={{
                                    color: '#6b7280',
                                    fontSize: '0.85rem',
                                }}
                            >
                                {topic.description}
                            </span>
                        )}
                    </div>
                    <span className={styles.chevron}>
                        {isSelected ? '▲' : '▼'}
                    </span>
                </button>
                <div
                    style={{
                        display: 'flex',
                        gap: '0.4rem',
                        paddingRight: '1rem',
                        flexShrink: 0,
                    }}
                >
                    <button
                        type="button"
                        className={styles.editBtn}
                        onClick={onEdit}
                    >
                        Edit
                    </button>
                    <button
                        type="button"
                        className={styles.deleteBtn}
                        onClick={() => {
                            if (!confirm(`Delete topic "${topic.topic}"?`))
                                return;
                            onDelete();
                        }}
                    >
                        Delete
                    </button>
                </div>
            </div>

            {/* Words section (shown when selected) */}
            {isSelected && (
                <div style={{ padding: '0 1rem 1rem' }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '0.5rem',
                        }}
                    >
                        <span className={styles.subHeading}>
                            Words in &ldquo;{topic.topic}&rdquo;
                        </span>
                        <button
                            type="button"
                            className={styles.addButton}
                            onClick={() => {
                                setShowWordForm((v) => !v);
                                setWordEdit(null);
                            }}
                        >
                            {showWordForm ? 'Cancel' : '+ Add Word'}
                        </button>
                    </div>

                    {showWordForm && (
                        <WordForm
                            submitLabel="Add Word"
                            showAudioCheckbox
                            isPending={createWord.isPending}
                            isError={createWord.isError}
                            errorMessage={(createWord.error as Error)?.message}
                            onSubmit={(values) => void handleCreateWord(values)}
                            onCancel={() => setShowWordForm(false)}
                        />
                    )}

                    {wordEdit && (
                        <WordForm
                            key={wordEdit.vocabularyId}
                            heading="Editing word"
                            initialWord={wordEdit.word}
                            initialMeaning={wordEdit.meaning}
                            initialExample={wordEdit.example}
                            initialTranslation={wordEdit.translation}
                            submitLabel="Save Word"
                            isPending={updateWord.isPending}
                            isError={updateWord.isError}
                            errorMessage={(updateWord.error as Error)?.message}
                            onSubmit={(values) => void handleUpdateWord(values)}
                            onCancel={() => setWordEdit(null)}
                        />
                    )}

                    <ul
                        className={styles.itemList}
                        style={{ marginTop: '0.5rem' }}
                    >
                        {(words as VocabularyWord[]).map((w) => (
                            <WordItem
                                key={w.id}
                                word={w}
                                onEdit={startEditWord}
                                onDelete={(word) =>
                                    void deleteWord.mutate({
                                        id: word.vocabularyId,
                                        topicId: topic.id,
                                    })
                                }
                            />
                        ))}
                        {words.length === 0 && (
                            <li className={styles.empty}>
                                No words yet. Add one above.
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </li>
    );
}
