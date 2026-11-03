import { useState } from 'react';
import { useRemoveTopic, useSaveTopic } from '../../hooks/mutations';
import { useSubjects, useTopics } from '../../hooks/queries';
import type { Subject, Topic } from '../../types/subject';
import { getApiErrorMessage } from '../../utils/getApiErrorMessage';
import { descendantIds, flattenTopicTree } from '../../utils/topics';
import { PlusIcon } from '../hub/icons';
import {
    AdminEmpty,
    AdminListPanel,
    AdminSearch,
    AdminSelect,
    EditButton,
    RowMenu,
} from './list/AdminList';
import styles from './list/AdminList.module.css';
import { countLabel } from './list/countLabel';

/** The syllabus topic tree of one subject, picked from the toolbar. */
export function TopicsSection() {
    const { data: subjects = [] } = useSubjects();
    const [subjectId, setSubjectId] = useState('');
    const subject = subjects.find((s) => s.id === subjectId) ?? subjects[0];

    if (!subject) {
        return <p className={styles.loading}>Loading subjects…</p>;
    }

    return (
        <TopicsPanel
            key={subject.id}
            subject={subject}
            subjects={subjects}
            onSubjectChange={setSubjectId}
        />
    );
}

function TopicsPanel({
    subject,
    subjects,
    onSubjectChange,
}: {
    subject: Subject;
    subjects: Subject[];
    onSubjectChange: (subjectId: string) => void;
}) {
    const { data: topics = [], isLoading } = useTopics(subject.id);
    const saveTopic = useSaveTopic();
    const removeTopic = useRemoveTopic();
    const [editing, setEditing] = useState<Topic | null>(null);
    const [name, setName] = useState('');
    const [parentId, setParentId] = useState('');
    const [search, setSearch] = useState('');
    const error = saveTopic.error ?? removeTopic.error;
    const rows = flattenTopicTree(topics);
    // A topic can't move under itself or its own subtopics.
    const blockedParents = editing
        ? descendantIds(topics, editing.id)
        : new Set<string>();
    const term = search.trim().toLowerCase();
    const visible = term
        ? rows.filter(({ topic }) => topic.name.toLowerCase().includes(term))
        : rows;
    const parentName = (id: string | null) =>
        topics.find((t) => t.id === id)?.name ?? null;

    const reset = () => {
        setEditing(null);
        setName('');
        setParentId('');
    };

    return (
        <AdminListPanel
            id="admin-topics-heading"
            title={`Syllabus topics · ${subject.nameEn}`}
            count={countLabel(visible.length, rows.length, Boolean(term))}
            toolbar={
                <>
                    <AdminSearch
                        value={search}
                        onChange={setSearch}
                        placeholder="Search topics"
                        label="Search syllabus topics"
                    />
                    <AdminSelect
                        id="admin-topic-subject"
                        label="Subject"
                        value={subject.id}
                        onChange={onSubjectChange}
                    >
                        {subjects.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.nameEn} · {s.nameHe}
                            </option>
                        ))}
                    </AdminSelect>
                </>
            }
        >
            <p className={styles.panelHint}>
                Build the syllabus as a tree, e.g. Calculus › Derivatives, and
                tag questions and lessons with it.
            </p>
            {isLoading ? (
                <p className={styles.loading} role="status">
                    Loading topics…
                </p>
            ) : visible.length > 0 ? (
                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th scope="col">Topic</th>
                                <th scope="col">Parent</th>
                                <th scope="col">
                                    <span className={styles.srOnly}>Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {visible.map(({ topic, depth }) => (
                                <tr
                                    key={topic.id}
                                    aria-current={
                                        editing?.id === topic.id ? 'true' : undefined
                                    }
                                >
                                    <td className={styles.primaryCell}>
                                        <span
                                            className={styles.rowTitle}
                                            dir="auto"
                                            style={{
                                                paddingInlineStart: term
                                                    ? 0
                                                    : `${depth * 1.25}rem`,
                                            }}
                                        >
                                            {depth > 0 && !term && (
                                                <span
                                                    aria-hidden="true"
                                                    className={styles.treeMark}
                                                >
                                                    └{' '}
                                                </span>
                                            )}
                                            {topic.name}
                                        </span>
                                    </td>
                                    <td data-label="Parent" className={`${styles.mutedCell} ${styles.labelled}`}>
                                        {parentName(topic.parentId) ?? 'Top level'}
                                    </td>
                                    <td className={styles.actionsCell}>
                                        <div className={styles.actions}>
                                            <EditButton
                                                label={`Edit ${topic.name}`}
                                                onClick={() => {
                                                    setEditing(topic);
                                                    setName(topic.name);
                                                    setParentId(topic.parentId ?? '');
                                                }}
                                            />
                                            <RowMenu
                                                label={`More actions for ${topic.name}`}
                                                items={[
                                                    {
                                                        label: 'Delete topic',
                                                        danger: true,
                                                        disabled: removeTopic.isPending,
                                                        onSelect: () => {
                                                            if (
                                                                !confirm(
                                                                    `Delete topic "${topic.name}"?`,
                                                                )
                                                            )
                                                                return;
                                                            if (editing?.id === topic.id)
                                                                reset();
                                                            removeTopic.mutate(topic.id);
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
                    title={term ? 'No topics match your search' : 'No topics yet'}
                    hint={term ? 'Try a different word.' : 'Add the first one below.'}
                    onClear={term ? () => setSearch('') : undefined}
                />
            )}
            <form
                className={styles.addRow}
                aria-label={editing ? `Edit topic ${editing.name}` : 'Add a topic'}
                onSubmit={async (e) => {
                    e.preventDefault();
                    const siblings = topics.filter(
                        (t) => (t.parentId ?? '') === parentId,
                    );
                    await saveTopic.mutateAsync({
                        id: editing?.id,
                        subjectId: subject.id,
                        parentId: parentId || null,
                        name: name.trim(),
                        slug: editing?.slug,
                        category: editing?.category ?? null,
                        sortOrder: editing?.sortOrder ?? siblings.length,
                    });
                    reset();
                }}
            >
                <input
                    dir="auto"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Topic name (e.g. נגזרות)"
                    aria-label="Topic name"
                    required
                />
                <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    aria-label="Parent topic"
                >
                    <option value="">Top level</option>
                    {rows
                        .filter(({ topic }) => !blockedParents.has(topic.id))
                        .map(({ topic, depth }) => (
                            <option key={topic.id} value={topic.id}>
                                {'— '.repeat(depth)}
                                {topic.name}
                            </option>
                        ))}
                </select>
                <button
                    type="submit"
                    className={styles.primaryButton}
                    disabled={saveTopic.isPending}
                >
                    {editing ? (
                        'Save topic'
                    ) : (
                        <>
                            <PlusIcon size={16} />
                            Add topic
                        </>
                    )}
                </button>
                {editing && (
                    <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={reset}
                    >
                        Cancel
                    </button>
                )}
            </form>
            {error && (
                <p className={styles.panelError}>{getApiErrorMessage(error)}</p>
            )}
        </AdminListPanel>
    );
}
