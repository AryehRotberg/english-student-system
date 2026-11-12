export type SearchOption = {
    id: string;
    label: string;
    /** What the option sits under, outermost first ("Calculus" > ...). */
    path?: string[];
    /** Indentation in the unfiltered list (topic trees). */
    depth?: number;
};

// Case- and accent-insensitive (also ignores Hebrew niqqud).
function normalize(text: string): string {
    return text
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .toLocaleLowerCase()
        .trim();
}

/**
 * Options matching a typed query, best first: labels starting with the query,
 * then labels containing it, then options found through their path (typing
 * "calculus" also lists everything under Calculus). Every word of the query
 * must appear somewhere in the label or path. Ties keep the original order.
 * An empty query returns every option.
 */
export function searchOptions<T extends SearchOption>(options: T[], query: string): T[] {
    const needle = normalize(query);
    if (!needle) return options;
    const words = needle.split(/\s+/);

    const ranked: { option: T; rank: number }[] = [];
    for (const option of options) {
        const label = normalize(option.label);
        const haystack = [...(option.path ?? []).map(normalize), label].join(' ');
        if (!words.every((word) => haystack.includes(word))) continue;

        const rank = label.startsWith(needle) ? 0 : label.includes(needle) ? 1 : 2;
        ranked.push({ option, rank });
    }

    // Array.prototype.sort is stable, so equal ranks keep the original order.
    return ranked.sort((a, b) => a.rank - b.rank).map(({ option }) => option);
}
