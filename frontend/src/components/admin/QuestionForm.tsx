import { useRef, useState } from 'react';
import {
    useCreateQuestion,
    useRemoveQuestionImage,
    useUpdateQuestion,
    useUploadQuestionImage,
} from '../../hooks/mutations';
import { useTopics } from '../../hooks/queries';
import styles from '../../pages/Admin/AdminPage.module.css';
import { audioService } from '../../services/audio.service';
import { QUESTION_IMAGE_TYPES } from '../../services/answer-files.service';
import type { SaveQuestionPayload } from '../../services/questions.service';
import type { QuestionAdminItem } from '../../types/admin-query-items';
import type { ContentFormat, QuestionType } from '../../types/quiz';
import { ENGLISH_SUBJECT_ID } from '../../types/subject';
import { getApiErrorMessage } from '../../utils/getApiErrorMessage';
import { flattenTopicTree } from '../../utils/topics';
import { QuestionImage } from '../content/QuestionImage';
import { RichText } from '../content/RichText';
import { SubjectLevelFields } from './SubjectLevelFields';

type Props = {
    question?: QuestionAdminItem;
    defaultSubjectId?: string;
    defaultLevelId?: string | null;
    /** Inside a quiz the question must belong to the quiz's subject. */
    lockSubject?: boolean;
    /** Handwritten questions only fit teacher-graded quizzes. */
    allowHandwritten?: boolean;
    submitLabel?: string;
    onCancel?: () => void;
    onDone: (saved?: QuestionAdminItem) => void | Promise<void>;
};

function toFormState(
    question: QuestionAdminItem | undefined,
    defaultSubjectId: string,
    defaultLevelId: string | null,
    allowHandwritten: boolean,
): Required<SaveQuestionPayload> {
    const subjectId = question?.subjectId ?? defaultSubjectId;
    const isEnglish = subjectId === ENGLISH_SUBJECT_ID;

    return {
        question: question?.question ?? '',
        questionType: (question?.questionType as QuestionType) ??
            (isEnglish || !allowHandwritten ? 'multiple_choice' : 'handwritten'),
        hints: question?.hints ?? '',
        subjectId,
        levelId: question?.levelId ?? defaultLevelId,
        contentFormat: question?.contentFormat ?? (isEnglish ? 'plain' : 'markdown'),
        source: question?.source ?? '',
        topicIds: question?.topicIds ?? [],
    };
}

