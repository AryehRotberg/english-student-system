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
import { PlusIcon } from '../../hub/icons';
import { toneClass } from '../../hub/tones';
import { EditButton, RowMenu } from '../list/AdminList';
import listStyles from '../list/AdminList.module.css';

type WordEditState = {
    vocabularyId: string;
    word: string;
    meaning: string;
    example: string;
    translation: string;
};

/** A topic's words: add one or several, edit and delete them. */
export function TopicWords({ topic }: { topic: VocabularyTopicPreview }) {
    const { data: words = [] } = useVocabularyTopicWords(topic.id);
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

    const remove = (w: VocabularyWord) => {
        if (!confirm(`Delete word "${w.word}"?`)) return;
        deleteWord.mutate({ id: w.vocabularyId, topicId: topic.id });
    };

    return (
        <div className={listStyles.stack}>
            <div className={listStyles.editorHead}>
                <h2 className={listStyles.editorTitle}>
                    Words{' '}
                    <span className={listStyles.panelCount}>
                        · {words.length}
                    </span>
                </h2>
                <div className={listStyles.editorActions}>
                    <button
                        type="button"
                        className={listStyles.secondaryButton}
                        aria-pressed={addPanel === 'one'}
                        onClick={() => toggleAddPanel('one')}
                    >
                        <PlusIcon size={16} />
                        Add word
                    </button>
                    <button
                        type="button"
                        className={listStyles.secondaryButton}
                        aria-pressed={addPanel === 'several'}
                        onClick={() => toggleAddPanel('several')}
                    >
                        <PlusIcon size={16} />
                        Add several
                    </button>
                </div>
            </div>

            {addPanel === 'one' && (
                <WordForm
                    submitLabel="Add word"
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
                    heading={`Editing “${wordEdit.word}”`}
                    initialWord={wordEdit.word}
                    initialMeaning={wordEdit.meaning}
                    initialExample={wordEdit.example}
                    initialTranslation={wordEdit.translation}
                    submitLabel="Save word"
                    isPending={updateWord.isPending}
                    isError={updateWord.isError}
                    errorMessage={(updateWord.error as Error)?.message}
                    onSubmit={(values) => void handleUpdateWord(values)}
                    onCancel={() => setWordEdit(null)}
                />
            )}

            {words.length === 0 ? (
                <p className={listStyles.editorHint}>
                    No words yet. Add one above.
                </p>
            ) : (
                <div className={listStyles.tableWrap}>
                    <table className={listStyles.table}>
                        <thead>
                            <tr>
                                <th scope="col">Word</th>
                                <th scope="col">Translation</th>
                                <th scope="col">
                                    <span className={listStyles.srOnly}>
                                        Actions
                                    </span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {(words as VocabularyWord[]).map((w) => (
                                <tr key={w.id}>
                                    <td className={listStyles.primaryCell}>
                                        <span
                                            className={listStyles.rowTitle}
                                            dir="auto"
                                        >
                                            {w.word}
                                        </span>
                                        {w.meaning && (
                                            <span
                                                className={listStyles.rowDesc}
                                                dir="auto"
                                            >
                                                {w.meaning}
                                            </span>
                                        )}
                                        {w.example && (
                                            <span
                                                className={listStyles.rowExample}
                                                dir="auto"
                                            >
                                                {w.example}
                                            </span>
                                        )}
                                    </td>
                                    <td data-label="Translation">
                                        {w.translation ? (
                                            <span
                                                className={`${listStyles.pill} ${toneClass.violet}`}
                                                dir="auto"
                                            >
                                                {w.translation}
                                            </span>
                                        ) : (
                                            <span className={listStyles.none}>
                                                —
                                            </span>
                                        )}
                                    </td>
                                    <td className={listStyles.actionsCell}>
                                        <div className={listStyles.actions}>
                                            <EditButton
                                                label={`Edit ${w.word}`}
                                                onClick={() => startEditWord(w)}
                                            />
                                            <RowMenu
                                                label={`More actions for ${w.word}`}
                                                items={[
                                                    {
                                                        label: 'Delete word',
                                                        danger: true,
                                                        disabled:
                                                            deleteWord.isPending,
                                                        onSelect: () => remove(w),
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
            )}
        </div>
    );
}
