import { useEffect, useRef, useState, type RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import type { PDFDocumentProxy } from 'pdfjs-dist/legacy/build/pdf.mjs';
import viewerStyles from '../LessonMaterialViewer.module.css';
import { loadPdfjs } from './load-pdfjs';
import {
    chooseLayout,
    LAYOUT_SAMPLE_PAGES,
    type PageSize,
    type PdfLayout,
} from './pdf-layout';
import { PdfPageCanvas } from './PdfPageCanvas';
import styles from './PdfDeckViewer.module.css';

type Props = {
    url: string;
    title: string;
    // Called when pdf.js cannot load or render the file; the parent then shows
    // the browser's own viewer instead.
    onFail: (error: unknown) => void;
};

type Loaded = { doc: PDFDocumentProxy; firstPage: PageSize; layout: PdfLayout };

const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2];

// Lazy-loaded (see LessonMaterialViewer), so pdf.js stays out of the main bundle.
export default function PdfDeckViewer({ url, title, onFail }: Props) {
    const { t } = useTranslation();
    // The lesson refreshes its signed links every few minutes; the open file
    // must not reload (and jump back to slide 1) when that happens.
    const [sourceUrl] = useState(url);
    const [loaded, setLoaded] = useState<Loaded | null>(null);
    const [override, setOverride] = useState<PdfLayout | null>(null);
    const [fullScreen, setFullScreen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let disposed = false;
        let destroy: (() => void) | null = null;

        void (async () => {
            const pdfjs = await loadPdfjs();
            // Whole-file download: range requests made later with an expired
            // signed link would fail mid-lesson.
            const task = pdfjs.getDocument({
                url: sourceUrl,
                disableRange: true,
                disableStream: true,
            });
            destroy = () => void task.destroy();
            const doc = await task.promise;
            if (disposed) return;

            const sample = Math.min(doc.numPages, LAYOUT_SAMPLE_PAGES);
            const sizes: PageSize[] = [];
            for (let n = 1; n <= sample; n++) {
                const viewport = (await doc.getPage(n)).getViewport({ scale: 1 });
                sizes.push({ width: viewport.width, height: viewport.height });
            }
            if (disposed) return;

            setLoaded({ doc, firstPage: sizes[0], layout: chooseLayout(sizes) });
        })().catch((error: unknown) => {
            if (!disposed) onFail(error);
        });

        return () => {
            disposed = true;
            destroy?.();
        };
    }, [sourceUrl, onFail]);

    useEffect(() => {
        if (!fullScreen) return;
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setFullScreen(false);
        };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [fullScreen]);

    if (!loaded) {
        return <p className={viewerStyles.notice}>{t('lessons.loadingFile')}</p>;
    }

    const layout = override ?? loaded.layout;

    return (
        <div
            ref={rootRef}
            className={`${viewerStyles.viewer} ${fullScreen ? viewerStyles.fullScreen : ''}`}
        >
            <div className={viewerStyles.toolbar}>
                <span className={viewerStyles.toolbarTitle} dir="auto">
                    {title}
                </span>
                <div className={styles.toolbarGroup}>
                    <div
                        className={styles.modeToggle}
                        role="group"
                        aria-label={t('lessons.viewMode')}
                    >
                        {(['slides', 'document'] as const).map((mode) => (
                            <button
                                key={mode}
                                type="button"
                                aria-pressed={layout === mode}
                                className={`${styles.modeButton} ${
                                    layout === mode ? styles.modeButtonActive : ''
                                }`}
                                onClick={() => setOverride(mode)}
                            >
                                {t(`lessons.${mode}`)}
                            </button>
                        ))}
                    </div>
                    <button
                        type="button"
                        className={viewerStyles.toolbarButton}
                        onClick={() => setFullScreen((value) => !value)}
                    >
                        {fullScreen ? t('lessons.exitFullScreen') : t('lessons.fullScreen')}
                    </button>
                    <a
                        className={viewerStyles.toolbarButton}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {t('lessons.openInNewTab')}
                    </a>
                </div>
            </div>

            {layout === 'slides' ? (
                <SlideView
                    doc={loaded.doc}
                    firstPage={loaded.firstPage}
                    fullScreen={fullScreen}
                    onFail={onFail}
                />
            ) : (
                <DocumentView
                    doc={loaded.doc}
                    firstPage={loaded.firstPage}
                    fullScreen={fullScreen}
                    onFail={onFail}
                />
            )}
        </div>
    );
}

type ViewProps = {
    doc: PDFDocumentProxy;
    firstPage: PageSize;
    fullScreen: boolean;
    onFail: (error: unknown) => void;
};

// The content-box size of an element, kept up to date.
function useBoxSize(ref: RefObject<HTMLElement | null>) {
    const [size, setSize] = useState<PageSize>({ width: 0, height: 0 });

    useEffect(() => {
        const element = ref.current;
        if (!element) return;
        const observer = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            setSize({ width, height });
        });
        observer.observe(element);
        return () => observer.disconnect();
    }, [ref]);

    return size;
}

