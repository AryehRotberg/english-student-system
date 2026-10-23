import { useState } from 'react';
import { useVocabularyTopicWords } from '../../../hooks/queries';
import {
    useImportVocabularyWords,
    useUpdateVocabularyWord,
    useDeleteVocabularyWord,
} from '../../../hooks/mutations';
import type {
    VocabularyImportWord,
    VocabularyTopicPreview,
    VocabularyWord,
} from '../../../types/vocabulary';
import { BulkWordForm } from './BulkWordForm';
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
    // Separate instances so an error in one panel does not show up in the other.
    const addWord = useImportVocabularyWords();
    const addWords = useImportVocabularyWords();
    const updateWord = useUpdateVocabularyWord();
    const deleteWord = useDeleteVocabularyWord();

    const [addPanel, setAddPanel] = useState<'one' | 'several' | null>(null);
    const [wordEdit, setWordEdit] = useState<WordEditState | null>(null);

    const toggleAddPanel = (panel: 'one' | 'several') => {
        setAddPanel((current) => (current === panel ? null : panel));
        setWordEdit(null);
        addWord.reset();
        addWords.reset();
    };

    // The word, its audio and the topic link are saved together: if the audio
    // cannot be generated, nothing is added.
    const handleCreateWord = (values: WordFormValues) =>
        addWord.mutate(
            {
                topicId: topic.id,
                words: [
                    {
                        word: values.word,
                        meaning: values.meaning || undefined,
                        example: values.example || undefined,
                        translation: values.translation || undefined,
                    },
                ],
                includeAudio: values.includeAudio,
            },
            { onSuccess: () => setAddPanel(null) },
        );

    const handleCreateWords = (
        newWords: VocabularyImportWord[],
        includeAudio: boolean,
    ) =>
        addWords.mutate(
            { topicId: topic.id, words: newWords, includeAudio },
            { onSuccess: () => setAddPanel(null) },
        );

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
        setAddPanel(null);
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
                                    color: 'var(--ink-500)',
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
                        paddingInlineEnd: '1rem',
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
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button
                                type="button"
                                className={styles.addButton}
                                onClick={() => toggleAddPanel('one')}
                            >
                                {addPanel === 'one' ? 'Cancel' : '+ Add Word'}
                            </button>
                            <button
                                type="button"
                                className={styles.addButton}
                                onClick={() => toggleAddPanel('several')}
                            >
                                {addPanel === 'several'
                                    ? 'Cancel'
                                    : '+ Add Several'}
                            </button>
                        </div>
                    </div>

                    {addPanel === 'one' && (
                        <WordForm
                            submitLabel="Add Word"
                            showAudioCheckbox
                            isPending={addWord.isPending}
                            isError={addWord.isError}
                            errorMessage={addWord.error?.message}
                            onSubmit={handleCreateWord}
                            onCancel={() => setAddPanel(null)}
                        />
                    )}

                    {addPanel === 'several' && (
                        <BulkWordForm
                            isPending={addWords.isPending}
                            isError={addWords.isError}
                            errorMessage={addWords.error?.message}
                            onSubmit={handleCreateWords}
                            onCancel={() => setAddPanel(null)}
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
