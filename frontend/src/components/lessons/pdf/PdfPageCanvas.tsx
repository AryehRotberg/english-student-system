import { useEffect, useRef, useState } from 'react';
import type {
    PDFDocumentProxy,
    RenderTask,
} from 'pdfjs-dist/legacy/build/pdf.mjs';
import { containScale, type PageSize } from './pdf-layout';
import styles from './PdfDeckViewer.module.css';

export type PageFit =
    // The whole page inside the box x zoom (slides).
    | { mode: 'contain'; box: PageSize; zoom: number }
    // Page width = box width x zoom (document column).
    | { mode: 'width'; width: number; zoom: number };

type Props = {
    doc: PDFDocumentProxy;
    pageNumber: number;
    fit: PageFit;
    // Shown until the page's own size is known, so the layout does not jump.
    estimate: PageSize;
    onError: (error: unknown) => void;
};

function cssScale(page: PageSize, fit: PageFit) {
    return fit.mode === 'contain'
        ? containScale(page, fit.box) * fit.zoom
        : (fit.width / page.width) * fit.zoom;
}

// Largest canvas we draw (iOS Safari refuses canvases above ~16.7M pixels).
const MAX_CANVAS_PIXELS = 16_000_000;

// window.devicePixelRatio, kept current across browser zoom and moving the
// window to a screen of another density.
function useDevicePixelRatio() {
    const [ratio, setRatio] = useState(() => window.devicePixelRatio || 1);

    useEffect(() => {
        const query = window.matchMedia(`(resolution: ${ratio}dppx)`);
        const onChange = () => setRatio(window.devicePixelRatio || 1);
        query.addEventListener('change', onChange);
        return () => query.removeEventListener('change', onChange);
    }, [ratio]);

    return ratio;
}

function isCancelled(error: unknown) {
    return (
        typeof error === 'object' &&
        error !== null &&
        'name' in error &&
        error.name === 'RenderingCancelledException'
    );
}

export function PdfPageCanvas({
    doc,
    pageNumber,
    fit,
    estimate,
    onError,
}: Props) {
    const holderRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState<PageSize | null>(null);
    const devicePixelRatio = useDevicePixelRatio();
    const fitKey =
        fit.mode === 'contain'
            ? `c:${Math.round(fit.box.width)}x${Math.round(fit.box.height)}x${fit.zoom}`
            : `w:${Math.round(fit.width)}x${fit.zoom}`;

    useEffect(() => {
        let cancelled = false;
        let task: RenderTask | null = null;

        void (async () => {
            const page = await doc.getPage(pageNumber);
            if (cancelled) return;

            const base = page.getViewport({ scale: 1 });
            const scale = cssScale(base, fit);
            const viewport = page.getViewport({ scale });
            if (viewport.width < 1 || viewport.height < 1) {
                setSize({ width: viewport.width, height: viewport.height });
                return;
            }

            // One canvas pixel per screen pixel, unless that would make the
            // canvas too large for the browser.
            const pixelRatio = Math.min(
                devicePixelRatio,
                Math.sqrt(
                    MAX_CANVAS_PIXELS / (viewport.width * viewport.height),
                ),
            );

            // A fresh canvas per render: pdf.js refuses to reuse a canvas while
            // a cancelled render is still winding down, and the previous page
            // stays visible until the new one is ready.
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.round(viewport.width * pixelRatio));
            canvas.height = Math.max(
                1,
                Math.round(viewport.height * pixelRatio),
            );
            canvas.className = styles.canvas;

            // Size the box from the canvas, not the other way round. A
            // fractional CSS size makes the browser stretch the bitmap by a
            // fraction of a pixel, which resamples it and blurs the text.
            setSize({
                width: canvas.width / pixelRatio,
                height: canvas.height / pixelRatio,
            });

            // Fill the whole-pixel canvas exactly (it may be off by part of a
            // pixel from viewport x pixelRatio).
            const transform = [
                canvas.width / viewport.width,
                0,
                0,
                canvas.height / viewport.height,
                0,
                0,
            ];

            task = page.render({ canvas, viewport, transform });
            await task.promise;
            if (!cancelled) holderRef.current?.replaceChildren(canvas);
        })().catch((error: unknown) => {
            if (!cancelled && !isCancelled(error)) onError(error);
        });

        return () => {
            cancelled = true;
            task?.cancel();
        };
        // fitKey stands in for fit, which is a new object on every render.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [doc, pageNumber, fitKey, devicePixelRatio, onError]);

    const shown = size ?? {
        width: estimate.width * cssScale(estimate, fit),
        height: estimate.height * cssScale(estimate, fit),
    };

    return (
        <div
            ref={holderRef}
            className={styles.page}
            style={{ width: shown.width, height: shown.height }}
        />
    );
}
