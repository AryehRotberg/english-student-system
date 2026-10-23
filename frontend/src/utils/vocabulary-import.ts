// Turning spreadsheet pastes and vocabulary JSON files into rows for the bulk word
// form, and those rows into the body of POST /vocabulary-topic-words/import.

import type { VocabularyImportWord } from '../types/vocabulary';

// Mirrors ImportVocabularyTopicWordsHandler.MaxWords on the server.
export const MAX_IMPORT_WORDS = 50;

export type VocabularyField = 'word' | 'meaning' | 'example' | 'translation';

// Column order of the grid, and of a pasted spreadsheet without a header row.
export const VOCABULARY_FIELDS: VocabularyField[] = [
    'word',
    'meaning',
    'example',
    'translation',
];

export type VocabularyDraft = Record<VocabularyField, string> & {
    // What the word clip says, when a JSON file or a "word sound" column sets it.
    // Not shown in the grid; editing the word clears it.
    wordSound?: string;
};

export type DraftIssue = { row: number | null; message: string };

const MAX_LENGTHS: Record<VocabularyField, number> = {
    word: 100,
    meaning: 1000,
    example: 1000,
    translation: 200,
};
const MAX_WORD_SOUND_LENGTH = 200;

// Header cell → field. Lowercased, with spaces, underscores and dashes removed.
const HEADER_ALIASES: Record<string, VocabularyField | 'wordSound'> = {
    word: 'word',
    meaning: 'meaning',
    definition: 'meaning',
    example: 'example',
    examplesentence: 'example',
    translation: 'translation',
    wordsound: 'wordSound',
};

export function emptyDraft(): VocabularyDraft {
    return { word: '', meaning: '', example: '', translation: '' };
}

export function isBlankDraft(draft: VocabularyDraft): boolean {
    return VOCABULARY_FIELDS.every((field) => draft[field].trim() === '');
}

// Splits clipboard text copied from Excel or Google Sheets: rows by line break,
// cells by tab. A cell holding a tab, line break or quote arrives wrapped in
// quotes, with inner quotes doubled.
export function parseTsv(text: string): string[][] {
    const rows: string[][] = [];
    let row: string[] = [];
    let cell = '';
    let quoted = false;

    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (quoted) {
            if (ch === '"' && text[i + 1] === '"') {
                cell += '"';
                i++;
            } else if (ch === '"') {
                quoted = false;
            } else {
                cell += ch;
            }
        } else if (ch === '"' && cell === '') {
            quoted = true;
        } else if (ch === '\t') {
            row.push(cell);
            cell = '';
        } else if (ch === '\n' || ch === '\r') {
            if (ch === '\r' && text[i + 1] === '\n') i++;
            row.push(cell);
            rows.push(row);
            row = [];
            cell = '';
        } else {
            cell += ch;
        }
    }

    // Spreadsheets end the copy with a line break; that leaves nothing to flush.
    if (cell !== '' || row.length > 0) {
        row.push(cell);
        rows.push(row);
    }
    return rows;
}

// The field each column holds, when the first row is a header such as
// "Word | Meaning | Example | Translation". Null when it is data.
function headerColumns(
    firstRow: string[],
): (VocabularyField | 'wordSound' | null)[] | null {
    const columns = firstRow.map(
        (cell) =>
            HEADER_ALIASES[cell.trim().toLowerCase().replace(/[\s_-]/g, '')] ??
            null,
    );
    const namesAll = firstRow.every(
        (cell, i) => cell.trim() === '' || columns[i] !== null,
    );
    return namesAll && columns.includes('word') ? columns : null;
}

