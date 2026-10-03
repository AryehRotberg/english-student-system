import { describe, expect, it } from 'vitest';
import {
    checkSourceFile,
    fitWithin,
    MAX_IMAGE_DIMENSION,
    MAX_UPLOAD_BYTES,
    needsReencoding,
} from './upload-files';

function fakeFile(name: string, type: string, size: number): File {
    const file = new File(['x'], name, { type });
    Object.defineProperty(file, 'size', { value: size });
    return file;
}

describe('checkSourceFile', () => {
    it('accepts photos, scans and PDFs', () => {
        expect(checkSourceFile(fakeFile('p.jpg', 'image/jpeg', 5e6))).toBeNull();
        expect(checkSourceFile(fakeFile('p.png', 'image/png', 5e6))).toBeNull();
        expect(checkSourceFile(fakeFile('p.heic', 'image/heic', 5e6))).toBeNull();
        expect(
            checkSourceFile(fakeFile('a.pdf', 'application/pdf', 5e6)),
        ).toBeNull();
    });

    it('rejects other file types', () => {
        expect(
            checkSourceFile(fakeFile('a.docx', 'application/msword', 1000)),
        ).toEqual({ kind: 'unsupported', name: 'a.docx' });
    });

    it('falls back to the extension when the browser sends no type', () => {
        expect(checkSourceFile(fakeFile('scan.PDF', '', 1000))).toBeNull();
        expect(checkSourceFile(fakeFile('virus.exe', '', 1000))).toEqual({
            kind: 'unsupported',
            name: 'virus.exe',
        });
    });

    it('limits PDFs to the server limit but lets large photos through to be shrunk', () => {
        expect(
            checkSourceFile(
                fakeFile('big.pdf', 'application/pdf', MAX_UPLOAD_BYTES + 1),
            ),
        ).toEqual({ kind: 'tooLarge', name: 'big.pdf' });
        expect(
            checkSourceFile(
                fakeFile('big.jpg', 'image/jpeg', MAX_UPLOAD_BYTES + 1),
            ),
        ).toBeNull();
    });
});

describe('fitWithin', () => {
    it('keeps small images unchanged', () => {
        expect(fitWithin(1200, 900)).toEqual({ width: 1200, height: 900 });
    });

    it('scales the longer side down to the limit, keeping the aspect ratio', () => {
        expect(fitWithin(4000, 3000)).toEqual({
            width: MAX_IMAGE_DIMENSION,
            height: 1800,
        });
        expect(fitWithin(3000, 4000)).toEqual({
            width: 1800,
            height: MAX_IMAGE_DIMENSION,
        });
    });
});

describe('needsReencoding', () => {
    it('always converts HEIC, which the server does not accept', () => {
        expect(needsReencoding('image/heic', 100_000, 800, 600)).toBe(true);
    });

    it('re-encodes large or oversized photos only', () => {
        expect(needsReencoding('image/jpeg', 500_000, 1600, 1200)).toBe(false);
        expect(needsReencoding('image/jpeg', 6_000_000, 1600, 1200)).toBe(true);
        expect(needsReencoding('image/png', 500_000, 4032, 3024)).toBe(true);
    });
});
