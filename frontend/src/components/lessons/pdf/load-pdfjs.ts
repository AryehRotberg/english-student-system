// The legacy build supports older iPads and iPhones that the modern build drops.
// The worker URL is only a string here; the worker file itself is fetched when
// the first PDF opens.
import workerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';

type Pdfjs = typeof import('pdfjs-dist/legacy/build/pdf.mjs');

let pdfjs: Promise<Pdfjs> | null = null;

// pdf.js is large, so it is split out of the main bundle and loaded once, on
// first use.
export function loadPdfjs(): Promise<Pdfjs> {
    pdfjs ??= import('pdfjs-dist/legacy/build/pdf.mjs')
        .then((module) => {
            module.GlobalWorkerOptions.workerSrc = workerUrl;
            return module;
        })
        .catch((error: unknown) => {
            // Let a later attempt retry instead of caching the failure.
            pdfjs = null;
            throw error;
        });
    return pdfjs;
}
