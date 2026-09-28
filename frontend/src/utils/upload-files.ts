// Preparing handwritten-answer files for upload. Phone photos are often 4-12 MB
// and larger than a grader needs, so images are downscaled to a readable size
// and re-encoded as JPEG before upload; PDFs are sent untouched.

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
export const MAX_IMAGE_DIMENSION = 2400;
const JPEG_QUALITY = 0.82;
// Small, already-sized images are uploaded as they are.
const REENCODE_THRESHOLD_BYTES = 1.5 * 1024 * 1024;

// What the file picker accepts. HEIC/HEIF (iPhone camera) is converted to JPEG
// in the browser; the server itself only accepts JPEG, PNG and PDF.
export const ACCEPTED_SOURCE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/heic',
    'image/heif',
    'application/pdf',
];

export type FileProblem =
    | { kind: 'unsupported'; name: string }
    | { kind: 'tooLarge'; name: string };

function sourceType(file: File): string {
    if (file.type) {
        return file.type.toLowerCase();
    }

    // Some Android pickers leave the type empty; fall back to the extension.
    const extension = file.name.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'jpg':
        case 'jpeg':
            return 'image/jpeg';
        case 'png':
            return 'image/png';
        case 'heic':
            return 'image/heic';
        case 'heif':
            return 'image/heif';
        case 'pdf':
            return 'application/pdf';
        default:
            return '';
    }
}

export function checkSourceFile(file: File): FileProblem | null {
    const type = sourceType(file);

    if (!ACCEPTED_SOURCE_TYPES.includes(type)) {
        return { kind: 'unsupported', name: file.name };
    }

    // Images shrink during preparation, so only PDFs are limited up front
    // (and absurdly large photos).
    const limit = type === 'application/pdf' ? MAX_UPLOAD_BYTES : 4 * MAX_UPLOAD_BYTES;

    if (file.size > limit) {
        return { kind: 'tooLarge', name: file.name };
    }

    return null;
}

/** Scales (width, height) down so the longer side is at most maxDimension. */
export function fitWithin(
    width: number,
    height: number,
    maxDimension: number = MAX_IMAGE_DIMENSION,
): { width: number; height: number } {
    const longest = Math.max(width, height);

    if (longest <= maxDimension || longest === 0) {
        return { width, height };
    }

    const scale = maxDimension / longest;
    return {
        width: Math.round(width * scale),
        height: Math.round(height * scale),
    };
}

export function needsReencoding(
    type: string,
    sizeBytes: number,
    width: number,
    height: number,
): boolean {
    if (type === 'image/heic' || type === 'image/heif') {
        return true;
    }

    return (
        sizeBytes > REENCODE_THRESHOLD_BYTES ||
        Math.max(width, height) > MAX_IMAGE_DIMENSION
    );
}

type DecodedImage = {
    source: CanvasImageSource;
    width: number;
    height: number;
    release: () => void;
};

async function decode(file: File): Promise<DecodedImage> {
    try {
        // from-image applies the EXIF orientation, so portrait phone photos
        // are not uploaded sideways.
        const bitmap = await createImageBitmap(file, {
            imageOrientation: 'from-image',
        });
        return {
            source: bitmap,
            width: bitmap.width,
            height: bitmap.height,
            release: () => bitmap.close(),
        };
    } catch {
        // Older Safari rejects the options argument; an <img> also applies
        // the EXIF orientation and can decode HEIC on Apple devices.
    }

    const url = URL.createObjectURL(file);
    const image = new Image();
    image.src = url;

    try {
        await image.decode();
    } catch (error) {
        URL.revokeObjectURL(url);
        throw error;
    }

    return {
        source: image,
        width: image.naturalWidth,
        height: image.naturalHeight,
        release: () => URL.revokeObjectURL(url),
    };
}

/** Unique enough for keying pending uploads; works on plain-HTTP origins too. */
export function localId(): string {
    return typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Returns the blob to upload: PDFs unchanged, images downscaled/re-encoded to
 * JPEG when that helps. Throws when an image cannot be decoded.
 */
export async function prepareForUpload(file: File): Promise<Blob> {
    const type = sourceType(file);

    if (type === 'application/pdf') {
        return file.type ? file : new Blob([file], { type });
    }

    const bitmap = await decode(file);

    try {
        if (!needsReencoding(type, file.size, bitmap.width, bitmap.height)) {
            return file.type ? file : new Blob([file], { type });
        }

        const target = fitWithin(bitmap.width, bitmap.height);
        const canvas = document.createElement('canvas');
        canvas.width = target.width;
        canvas.height = target.height;

        const context = canvas.getContext('2d');
        if (!context) {
            throw new Error('Canvas is not available.');
        }

        // JPEG has no transparency: paint a white page behind scanned PNGs.
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, target.width, target.height);
        context.drawImage(bitmap.source, 0, 0, target.width, target.height);

        const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY),
        );

        if (!blob) {
            throw new Error('The image could not be encoded.');
        }

        return blob;
    } finally {
        bitmap.release();
    }
}