// Writes pasted cells into the grid. With a header row, columns go to the fields
// they name and rows start at `startRow`. Without one, the paste lands like in a
// spreadsheet: its top-left cell at (`startRow`, `startField`). Rows are added as
// needed; rows above `startRow` are untouched.
export function pasteIntoDrafts<T extends VocabularyDraft>(
    drafts: T[],
    cells: string[][],
    startRow: number,
    startField: number,
    createDraft: () => T,
): T[] {
    const header = cells.length > 0 ? headerColumns(cells[0]) : null;
    const body = header ? cells.slice(1) : cells;
    const columns: (VocabularyField | 'wordSound' | null)[] =
        header ?? VOCABULARY_FIELDS.slice(startField);

    const result = [...drafts];
    body.forEach((cellRow, offset) => {
        const index = startRow + offset;
        const draft: T = { ...(result[index] ?? createDraft()) };
        cellRow.forEach((value, column) => {
            const field = columns[column];
            if (!field) return;
            if (field === 'wordSound') {
                draft.wordSound = value.trim() || undefined;
                return;
            }
            draft[field] = value.trim();
            if (field === 'word' && !header?.includes('wordSound')) {
                draft.wordSound = undefined;
            }
        });
        result[index] = draft;
    });
    return result;
}

// Reads a vocabulary JSON file: an array of { word, meaning, example, translation,
// word_sound }. Missing or non-text fields become empty.
export function draftsFromJson(text: string): VocabularyDraft[] {
    let parsed: unknown;
    try {
        parsed = JSON.parse(text);
    } catch {
        throw new Error('The file is not valid JSON.');
    }

    if (!Array.isArray(parsed)) {
        throw new Error('The file must contain a JSON array of words.');
    }

    const asText = (value: unknown) =>
        typeof value === 'string' ? value.trim() : '';

    return parsed.map((item): VocabularyDraft => {
        const entry = (item ?? {}) as Record<string, unknown>;
        const wordSound = asText(entry.word_sound ?? entry.wordSound);
        return {
            word: asText(entry.word),
            meaning: asText(entry.meaning),
            example: asText(entry.example),
            translation: asText(entry.translation),
            ...(wordSound ? { wordSound } : {}),
        };
    });
}

// Everything the server would reject, as messages with 1-based row numbers. Blank
// rows are ignored.
export function validateDrafts(drafts: VocabularyDraft[]): DraftIssue[] {
    const issues: DraftIssue[] = [];
    const seen = new Map<string, number>();
    let count = 0;

    drafts.forEach((draft, index) => {
        if (isBlankDraft(draft)) return;
        count++;
        const row = index + 1;
        const word = draft.word.trim();

        if (word === '') {
            issues.push({ row, message: `Row ${row}: the word is missing.` });
        } else if (/[/\\]|\.\./.test(word)) {
            issues.push({
                row,
                message: `Row ${row}: a word cannot contain "/", "\\" or "..".`,
            });
        } else {
            const key = word.toLowerCase();
            const first = seen.get(key);
            if (first !== undefined) {
                issues.push({
                    row,
                    message: `Row ${row}: "${word}" is already in row ${first}.`,
                });
            } else {
                seen.set(key, row);
            }
        }

        for (const field of VOCABULARY_FIELDS) {
            if (draft[field].trim().length > MAX_LENGTHS[field]) {
                issues.push({
                    row,
                    message: `Row ${row}: the ${field} is longer than ${MAX_LENGTHS[field]} characters.`,
                });
            }
        }
        if ((draft.wordSound?.length ?? 0) > MAX_WORD_SOUND_LENGTH) {
            issues.push({
                row,
                message: `Row ${row}: the word sound is longer than ${MAX_WORD_SOUND_LENGTH} characters.`,
            });
        }
    });

    if (count > MAX_IMPORT_WORDS) {
        issues.unshift({
            row: null,
            message: `Add at most ${MAX_IMPORT_WORDS} words at a time (there are ${count}).`,
        });
    }
    return issues;
}

export function toImportPayload(
    drafts: VocabularyDraft[],
): VocabularyImportWord[] {
    return drafts
        .filter((draft) => !isBlankDraft(draft))
        .map((draft) => ({
            word: draft.word.trim(),
            word_sound: draft.wordSound?.trim() || undefined,
            meaning: draft.meaning.trim() || undefined,
            example: draft.example.trim() || undefined,
            translation: draft.translation.trim() || undefined,
        }));
}

// Speech requests the import makes: the word, plus the meaning and example when set.
export function countAudioClips(words: VocabularyImportWord[]): number {
    return words.reduce(
        (total, w) => total + 1 + (w.meaning ? 1 : 0) + (w.example ? 1 : 0),
        0,
    );
}
