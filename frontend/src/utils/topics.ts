import type { Topic } from '../types/subject';

export type TopicRow = { topic: Topic; depth: number };

/**
 * Depth-first order of a subject's syllabus tree (Calculus > Derivatives >
 * ...), siblings sorted by sortOrder then name. Topics whose parent is missing
 * are treated as roots so nothing disappears from the list.
 */
export function flattenTopicTree(topics: Topic[]): TopicRow[] {
    const ids = new Set(topics.map((t) => t.id));
    const children = new Map<string | null, Topic[]>();

    for (const topic of topics) {
        const parent =
            topic.parentId && ids.has(topic.parentId) ? topic.parentId : null;
        children.set(parent, [...(children.get(parent) ?? []), topic]);
    }

    for (const list of children.values()) {
        list.sort(
            (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
        );
    }

    const rows: TopicRow[] = [];
    const visited = new Set<string>();

    const visit = (parentId: string | null, depth: number) => {
        for (const topic of children.get(parentId) ?? []) {
            // Guards against a cycle in bad data.
            if (visited.has(topic.id)) continue;
            visited.add(topic.id);
            rows.push({ topic, depth });
            visit(topic.id, depth + 1);
        }
    };

    visit(null, 0);
    return rows;
}

/** Ids of a topic and everything below it (for "can't be its own parent"). */
export function descendantIds(topics: Topic[], topicId: string): Set<string> {
    const result = new Set<string>([topicId]);
    let added = true;

    while (added) {
        added = false;
        for (const topic of topics) {
            if (
                topic.parentId &&
                result.has(topic.parentId) &&
                !result.has(topic.id)
            ) {
                result.add(topic.id);
                added = true;
            }
        }
    }

    return result;
}
