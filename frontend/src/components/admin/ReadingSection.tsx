import { useRef, useState } from 'react';
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
import { audioService } from '../../services/audio.service';
import type { ReadingAdminItem } from '../../types/admin-query-items';
import { markdownExcerpt } from '../../utils/plainText';
import { toneClass } from '../hub/tones';
import {
    AdminEmpty,
    AdminListPanel,
    AdminSearch,
    AdminSelect,
    BackLink,
    EditButton,
    RowMenu,
} from './list/AdminList';
import styles from './list/AdminList.module.css';
import { countLabel } from './list/countLabel';
import { useEditorParam } from './list/useEditorParam';
import type { ReadingFormValues } from './readings/ReadingForm';
import { ReadingForm } from './readings/ReadingForm';

const LEVEL_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

/**
 * Reading texts: a searchable table, and an editor page for one text
 * (?text=<id>, or ?text=new for the create form).
 */
export function ReadingsSection() {
    const { data: readings = [], isLoading } = useReadings();
    const { data: quizzes = [] } = useQuizzes();
    const { data: vocabTopics = [] } = useVocabularyTopics();
    const createText = useCreateText();
    const updateText = useUpdateText();
    const deleteText = useDeleteText();
    const uploadTextAudio = useUploadTextAudio();
    const editor = useEditorParam('text');

    const [search, setSearch] = useState('');
    const [levelFilter, setLevelFilter] = useState('');
    const [createAudioError, setCreateAudioError] = useState<string | null>(
        null,
    );
    // One hidden file input serves every row; this remembers which row asked.
    const fileInputRef = useRef<HTMLInputElement>(null);
    const audioTargetRef = useRef<string | null>(null);
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

        editor.close();
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

    if (editor.isNew) {
        return (
            <div className={styles.editor}>
                <BackLink onClick={editor.close}>All texts</BackLink>
                <section className={styles.editorCard}>
                    <h2 className={styles.editorTitle}>New text</h2>
                    <ReadingForm
                        submitLabel="Create text"
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
                        onCancel={editor.close}
                    />
                </section>
            </div>
        );
    }

    const editing = editor.openId
        ? readings.find((text) => text.id === editor.openId)
        : undefined;

    if (editor.openId) {
        return (
            <div className={styles.editor}>
                <BackLink onClick={editor.close}>All texts</BackLink>
                {!editing ? (
                    <p className={styles.loading}>
                        {isLoading ? 'Loading text…' : 'Text not found.'}
                    </p>
                ) : (
                    <section className={styles.editorCard}>
                        <h2 className={styles.editorTitle} dir="auto">
                            {editing.title}
                        </h2>
                        <ReadingForm
                            key={editing.id}
                            initialTitle={editing.title}
                            initialContent={editing.content}
                            initialLevel={editing.level}
                            initialQuizId={editing.quiz?.id ?? ''}
                            initialVocabularyTopicId={
                                editing.vocabularyTopic?.id ?? ''
                            }
                            submitLabel="Save changes"
                            isPending={updateText.isPending}
                            isError={updateText.isError}
                            errorMessage={
                                (updateText.error as Error | null)?.message
                            }
                            quizzes={quizzes}
                            vocabTopics={vocabTopics}
                            onSubmit={async (values) => {
                                await updateText.mutateAsync({
                                    id: editing.id,
                                    title: values.title,
                                    content: values.content,
                                    level: values.level,
                                    quizId: values.quizId || null,
                                    vocabularyTopicId:
                                        values.vocabularyTopicId || null,
                                });
                                editor.close();
                            }}
                            onCancel={editor.close}
                        />
                    </section>
                )}
            </div>
        );
    }

    const levels = [...new Set(readings.map((text) => text.level))].sort(
        (a, b) => LEVEL_ORDER.indexOf(a) - LEVEL_ORDER.indexOf(b),
    );
    const term = search.trim().toLowerCase();
    const visible = (readings as ReadingAdminItem[]).filter(
        (text) =>
            (!levelFilter || text.level === levelFilter) &&
            (!term ||
                text.title.toLowerCase().includes(term) ||
                text.content.toLowerCase().includes(term)),
    );
    const isFiltered = Boolean(term || levelFilter);

    return (
        <AdminListPanel
            id="admin-readings-heading"
            title="All texts"
            count={countLabel(visible.length, readings.length, isFiltered)}
            toolbar={
                <>
                    <AdminSearch
                        value={search}
                        onChange={setSearch}
                        placeholder="Search by title or text"
                        label="Search texts"
                    />
                    {levels.length > 1 && (
                        <AdminSelect
                            id="admin-reading-level"
                            label="Level"
                            value={levelFilter}
                            onChange={setLevelFilter}
                        >
                            <option value="">All levels</option>
                            {levels.map((level) => (
                                <option key={level} value={level}>
                                    {level}
                                </option>
                            ))}
                        </AdminSelect>
                    )}
                </>
            }
        >
            <input
                ref={fileInputRef}
                type="file"
                accept="audio/mpeg,.mp3"
                hidden
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    const textId = audioTargetRef.current;
                    e.target.value = '';
                    if (file && textId) void handleUploadAudio(textId, file);
                }}
            />
            {isLoading ? (
                <p className={styles.loading} role="status">
                    Loading texts…
                </p>
            ) : visible.length > 0 ? (
                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th scope="col">Text</th>
                                <th scope="col">Level</th>
                                <th scope="col">Linked to</th>
                                <th scope="col">
                                    <span className={styles.srOnly}>Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {visible.map((text) => (
                                <tr key={text.id}>
                                    <td className={styles.primaryCell}>
                                        <button
                                            type="button"
                                            className={styles.rowTitle}
                                            dir="auto"
                                            onClick={() => editor.open(text.id)}
                                        >
                                            {text.title}
                                        </button>
                                        <span className={styles.excerpt} dir="auto">
                                            {markdownExcerpt(text.content)}
                                        </span>
                                        {uploadingTextId === text.id && (
                                            <span className={styles.rowNote}>
                                                Uploading audio…
                                            </span>
                                        )}
                                        {uploadErrors[text.id] && (
                                            <span className={styles.rowError}>
                                                Audio upload failed:{' '}
                                                {uploadErrors[text.id]}
                                            </span>
                                        )}
                                    </td>
                                    <td data-label="Level">
                                        <span className={styles.outlinePill}>
                                            {text.level}
                                        </span>
                                    </td>
                                    <td data-label="Linked to">
                                        <div className={styles.pillStack}>
                                            {text.quiz && (
                                                <span
                                                    className={`${styles.pill} ${toneClass.amber}`}
                                                    dir="auto"
                                                >
                                                    Quiz · {text.quiz.title}
                                                </span>
                                            )}
                                            {text.vocabularyTopic && (
                                                <span
                                                    className={`${styles.pill} ${toneClass.teal}`}
                                                    dir="auto"
                                                >
                                                    Vocabulary ·{' '}
                                                    {text.vocabularyTopic.topic}
                                                </span>
                                            )}
                                            {!text.quiz && !text.vocabularyTopic && (
                                                <span className={styles.none}>—</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className={styles.actionsCell}>
                                        <div className={styles.actions}>
                                            <EditButton
                                                label={`Edit ${text.title}`}
                                                onClick={() => editor.open(text.id)}
                                            />
                                            <RowMenu
                                                label={`More actions for ${text.title}`}
                                                items={[
                                                    {
                                                        label: 'Upload audio (MP3)',
                                                        disabled:
                                                            uploadingTextId !== null,
                                                        onSelect: () => {
                                                            audioTargetRef.current =
                                                                text.id;
                                                            fileInputRef.current?.click();
                                                        },
                                                    },
                                                    {
                                                        label: 'Delete text',
                                                        danger: true,
                                                        disabled: deleteText.isPending,
                                                        onSelect: () => {
                                                            if (
                                                                !confirm(
                                                                    `Delete "${text.title}"?`,
                                                                )
                                                            )
                                                                return;
                                                            deleteText.mutate(text.id);
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
                        isFiltered
                            ? 'No texts match these filters'
                            : 'No reading texts yet'
                    }
                    hint={
                        isFiltered
                            ? 'Try a different word or level.'
                            : 'Create the first one with “New text” above.'
                    }
                    onClear={
                        isFiltered
                            ? () => {
                                  setSearch('');
                                  setLevelFilter('');
                              }
                            : undefined
                    }
                />
            )}
        </AdminListPanel>
    );
}