function SlideView({ doc, firstPage, fullScreen, onFail }: ViewProps) {
    const { t } = useTranslation();
    const [index, setIndex] = useState(0);
    const stageRef = useRef<HTMLDivElement>(null);
    const box = useBoxSize(stageRef);
    const swipeStart = useRef<number | null>(null);
    const total = doc.numPages;

    const go = (delta: number) =>
        setIndex((current) => Math.min(total - 1, Math.max(0, current + delta)));

    // Parse the next page ahead of time so moving forward feels instant.
    useEffect(() => {
        if (index + 2 <= total) void doc.getPage(index + 2).catch(() => undefined);
    }, [doc, index, total]);

    return (
        <div
            className={styles.slides}
            tabIndex={0}
            aria-roledescription="slides"
            onKeyDown={(event) => {
                if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') {
                    event.preventDefault();
                    go(1);
                } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
                    event.preventDefault();
                    go(-1);
                } else if (event.key === 'Home') {
                    setIndex(0);
                } else if (event.key === 'End') {
                    setIndex(total - 1);
                }
            }}
        >
            <div
                ref={stageRef}
                className={`${styles.stage} ${fullScreen ? styles.stageFull : ''}`}
                style={fullScreen ? undefined : { aspectRatio: `${firstPage.width} / ${firstPage.height}` }}
                onPointerDown={(event) => {
                    if (event.pointerType === 'touch') swipeStart.current = event.clientX;
                }}
                onPointerUp={(event) => {
                    if (swipeStart.current === null) return;
                    const dx = event.clientX - swipeStart.current;
                    swipeStart.current = null;
                    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
                }}
            >
                {box.width > 0 && (
                    <PdfPageCanvas
                        doc={doc}
                        pageNumber={index + 1}
                        fit={{ mode: 'contain', box }}
                        estimate={firstPage}
                        onError={onFail}
                    />
                )}
            </div>

            {/* Slides read left to right whatever the interface language. */}
            <div className={styles.nav} dir="ltr">
                <button
                    type="button"
                    className={styles.navButton}
                    onClick={() => go(-1)}
                    disabled={index === 0}
                    aria-label={t('lessons.previous')}
                >
                    ‹
                </button>
                <span className={styles.counter} aria-live="polite">
                    {t('lessons.pageCounter', { current: index + 1, total })}
                </span>
                <button
                    type="button"
                    className={styles.navButton}
                    onClick={() => go(1)}
                    disabled={index === total - 1}
                    aria-label={t('lessons.next')}
                >
                    ›
                </button>
            </div>
        </div>
    );
}

function DocumentView({ doc, firstPage, fullScreen, onFail }: ViewProps) {
    const { t } = useTranslation();
    const [zoomIndex, setZoomIndex] = useState(ZOOM_STEPS.indexOf(1));
    const scrollRef = useRef<HTMLDivElement>(null);
    const box = useBoxSize(scrollRef);
    const zoom = ZOOM_STEPS[zoomIndex];
    // Readable column width; wider screens get margins instead of huge pages.
    const width = Math.min(box.width, 900);
    const pages = Array.from({ length: doc.numPages }, (_, i) => i + 1);

    return (
        <>
            <div
                ref={scrollRef}
                className={`${styles.docScroll} ${fullScreen ? styles.docScrollFull : ''}`}
            >
                {width > 0 &&
                    pages.map((pageNumber) => (
                        <LazyPage
                            key={pageNumber}
                            rootRef={scrollRef}
                            estimate={{
                                width: width * zoom,
                                height: (width * zoom * firstPage.height) / firstPage.width,
                            }}
                        >
                            <PdfPageCanvas
                                doc={doc}
                                pageNumber={pageNumber}
                                fit={{ mode: 'width', width, zoom }}
                                estimate={firstPage}
                                onError={onFail}
                            />
                        </LazyPage>
                    ))}
            </div>
            <div className={styles.nav} dir="ltr">
                <button
                    type="button"
                    className={styles.navButton}
                    onClick={() => setZoomIndex((i) => Math.max(0, i - 1))}
                    disabled={zoomIndex === 0}
                    aria-label={t('lessons.zoomOut')}
                >
                    −
                </button>
                <span className={styles.counter}>
                    {Math.round(zoom * 100)}% · {t('lessons.pages', { count: doc.numPages })}
                </span>
                <button
                    type="button"
                    className={styles.navButton}
                    onClick={() =>
                        setZoomIndex((i) => Math.min(ZOOM_STEPS.length - 1, i + 1))
                    }
                    disabled={zoomIndex === ZOOM_STEPS.length - 1}
                    aria-label={t('lessons.zoomIn')}
                >
                    +
                </button>
            </div>
        </>
    );
}

// Renders its page only near the visible area, and drops it again when far
// away: a long scanned document would otherwise hold every page's pixels.
function LazyPage({
    rootRef,
    estimate,
    children,
}: {
    rootRef: RefObject<HTMLDivElement | null>;
    estimate: PageSize;
    children: React.ReactNode;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [near, setNear] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;
        const observer = new IntersectionObserver(
            ([entry]) => setNear(entry.isIntersecting),
            { root: rootRef.current, rootMargin: '1200px 0px' },
        );
        observer.observe(element);
        return () => observer.disconnect();
    }, [rootRef]);

    return (
        <div ref={ref} className={styles.lazyPage} style={near ? undefined : estimate}>
            {near && children}
        </div>
    );
}
