import { useState } from 'react';
import {
    useCreateSubjectLevel,
    useRemoveSubjectLevel,
    useRemoveTopic,
    useSaveTopic,
} from '../../hooks/mutations';
import { useSubjects, useTopics } from '../../hooks/queries';
import styles from '../../pages/Admin/AdminPage.module.css';
import type { Subject, Topic } from '../../types/subject';
import { getApiErrorMessage } from '../../utils/getApiErrorMessage';
import { descendantIds, flattenTopicTree } from '../../utils/topics';

export function SubjectsSection() {
    const { data: subjects = [] } = useSubjects();
    const [subjectId, setSubjectId] = useState('');
    const subject = subjects.find((s) => s.id === subjectId) ?? subjects[0];

    if (!subject) {
        return (
            <div className={styles.section}>
                <p className={styles.empty}>Loading subjects…</p>
            </div>
        );
    }

    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h3>Subjects</h3>
                <select
                    className={styles.subjectFilter}
                    value={subject.id}
                    onChange={(e) => setSubjectId(e.target.value)}
                    aria-label="Subject"
                >
                    {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                            {s.nameEn} · {s.nameHe}
                        </option>
                    ))}
                </select>
            </div>

            <LevelsEditor key={`levels-${subject.id}`} subject={subject} />
            <TopicTreeEditor key={`topics-${subject.id}`} subject={subject} />
        </div>
    );
}

function LevelsEditor({ subject }: { subject: Subject }) {
    const createLevel = useCreateSubjectLevel();
    const removeLevel = useRemoveSubjectLevel();
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const error = createLevel.error ?? removeLevel.error;

    return (
        <div className={styles.subSection}>
            <h4>Levels</h4>
            <p className={styles.hintText}>
                CEFR for English; study units (יח״ל) for Math and Computer
                Science.
            </p>
            <ul className={styles.subList}>
                {subject.levels.map((level) => (
                    <li key={level.id} className={styles.subItem}>
                        <div className={styles.subItemRow}>
                            <span dir="auto">
                                <strong>{level.name}</strong> ({level.code})
                            </span>
                            <button
                                type="button"
                                className={styles.deleteBtn}
                                disabled={removeLevel.isPending}
                                onClick={() => {
                                    if (!confirm(`Remove level "${level.name}"?`))
                                        return;
                                    removeLevel.mutate(level.id);
                                }}
                            >
                                Remove
                            </button>
                        </div>
                    </li>
                ))}
                {subject.levels.length === 0 && (
                    <li className={styles.empty}>No levels yet.</li>
                )}
            </ul>
            <form
                className={styles.inlineForm}
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
                    pattern="[a-zA-Z0-9_\-]+"
                    required
                />
                <input
                    dir="auto"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder='Name (e.g. 4 יח"ל)'
                    required
                />
                <button
                    type="submit"
                    className={styles.addOptionBtn}
                    disabled={createLevel.isPending}
                >
                    Add level
                </button>
            </form>
            {error && <p className={styles.error}>{getApiErrorMessage(error)}</p>}
        </div>
    );
}

function TopicTreeEditor({ subject }: { subject: Subject }) {
    const { data: topics = [] } = useTopics(subject.id);
    const saveTopic = useSaveTopic();
    const removeTopic = useRemoveTopic();
    const [editing, setEditing] = useState<Topic | null>(null);
    const [name, setName] = useState('');
    const [parentId, setParentId] = useState('');
    const error = saveTopic.error ?? removeTopic.error;
    const rows = flattenTopicTree(topics);
    // A topic can't move under itself or its own subtopics.
    const blockedParents = editing
        ? descendantIds(topics, editing.id)
        : new Set<string>();

    const reset = () => {
        setEditing(null);
        setName('');
        setParentId('');
    };

    return (
        <div className={styles.subSection}>
            <h4>Syllabus topics</h4>
            <p className={styles.hintText}>
                Build the syllabus as a tree, e.g. Calculus › Derivatives, and
                tag questions with it.
            </p>
            <ul className={styles.subList}>
                {rows.map(({ topic, depth }) => (
                    <li key={topic.id} className={styles.subItem}>
                        <div
                            className={styles.subItemRow}
                            style={{ paddingInlineStart: `${depth * 1.5}rem` }}
                        >
                            <span dir="auto">
                                {depth > 0 ? '└ ' : ''}
                                {topic.name}
                            </span>
                            <button
                                type="button"
                                className={styles.editBtn}
                                onClick={() => {
                                    setEditing(topic);
                                    setName(topic.name);
                                    setParentId(topic.parentId ?? '');
                                }}
                            >
                                Edit
                            </button>
                            <button
                                type="button"
                                className={styles.deleteBtn}
                                disabled={removeTopic.isPending}
                                onClick={() => {
                                    if (!confirm(`Delete topic "${topic.name}"?`))
                                        return;
                                    removeTopic.mutate(topic.id);
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
                {rows.length === 0 && (
                    <li className={styles.empty}>No topics yet.</li>
                )}
            </ul>
            <form
                className={styles.inlineForm}
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
                    className={styles.addOptionBtn}
                    disabled={saveTopic.isPending}
                >
                    {editing ? 'Save topic' : 'Add topic'}
                </button>
                {editing && (
                    <button
                        type="button"
                        className={styles.cancelBtn}
                        onClick={reset}
                    >
                        Cancel
                    </button>
                )}
            </form>
            {error && <p className={styles.error}>{getApiErrorMessage(error)}</p>}
        </div>
    );
}
