import { describe, expect, it } from 'vitest';
import type { Topic } from '../types/subject';
import { searchOptions } from './search-options';
import { descendantIds, flattenTopicTree, topicOptions } from './topics';

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

describe('topicOptions', () => {
    it('keeps tree order, depth and each topic’s ancestors', () => {
        expect(topicOptions(topics).map((o) => [o.id, o.depth, o.path])).toEqual([
            ['geo', 0, []],
            ['calc', 0, []],
            ['deriv', 1, ['Calculus']],
            ['integ', 1, ['Calculus']],
            ['orphan', 0, []],
        ]);
    });
});

describe('searchOptions', () => {
    const rows = topicOptions(topics);
    const ids = (query: string) => searchOptions(rows, query).map((r) => r.id);

    it('returns every option for an empty query', () => {
        expect(ids('  ')).toHaveLength(topics.length);
    });

    it('works on flat lists without a path', () => {
        const flat = [
            { id: 'q1', label: 'Past simple quiz' },
            { id: 'q2', label: 'Simple present' },
        ];
        expect(searchOptions(flat, 'simple').map((o) => o.id)).toEqual(['q2', 'q1']);
    });

    it('matches regardless of case', () => {
        expect(ids('INTEG')).toEqual(['integ']);
    });

    it('lists name matches before topics found through their parent', () => {
        expect(ids('calc')).toEqual(['calc', 'deriv', 'integ']);
    });

    it('puts names starting with the query before names containing it', () => {
        expect(ids('ra')).toEqual(['integ']);
        expect(ids('g')).toEqual(['geo', 'integ']);
    });

    it('needs every word, across the path and the name', () => {
        expect(ids('calculus deriv')).toEqual(['deriv']);
        expect(ids('geometry deriv')).toEqual([]);
    });

    it('ignores accents and Hebrew vowel marks', () => {
        const hebrew = topicOptions([topic('h', 'מִשְׁוָאוֹת', null), topic('c', 'Café', null)]);
        expect(searchOptions(hebrew, 'משואות').map((r) => r.id)).toEqual(['h']);
        expect(searchOptions(hebrew, 'cafe').map((r) => r.id)).toEqual(['c']);
    });
});
