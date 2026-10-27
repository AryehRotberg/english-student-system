import { describe, expect, it } from 'vitest';
import { chooseLayout, containScale } from './pdf-layout';

const slide = { width: 1280, height: 720 };
const a4 = { width: 595, height: 842 };

describe('chooseLayout', () => {
    it('shows a 16:9 deck as slides', () => {
        expect(chooseLayout([slide, slide, slide])).toBe('slides');
    });

    it('shows a 4:3 deck as slides', () => {
        expect(chooseLayout([{ width: 1024, height: 768 }])).toBe('slides');
    });

    it('shows an A4 worksheet as a document', () => {
        expect(chooseLayout([a4, a4])).toBe('document');
    });

    it('is not fooled by one portrait cover page', () => {
        expect(chooseLayout([a4, slide, slide, slide])).toBe('slides');
    });

    it('gives a tie to slides and an empty file to document', () => {
        expect(chooseLayout([a4, slide])).toBe('slides');
        expect(chooseLayout([])).toBe('document');
    });
});

describe('containScale', () => {
    it('fits a wide page to the box width', () => {
        expect(containScale(slide, { width: 640, height: 640 })).toBe(0.5);
    });

    it('fits a tall page to the box height', () => {
        expect(containScale(a4, { width: 1000, height: 421 })).toBe(0.5);
    });

    it('never returns a negative or invalid scale', () => {
        expect(containScale({ width: 0, height: 0 }, { width: 100, height: 100 })).toBe(1);
        expect(containScale(slide, { width: -5, height: 100 })).toBe(0);
    });
});
