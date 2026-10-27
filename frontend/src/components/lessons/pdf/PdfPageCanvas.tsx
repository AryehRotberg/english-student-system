import { useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { containScale, type PageSize } from './pdf-layout';
import styles from './PdfDeckViewer.module.css';

export type PageFit =
    // The whole page inside the box (slides).
    | { mode: 'contain'; box: PageSize }
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
        ? containScale(page, fit.box)
        : (fit.width / page.width) * fit.zoom;
}

function isCancelled(error: unknown) {
    return (
        typeof error === 'object' &&
        error !== null &&
        'name' in error &&
        error.name === 'RenderingCancelledException'
    );
}

export function PdfPageCanvas({ doc, pageNumber, fit, estimate, onError }: Props) {
    const holderRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState<PageSize | null>(null);
    const fitKey =
        fit.mode === 'contain'
            ? `c:${Math.round(fit.box.width)}x${Math.round(fit.box.height)}`
            : `w:${Math.round(fit.width)}x${fit.zoom}`;

    useEffect(() => {
        let cancelled = false;
        let task: RenderTask | null = null;

        void (async () => {
            const page = await doc.getPage(pageNumber);
            if (cancelled) return;

            const base = page.getViewport({ scale: 1 });
            const scale = cssScale(base, fit);
            const width = base.width * scale;
            const height = base.height * scale;
            setSize({ width, height });
            if (width < 1 || height < 1) return;

            // Sharp on high-density screens, capped so huge pages stay light.
            const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
            const viewport = page.getViewport({ scale: scale * pixelRatio });

            // A fresh canvas per render: pdf.js refuses to reuse a canvas while
            // a cancelled render is still winding down, and the previous page
            // stays visible until the new one is ready.
            const canvas = document.createElement('canvas');
            canvas.width = Math.floor(viewport.width);
            canvas.height = Math.floor(viewport.height);
            canvas.className = styles.canvas;

            task = page.render({ canvas, viewport });
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
    }, [doc, pageNumber, fitKey, onError]);

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
