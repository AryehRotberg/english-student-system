import { describe, expect, it } from 'vitest';
import type { Topic } from '../types/subject';
import { descendantIds, flattenTopicTree } from './topics';

function topic(id: string, name: string, parentId: string | null, sortOrder = 0): Topic {
    return {
        id,
        subjectId: 'math',
        parentId,
        slug: id,
        name,
        category: null,
        sortOrder,
    };
}

const topics = [
    topic('deriv', 'Derivatives', 'calc', 0),
    topic('calc', 'Calculus', null, 1),
    topic('geo', 'Geometry', null, 0),
    topic('integ', 'Integrals', 'calc', 1),
    topic('orphan', 'Orphan', 'missing', 2),
];

describe('flattenTopicTree', () => {
    it('lists parents before children, ordered by sortOrder, with depth', () => {
        expect(
            flattenTopicTree(topics).map(({ topic: t, depth }) => [t.id, depth]),
        ).toEqual([
            ['geo', 0],
            ['calc', 0],
            ['deriv', 1],
            ['integ', 1],
            ['orphan', 0],
        ]);
    });

    it('survives a cycle in bad data', () => {
        const cyclic = [topic('a', 'A', 'b'), topic('b', 'B', 'a')];
        expect(flattenTopicTree(cyclic)).toEqual([]);
    });
});

describe('descendantIds', () => {
    it('includes the topic and everything below it', () => {
        expect([...descendantIds(topics, 'calc')].sort()).toEqual([
            'calc',
            'deriv',
            'integ',
        ]);
    });
});
