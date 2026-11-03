// Markdown's escapable characters; while formatting is stripped, escaped ones
// are parked in the private-use range so they survive as text.
const ESCAPABLE = '\\`*_{}[]()#+-.!>|~';
const PARKED = 0xe000;

const ENTITIES: Record<string, string> = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' ',
};

/**
 * The readable words of a markdown text, for card previews: HTML, images and
 * formatting are dropped, links keep their text.
 */
export function markdownToPlainText(markdown: string): string {
    return (
        markdown
            .replace(/<!--[\s\S]*?-->/g, ' ')
            .replace(/<[^>]*>/g, ' ')
            // Images, then links ([text](url) and [text][ref]) down to their text.
            .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
            .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
            .replace(/\[([^\]]*)\]\[[^\]]*\]/g, '$1')
            // Headings, quotes, list bullets and numbers at the start of a line.
            .replace(/^[ \t]*(#{1,6}|>|[-*+]|\d+[.)])[ \t]+/gm, '')
            .replace(/^[ \t]*([-*_][ \t]*){3,}$/gm, ' ')
            // Escaped characters keep the character; a lone backslash is a line break.
            .replace(/\\([\\`*_{}[\]()#+\-.!>|~])/g, (_, char: string) =>
                String.fromCharCode(PARKED + ESCAPABLE.indexOf(char)),
            )
            .replace(/(\*\*|__|~~|`+|\*|\b_|_\b)/g, '')
            .replace(/\\/g, ' ')
            .replace(/[-]/g, (char) =>
                ESCAPABLE.charAt(char.charCodeAt(0) - PARKED),
            )
            .replace(/&(#\d+|[a-z]+);/gi, (entity, name: string) => {
                if (name.startsWith('#')) {
                    return String.fromCharCode(Number(name.slice(1)));
                }
                return ENTITIES[name.toLowerCase()] ?? entity;
            })
            .replace(/\s+/g, ' ')
            .trim()
    );
}

/** The opening of a markdown text as plain words, cut at a word boundary. */
export function markdownExcerpt(markdown: string, maxLength = 200): string {
    const text = markdownToPlainText(markdown);
    if (text.length <= maxLength) return text;
    const cut = text.slice(0, maxLength);
    const lastSpace = cut.lastIndexOf(' ');
    return `${cut.slice(0, lastSpace > maxLength / 2 ? lastSpace : maxLength)}…`;
}
