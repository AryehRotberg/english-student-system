import { useState } from 'react';
import {
    useCreateSubjectLevel,
    useRemoveSubject,
    useRemoveSubjectLevel,
    useSaveSubject,
} from '../../hooks/mutations';
import { useSubject, useSubjects } from '../../hooks/queries';
import type { Subject } from '../../types/subject';
import { ENGLISH_SUBJECT_ID } from '../../types/subject';
import { getApiErrorMessage } from '../../utils/getApiErrorMessage';
import { PlusIcon } from '../hub/icons';
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
import { SubjectForm } from './subjects/SubjectForm';

/**
 * The subjects taught: a searchable table, and an editor page for one subject
 * and its levels (?subject=<id>, or ?subject=new for the create form).
 */
export function SubjectsSection() {
    const { data: subjects = [], isLoading } = useSubjects();
    const [search, setSearch] = useState('');
    const editor = useEditorParam('subject');
    const saveSubject = useSaveSubject();
    const removeSubject = useRemoveSubject();
    const nextSortOrder =
        subjects.reduce((max, s) => Math.max(max, s.sortOrder), 0) + 1;

    if (editor.isNew) {
        return (
            <div className={styles.editor}>
                <BackLink onClick={editor.close}>All subjects</BackLink>
                <section className={styles.editorCard}>
                    <h2 className={styles.editorTitle}>New subject</h2>
                    <p className={styles.editorHint}>
                        Once it is created, add its levels here and its
                        syllabus under Topics.
                    </p>
                    <SubjectForm
                        defaultSortOrder={nextSortOrder}
                        submitLabel="Create subject"
                        isPending={saveSubject.isPending}
                        error={
                            saveSubject.error
                                ? getApiErrorMessage(saveSubject.error)
                                : null
                        }
                        onCancel={editor.close}
                        onSubmit={async (payload) => {
                            const created = await saveSubject.mutateAsync(payload);
                            // Straight to the editor so levels can be added.
                            editor.open(created.id);
                        }}
                    />
                </section>
            </div>
        );
    }

    if (editor.openId) {
        return (
            <SubjectEditor
                key={editor.openId}
                subjectId={editor.openId}
                onBack={editor.close}
            />
        );
    }

    const term = search.trim().toLowerCase();
    const visible = subjects.filter(
        (subject) =>
            !term ||
            subject.nameEn.toLowerCase().includes(term) ||
            subject.nameHe.includes(term) ||
            subject.slug.includes(term),
    );

    const remove = (subject: Subject) => {
        if (
            !confirm(
                `Delete subject "${subject.nameEn}" and its levels? A subject used by quizzes, questions, topics or students can't be deleted.`,
            )
        ) {
            return;
        }
        removeSubject.mutate(subject.id);
    };

    return (
        <AdminListPanel
            id="admin-subjects-heading"
            title="All subjects"
            count={countLabel(visible.length, subjects.length, Boolean(term))}
            toolbar={
                <AdminSearch
                    value={search}
                    onChange={setSearch}
                    placeholder="Search by name or slug"
                    label="Search subjects"
                />
            }
        >
            {isLoading ? (
                <p className={styles.loading} role="status">
                    Loading subjects…
                </p>
            ) : visible.length > 0 ? (
                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th scope="col">Subject</th>
                                <th scope="col">Hebrew name</th>
                                <th scope="col">Slug</th>
                                <th scope="col">Levels</th>
                                <th scope="col">
                                    <span className={styles.srOnly}>Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {visible.map((subject) => (
                                <tr key={subject.id}>
                                    <td className={styles.primaryCell}>
                                        <button
                                            type="button"
                                            className={styles.rowTitle}
                                            dir="auto"
                                            onClick={() => editor.open(subject.id)}
                                        >
                                            {subject.nameEn}
                                        </button>
                                    </td>
                                    <td
                                        data-label="Hebrew name"
                                        className={`${styles.mutedCell} ${styles.labelled}`}
                                        dir="rtl"
                                    >
                                        {subject.nameHe}
                                    </td>
                                    <td data-label="Slug">
                                        <span className={styles.outlinePill}>
                                            {subject.slug}
                                        </span>
                                    </td>
                                    <td
                                        data-label="Levels"
                                        className={`${styles.time} ${styles.labelled}`}
                                    >
                                        {subject.levels.length === 0
                                            ? 'None'
                                            : subject.levels.length}
                                    </td>
                                    <td className={styles.actionsCell}>
                                        <div className={styles.actions}>
                                            <EditButton
                                                label={`Edit ${subject.nameEn}`}
                                                onClick={() => editor.open(subject.id)}
                                            />
                                            {/* The backend never removes English. */}
                                            {subject.id !== ENGLISH_SUBJECT_ID && (
                                                <RowMenu
                                                    label={`More actions for ${subject.nameEn}`}
                                                    items={[
                                                        {
                                                            label: 'Delete subject',
                                                            danger: true,
                                                            disabled:
                                                                removeSubject.isPending,
                                                            onSelect: () =>
                                                                remove(subject),
                                                        },
                                                    ]}
                                                />
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <AdminEmpty
                    title={term ? 'No subjects match your search' : 'No subjects yet'}
                    hint={
                        term
                            ? 'Try a different word.'
                            : 'Create the first one with “New subject” above.'
                    }
                    onClear={term ? () => setSearch('') : undefined}
                />
            )}
            {removeSubject.error && (
                <p className={styles.panelError}>
                    {getApiErrorMessage(removeSubject.error)}
                </p>
            )}
        </AdminListPanel>
    );
}

function SubjectEditor({
    subjectId,
    onBack,
}: {
    subjectId: string;
    onBack: () => void;
}) {
    const { data: subject, isLoading } = useSubject(subjectId);
    const saveSubject = useSaveSubject();
    const [saved, setSaved] = useState(false);

    return (
        <div className={styles.editor}>
            <BackLink onClick={onBack}>All subjects</BackLink>
            {isLoading ? (
                <p className={styles.loading}>Loading subject…</p>
            ) : !subject ? (
                <p className={styles.panelError}>Subject not found.</p>
            ) : (
                <>
                    <section className={styles.editorCard}>
                        <h2 className={styles.editorTitle} dir="auto">
                            {subject.nameEn} · {subject.nameHe}
                        </h2>
                        <SubjectForm
                            key={subject.id}
                            subject={subject}
                            defaultSortOrder={subject.sortOrder}
                            submitLabel={saved ? 'Saved' : 'Save details'}
                            isPending={saveSubject.isPending}
                            error={
                                saveSubject.error
                                    ? getApiErrorMessage(saveSubject.error)
                                    : null
                            }
                            onSubmit={async (payload) => {
                                await saveSubject.mutateAsync({
                                    id: subject.id,
                                    ...payload,
                                });
                                setSaved(true);
                                setTimeout(() => setSaved(false), 2000);
                            }}
                        />
                    </section>
                    <LevelsPanel subject={subject} />
                </>
            )}
        </div>
    );
}

function LevelsPanel({ subject }: { subject: Subject }) {
    const createLevel = useCreateSubjectLevel();
    const removeLevel = useRemoveSubjectLevel();
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const error = createLevel.error ?? removeLevel.error;

    return (
        <AdminListPanel
            id="admin-levels-heading"
            title="Levels"
            count={`${subject.levels.length} total`}
        >
            <p className={styles.panelHint}>
                CEFR for English; study units (יח״ל) for Math and Computer
                Science.
            </p>
            {subject.levels.length > 0 ? (
                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th scope="col">Level</th>
                                <th scope="col">Code</th>
                                <th scope="col">
                                    <span className={styles.srOnly}>Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {subject.levels.map((level) => (
                                <tr key={level.id}>
                                    <td className={styles.primaryCell}>
                                        <span className={styles.rowTitle} dir="auto">
                                            {level.name}
                                        </span>
                                    </td>
                                    <td data-label="Code">
                                        <span className={styles.outlinePill}>
                                            {level.code}
                                        </span>
                                    </td>
                                    <td className={styles.actionsCell}>
                                        <div className={styles.actions}>
                                            <RowMenu
                                                label={`More actions for ${level.name}`}
                                                items={[
                                                    {
                                                        label: 'Remove level',
                                                        danger: true,
                                                        disabled: removeLevel.isPending,
                                                        onSelect: () => {
                                                            if (
                                                                !confirm(
                                                                    `Remove level "${level.name}"?`,
                                                                )
                                                            )
                                                                return;
                                                            removeLevel.mutate(level.id);
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
                    title="No levels yet"
                    hint="Add the first one below."
                />
            )}
            <form
                className={styles.addRow}
                aria-label="Add a level"
                onSubmit={async (e) => {
                    e.preventDefault();
                    await createLevel.mutateAsync({
                        subjectId: subject.id,
                        code: code.trim(),
                        name: name.trim(),
                        sortOrder: subject.levels.length + 1,
                    });
                    setCode('');
                    setName('');
                }}
            >
                <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Code (e.g. 4u)"
                    aria-label="Level code"
                    pattern="[a-zA-Z0-9_\-]+"
                    required
                />
                <input
                    dir="auto"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder='Name (e.g. 4 יח"ל)'
                    aria-label="Level name"
                    required
                />
                <button
                    type="submit"
                    className={styles.primaryButton}
                    disabled={createLevel.isPending}
                >
                    <PlusIcon size={16} />
                    Add level
                </button>
            </form>
            {error && (
                <p className={styles.panelError}>{getApiErrorMessage(error)}</p>
            )}
        </AdminListPanel>
    );
}
