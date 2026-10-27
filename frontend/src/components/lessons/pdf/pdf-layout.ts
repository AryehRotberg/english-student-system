export type PageSize = { width: number; height: number };
export type PdfLayout = 'slides' | 'document';

// How many leading pages decide the layout. Enough to see past a portrait
// cover page, few enough to stay instant on long documents.
export const LAYOUT_SAMPLE_PAGES = 8;

/**
 * Presentations (mostly landscape pages) read best one page at a time;
 * worksheets, articles and scans (mostly portrait) read best as a scrolling
 * column, since a whole A4 page squeezed into one screen is unreadable on a
 * phone. Ties go to slides.
 */
export function chooseLayout(sizes: PageSize[]): PdfLayout {
    if (sizes.length === 0) return 'document';
    const landscape = sizes.filter((s) => s.width > s.height).length;
    return landscape * 2 >= sizes.length ? 'slides' : 'document';
}

// The largest scale at which the whole page fits inside the box.
export function containScale(page: PageSize, box: PageSize): number {
    if (page.width <= 0 || page.height <= 0) return 1;
    return Math.max(0, Math.min(box.width / page.width, box.height / page.height));
}
