import { useState } from 'react';
import { useRemoveLesson, useSaveLesson } from '../../hooks/mutations';
import { useLesson, useLessons, useSubjects } from '../../hooks/queries';
import type { LessonSummary } from '../../types/lesson';
import { lessonTitle } from '../../types/lesson';
import { getApiErrorMessage } from '../../utils/getApiErrorMessage';
import { toneClass } from '../hub/tones';
import { LessonForm } from './lessons/LessonForm';
import { LessonMaterialsEditor } from './lessons/LessonMaterialsEditor';
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

/**
 * Lessons per subject: a searchable table, and an editor page for one lesson
 * (?lesson=<id>, or ?lesson=new for the create form).
 */
export function LessonsSection() {
    const { data: subjects = [] } = useSubjects();
    const [subjectId, setSubjectId] = useState('');
    const [search, setSearch] = useState('');
    const [topicFilter, setTopicFilter] = useState('');
    const editor = useEditorParam('lesson');
    const subject = subjects.find((s) => s.id === subjectId) ?? subjects[0];
    const { data: lessons = [], isLoading } = useLessons(
        subject?.id,
        Boolean(subject),
    );
    const saveLesson = useSaveLesson();
    const removeLesson = useRemoveLesson();

    if (!subject) {
        return <p className={styles.loading}>Loading subjects…</p>;
    }

    if (editor.isNew) {
        return (
            <div className={styles.editor}>
                <BackLink onClick={editor.close}>All lessons</BackLink>
                <section className={styles.editorCard}>
                    <h2 className={styles.editorTitle}>
                        New lesson · {subject.nameEn}
                    </h2>
                    <p className={styles.editorHint}>
                        Start with the topic and text; the next step is adding
                        PDF slides or HTML pages.
                    </p>
                    <LessonForm
                        key={`new-${subject.id}`}
                        subjectId={subject.id}
                        submitLabel="Create lesson"
                        isPending={saveLesson.isPending}
                        error={
                            saveLesson.error
                                ? getApiErrorMessage(saveLesson.error)
                                : null
                        }
                        onCancel={editor.close}
                        onSubmit={async (payload) => {
                            const created = await saveLesson.mutateAsync(payload);
                            // Straight to the editor so files can be added.
                            editor.open(created.id);
                        }}
                    />
                </section>
            </div>
        );
    }

    if (editor.openId) {
        return (
            <LessonEditor
                key={editor.openId}
                lessonId={editor.openId}
                subjectId={subject.id}
                onBack={editor.close}
            />
        );
    }

    const topics = [
        ...new Map(lessons.map((l) => [l.topicId, l.topicName])).entries(),
    ];
    const term = search.trim().toLowerCase();
    const visible = lessons.filter(
        (lesson) =>
            (!topicFilter || lesson.topicId === topicFilter) &&
            (!term ||
                lessonTitle(lesson).toLowerCase().includes(term) ||
                lesson.topicName.toLowerCase().includes(term)),
    );
    const isFiltered = Boolean(term || topicFilter);

    const remove = (lesson: LessonSummary) => {
        if (
            !confirm(
                `Delete lesson "${lessonTitle(lesson)}" and its files? Quizzes that show it will stop showing it.`,
            )
        ) {
            return;
        }
        removeLesson.mutate(lesson.id);
    };

    return (
        <AdminListPanel
            id="admin-lessons-heading"
            title="All lessons"
            count={countLabel(visible.length, lessons.length, isFiltered)}
            toolbar={
                <>
                    <AdminSearch
                        value={search}
                        onChange={setSearch}
                        placeholder="Search by title or topic"
                        label="Search lessons"
                    />
                    <AdminSelect
                        id="admin-lesson-subject"
                        label="Subject"
                        value={subject.id}
                        onChange={(value) => {
                            setSubjectId(value);
                            setTopicFilter('');
                        }}
                    >
                        {subjects.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.nameEn}
                            </option>
                        ))}
                    </AdminSelect>
                    {topics.length > 1 && (
                        <AdminSelect
                            id="admin-lesson-topic"
                            label="Topic"
                            value={topicFilter}
                            onChange={setTopicFilter}
                        >
                            <option value="">All topics</option>
                            {topics.map(([id, name]) => (
                                <option key={id} value={id}>
                                    {name}
                                </option>
                            ))}
                        </AdminSelect>
                    )}
                </>
            }
        >
            {isLoading ? (
                <p className={styles.loading} role="status">
                    Loading lessons…
                </p>
            ) : visible.length > 0 ? (
                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th scope="col">Lesson</th>
                                <th scope="col">Topic</th>
                                <th scope="col">Files</th>
                                <th scope="col">
                                    <span className={styles.srOnly}>Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {visible.map((lesson) => {
                                const title = lessonTitle(lesson);

                                return (
                                    <tr key={lesson.id}>
                                        <td className={styles.primaryCell}>
                                            <button
                                                type="button"
                                                className={styles.rowTitle}
                                                dir="auto"
                                                onClick={() => editor.open(lesson.id)}
                                            >
                                                {title}
                                            </button>
                                        </td>
                                        <td data-label="Topic">
                                            <span
                                                className={`${styles.pill} ${toneClass.rose}`}
                                                dir="auto"
                                            >
                                                {lesson.topicName}
                                            </span>
                                        </td>
                                        <td
                                            data-label="Files"
                                            className={`${styles.time} ${styles.labelled}`}
                                        >
                                            {lesson.materialCount === 0
                                                ? 'None'
                                                : lesson.materialCount}
                                        </td>
                                        <td className={styles.actionsCell}>
                                            <div className={styles.actions}>
                                                <EditButton
                                                    label={`Edit ${title}`}
                                                    onClick={() =>
                                                        editor.open(lesson.id)
                                                    }
                                                />
                                                <RowMenu
                                                    label={`More actions for ${title}`}
                                                    items={[
                                                        {
                                                            label: 'Delete lesson',
                                                            danger: true,
                                                            disabled:
                                                                removeLesson.isPending,
                                                            onSelect: () =>
                                                                remove(lesson),
                                                        },
                                                    ]}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <AdminEmpty
                    title={
                        isFiltered
                            ? 'No lessons match these filters'
                            : `No lessons for ${subject.nameEn} yet`
                    }
                    hint={
                        isFiltered
                            ? 'Try a different word or topic.'
                            : 'Create the first one with “New lesson” above.'
                    }
                    onClear={
                        isFiltered
                            ? () => {
                                  setSearch('');
                                  setTopicFilter('');
                              }
                            : undefined
                    }
                />
            )}
            {removeLesson.error && (
                <p className={styles.panelError}>
                    {getApiErrorMessage(removeLesson.error)}
                </p>
            )}
        </AdminListPanel>
    );
}

function LessonEditor({
    lessonId,
    subjectId,
    onBack,
}: {
    lessonId: string;
    subjectId: string;
    onBack: () => void;
}) {
    const { data: lesson, isLoading } = useLesson(lessonId);
    const saveLesson = useSaveLesson();
    const [saved, setSaved] = useState(false);

    return (
        <div className={styles.editor}>
            <BackLink onClick={onBack}>All lessons</BackLink>
            {isLoading ? (
                <p className={styles.loading}>Loading lesson…</p>
            ) : !lesson ? (
                <p className={styles.panelError}>Lesson not found.</p>
            ) : (
                <>
                    <section className={styles.editorCard}>
                        <h2 className={styles.editorTitle} dir="auto">
                            {lessonTitle(lesson)}
                        </h2>
                        <LessonForm
                            key={lesson.id}
                            subjectId={lesson.subjectId || subjectId}
                            lesson={lesson}
                            submitLabel={saved ? 'Saved' : 'Save details'}
                            isPending={saveLesson.isPending}
                            error={
                                saveLesson.error
                                    ? getApiErrorMessage(saveLesson.error)
                                    : null
                            }
                            onSubmit={async (payload) => {
                                await saveLesson.mutateAsync({
                                    id: lesson.id,
                                    ...payload,
                                });
                                setSaved(true);
                                setTimeout(() => setSaved(false), 2000);
                            }}
                        />
                    </section>
                    <section className={styles.editorCard}>
                        <LessonMaterialsEditor lesson={lesson} />
                    </section>
                </>
            )}
        </div>
    );
}
