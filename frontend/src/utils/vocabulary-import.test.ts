import { describe, expect, it } from 'vitest';
import {
    MAX_IMPORT_WORDS,
    countAudioClips,
    draftsFromJson,
    emptyDraft,
    parseTsv,
    pasteIntoDrafts,
    toImportPayload,
    validateDrafts,
    type VocabularyDraft,
} from './vocabulary-import';

function draft(word: string, rest: Partial<VocabularyDraft> = {}): VocabularyDraft {
    return { ...emptyDraft(), word, ...rest };
}

describe('parseTsv', () => {
    it('splits rows and cells and drops the trailing line break', () => {
        expect(parseTsv('a\tb\r\nc\td\r\n')).toEqual([
            ['a', 'b'],
            ['c', 'd'],
        ]);
    });

    it('keeps tabs, line breaks and doubled quotes inside quoted cells', () => {
        expect(parseTsv('"two\nlines"\t"say ""hi"""\n')).toEqual([
            ['two\nlines', 'say "hi"'],
        ]);
    });

    it('keeps empty cells', () => {
        expect(parseTsv('word\t\texample')).toEqual([['word', '', 'example']]);
    });
});

describe('pasteIntoDrafts', () => {
    const create = () => emptyDraft();

    it('lands a headerless paste at the focused cell and adds rows', () => {
        const rows = [draft('keep'), draft('')];
        const result = pasteIntoDrafts(
            rows,
            [
                ['A meaning', 'An example'],
                ['B meaning', 'B example'],
            ],
            1,
            1,
            create,
        );

        expect(result).toHaveLength(3);
        expect(result[0]).toEqual(draft('keep'));
        expect(result[1]).toMatchObject({ meaning: 'A meaning', example: 'An example' });
        expect(result[2]).toMatchObject({ word: '', meaning: 'B meaning' });
    });

    it('maps columns by a header row, in any order, and ignores unknown columns', () => {
        const result = pasteIntoDrafts(
            [emptyDraft()],
            [
                ['Translation', 'Word', 'Word sound'],
                ['הפתעה', 'Surprise', 'Surprise.'],
            ],
            0,
            3,
            create,
        );

        expect(result).toEqual([
            {
                word: 'Surprise',
                meaning: '',
                example: '',
                translation: 'הפתעה',
                wordSound: 'Surprise.',
            },
        ]);
    });

    it('treats a first row that is not all field names as data', () => {
        const result = pasteIntoDrafts(
            [emptyDraft()],
            [['word', 'a unit of language']],
            0,
            0,
            create,
        );
        expect(result[0]).toMatchObject({ word: 'word', meaning: 'a unit of language' });
    });

    it('clears the spoken form when the word is replaced', () => {
        const result = pasteIntoDrafts(
            [draft('old', { wordSound: 'Old.' })],
            [['new', 'meaning']],
            0,
            0,
            create,
        );
        expect(result[0].wordSound).toBeUndefined();
    });

    it('preserves extra properties such as row ids', () => {
        let id = 10;
        const rows = [{ ...emptyDraft(), id: 1 }];
        const result = pasteIntoDrafts(rows, [['a'], ['b']], 0, 0, () => ({
            ...emptyDraft(),
            id: id++,
        }));
        expect(result.map((r) => r.id)).toEqual([1, 10]);
    });
});

describe('draftsFromJson', () => {
    it('reads the vocabulary file format', () => {
        const json = JSON.stringify([
            {
                word: 'Surprise',
                word_sound: 'Surprise.',
                meaning: 'Something you did not know would happen.',
                example: 'People had a big surprise.',
                translation: 'הפתעה',
            },
            { word: 'Thin', meaning: 7 },
        ]);

        expect(draftsFromJson(json)).toEqual([
            {
                word: 'Surprise',
                wordSound: 'Surprise.',
                meaning: 'Something you did not know would happen.',
                example: 'People had a big surprise.',
                translation: 'הפתעה',
            },
            { word: 'Thin', meaning: '', example: '', translation: '' },
        ]);
    });

    it('rejects invalid JSON and non-arrays with a readable message', () => {
        expect(() => draftsFromJson('{oops')).toThrow('not valid JSON');
        expect(() => draftsFromJson('{"word":"a"}')).toThrow('JSON array');
    });
});

describe('validateDrafts', () => {
    it('ignores blank rows and accepts valid ones', () => {
        expect(validateDrafts([draft('apple'), emptyDraft(), draft('looked after')])).toEqual(
            [],
        );
    });

    it('reports a missing word, path characters and duplicates by row', () => {
        const issues = validateDrafts([
            draft('Apple'),
            draft('', { meaning: 'orphan meaning' }),
            draft('and/or'),
            draft(' apple '),
        ]);

        expect(issues.map((i) => i.row)).toEqual([2, 3, 4]);
        expect(issues[2].message).toContain('already in row 1');
    });

    it('reports more words than the server accepts', () => {
        const many = Array.from({ length: MAX_IMPORT_WORDS + 1 }, (_, i) => draft(`w${i}`));
        expect(validateDrafts(many)[0]).toMatchObject({ row: null });
    });
});

describe('toImportPayload', () => {
    it('skips blank rows, trims, and omits empty fields', () => {
        const payload = toImportPayload([
            draft(' Thin ', { meaning: ' Not fat. ', wordSound: 'Thin.' }),
            emptyDraft(),
        ]);

        expect(payload).toEqual([
            {
                word: 'Thin',
                word_sound: 'Thin.',
                meaning: 'Not fat.',
                example: undefined,
                translation: undefined,
            },
        ]);
        expect(countAudioClips(payload)).toBe(2);
    });
});