/** Create or edit a question: text (Markdown + LaTeX), type, subject, tags. */
export function QuestionForm({
    question,
    defaultSubjectId = ENGLISH_SUBJECT_ID,
    defaultLevelId = null,
    lockSubject = false,
    allowHandwritten = true,
    submitLabel,
    onCancel,
    onDone,
}: Props) {
    const createQuestion = useCreateQuestion();
    const updateQuestion = useUpdateQuestion();
    const [form, setForm] = useState(() =>
        toFormState(question, defaultSubjectId, defaultLevelId, allowHandwritten),
    );
    const [includeAudio, setIncludeAudio] = useState(false);
    const { data: topics = [] } = useTopics(form.subjectId);
    const mutation = question ? updateQuestion : createQuestion;
    const isEnglish = form.subjectId === ENGLISH_SUBJECT_ID;

    const set = (patch: Partial<typeof form>) =>
        setForm((current) => ({ ...current, ...patch }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.question.trim()) return;

        const payload: SaveQuestionPayload = {
            ...form,
            question: form.question.trim(),
            hints: form.hints?.trim() || null,
            source: form.source?.trim() || null,
        };

        if (question) {
            const updated = await updateQuestion.mutateAsync({
                id: question.id,
                ...payload,
            });
            await onDone(updated);
        } else {
            const created = await createQuestion.mutateAsync(payload);
            if (includeAudio && isEnglish && created?.id) {
                await audioService.generateAndSaveTts(
                    payload.question,
                    'questions',
                    `${created.id}.mp3`,
                );
            }
            await onDone(created);
        }
    };

    const toggleTopic = (topicId: string) =>
        set({
            topicIds: form.topicIds.includes(topicId)
                ? form.topicIds.filter((id) => id !== topicId)
                : [...form.topicIds, topicId],
        });

    return (
        <form className={styles.form} onSubmit={(e) => void handleSubmit(e)}>
            <SubjectLevelFields
                subjectId={form.subjectId}
                levelId={form.levelId}
                lockSubject={lockSubject}
                onChange={(value) =>
                    set({
                        ...value,
                        // Topics belong to a subject; a new level keeps them.
                        topicIds:
                            value.subjectId === form.subjectId
                                ? form.topicIds
                                : [],
                    })
                }
            />
            <div className={styles.fieldRow}>
                <div className={styles.field}>
                    <label>Type</label>
                    <select
                        value={form.questionType}
                        onChange={(e) =>
                            set({
                                questionType: e.target.value as QuestionType,
                            })
                        }
                    >
                        {(allowHandwritten ||
                            form.questionType === 'handwritten') && (
                            <option value="handwritten">
                                Handwritten (student uploads photos/PDF)
                            </option>
                        )}
                        <option value="multiple_choice">Multiple Choice</option>
                        <option value="open_ended">
                            Open Ended (fill in the blank)
                        </option>
                    </select>
                </div>
                <div className={styles.field}>
                    <label>Text format</label>
                    <select
                        value={form.contentFormat}
                        onChange={(e) =>
                            set({
                                contentFormat: e.target.value as ContentFormat,
                            })
                        }
                    >
                        <option value="plain">Plain text</option>
                        <option value="markdown">
                            Markdown + LaTeX ($x^2$) + code blocks
                        </option>
                    </select>
                </div>
            </div>
            <div className={styles.field}>
                <label>Question text *</label>
                <textarea
                    dir="auto"
                    value={form.question}
                    onChange={(e) => set({ question: e.target.value })}
                    rows={form.contentFormat === 'markdown' ? 6 : 3}
                    placeholder={
                        form.contentFormat === 'markdown'
                            ? 'e.g. Find the derivative of $f(x)=x^3-2x$ and its extrema.'
                            : 'Question text'
                    }
                    required
                />
            </div>
            {form.contentFormat === 'markdown' && (
                <p className={styles.hintText}>
                    Inline math: $x^2$. A centred formula: put $$ on its own
                    line before and after it. Code: wrap it in ``` lines.
                </p>
            )}
            {form.contentFormat === 'markdown' && form.question.trim() && (
                <div className={styles.preview}>
                    <span className={styles.previewLabel}>Preview</span>
                    <RichText content={form.question} format="markdown" />
                </div>
            )}
            <div className={styles.fieldRow}>
                <div className={styles.field}>
                    <label>Hint</label>
                    <input
                        dir="auto"
                        value={form.hints ?? ''}
                        onChange={(e) => set({ hints: e.target.value })}
                        placeholder="Optional"
                    />
                </div>
                <div className={styles.field}>
                    <label>Source</label>
                    <input
                        dir="auto"
                        value={form.source ?? ''}
                        onChange={(e) => set({ source: e.target.value })}
                        placeholder='e.g. בגרות 5 יח"ל קיץ 2024 שאלה 3'
                    />
                </div>
            </div>
            {topics.length > 0 && (
                <fieldset className={styles.topicPicker}>
                    <legend>Topics</legend>
                    {flattenTopicTree(topics).map(({ topic, depth }) => (
                        <label
                            key={topic.id}
                            className={styles.checkLabel}
                            style={{ paddingInlineStart: `${depth * 1.25}rem` }}
                        >
                            <input
                                type="checkbox"
                                checked={form.topicIds.includes(topic.id)}
                                onChange={() => toggleTopic(topic.id)}
                            />
                            <span dir="auto">{topic.name}</span>
                        </label>
                    ))}
                </fieldset>
            )}
            {!question && isEnglish && (
                <label className={styles.checkLabel}>
                    <input
                        type="checkbox"
                        checked={includeAudio}
                        onChange={(e) => setIncludeAudio(e.target.checked)}
                    />
                    Generate audio
                </label>
            )}
            {question && <QuestionImageManager question={question} />}
            <div className={styles.formActions}>
                <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={mutation.isPending}
                >
                    {mutation.isPending
                        ? 'Saving…'
                        : (submitLabel ??
                          (question ? 'Save changes' : 'Create Question'))}
                </button>
                {onCancel && (
                    <button
                        type="button"
                        className={styles.cancelBtn}
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                )}
            </div>
            {!question && (
                <p className={styles.hintText}>
                    {form.questionType === 'multiple_choice'
                        ? 'Answer options and a diagram can be added right after saving.'
                        : form.questionType === 'open_ended'
                          ? 'Correct answers and a diagram can be added right after saving.'
                          : 'A diagram can be added right after saving.'}
                </p>
            )}
            {mutation.isError && (
                <p className={styles.error}>
                    {getApiErrorMessage(mutation.error)}
                </p>
            )}
        </form>
    );
}

function QuestionImageManager({ question }: { question: QuestionAdminItem }) {
    const upload = useUploadQuestionImage();
    const remove = useRemoveQuestionImage();
    const inputRef = useRef<HTMLInputElement>(null);
    const error = upload.error ?? remove.error;

    return (
        <div className={styles.field}>
            <label>Diagram</label>
            <QuestionImage
                questionId={question.id}
                hasImage={question.hasImage}
            />
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                    type="button"
                    className={styles.editBtn}
                    disabled={upload.isPending}
                    onClick={() => inputRef.current?.click()}
                >
                    {upload.isPending
                        ? 'Uploading…'
                        : question.hasImage
                          ? 'Replace image'
                          : 'Upload image'}
                </button>
                {question.hasImage && (
                    <button
                        type="button"
                        className={styles.deleteBtn}
                        disabled={remove.isPending}
                        onClick={() => remove.mutate(question.id)}
                    >
                        Remove image
                    </button>
                )}
            </div>
            <input
                ref={inputRef}
                type="file"
                hidden
                accept={QUESTION_IMAGE_TYPES.join(',')}
                onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = '';
                    if (file) {
                        upload.mutate({ questionId: question.id, file });
                    }
                }}
            />
            {error && (
                <p className={styles.error}>{getApiErrorMessage(error)}</p>
            )}
        </div>
    );
}
