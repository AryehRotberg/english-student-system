import {
    Component,
    lazy,
    Suspense,
    useCallback,
    useEffect,
    useState,
    type ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';
import { PDF_VIEWER } from '../../config/lessons';
import { useLessonHtml } from '../../hooks/queries';
import type { LessonMaterial } from '../../types/lesson';
import styles from './LessonMaterialViewer.module.css';

// Split into its own chunk with pdf.js; nothing is downloaded until a PDF opens.
const PdfDeckViewer = lazy(() => import('./pdf/PdfDeckViewer'));

// Teacher-authored pages run their own scripts. Without allow-same-origin the
// frame gets an opaque origin: its scripts work, but it cannot read the app's
// cookies or storage, call the API as the student, or navigate the app.
// allow-forms keeps pages that use <form> submit handlers working.
const HTML_SANDBOX = 'allow-scripts allow-forms allow-modals allow-popups';

type Props = {
    material: LessonMaterial;
};

export function LessonMaterialViewer({ material }: Props) {
    const { t } = useTranslation();

    if (!material.url) {
        return <p className={styles.notice}>{t('lessons.linkUnavailable')}</p>;
    }

    return material.kind === 'html' ? (
        <HtmlMaterial material={material} url={material.url} />
    ) : (
        <PdfMaterial material={material} url={material.url} />
    );
}

// Slides/pages viewer (pdf.js) by default. Any failure, from the chunk not
// loading to a file pdf.js cannot open, drops back to the browser's viewer.
function PdfMaterial({ material, url }: { material: LessonMaterial; url: string }) {
    const { t } = useTranslation();
    const [failed, setFailed] = useState(PDF_VIEWER === 'native');
    const fail = useCallback((error: unknown) => {
        console.warn('PDF slides viewer failed; using the browser viewer.', error);
        setFailed(true);
    }, []);

    if (failed) {
        return <NativePdf material={material} url={url} />;
    }

    return (
        <FallbackBoundary onError={fail}>
            <Suspense fallback={<p className={styles.notice}>{t('lessons.loadingFile')}</p>}>
                <PdfDeckViewer url={url} title={material.title} onFail={fail} />
            </Suspense>
        </FallbackBoundary>
    );
}

class FallbackBoundary extends Component<
    { onError: (error: unknown) => void; children: ReactNode },
    { hasError: boolean }
> {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: unknown) {
        this.props.onError(error);
    }

    render() {
        return this.state.hasError ? null : this.props.children;
    }
}

// The browser's own PDF viewer in a frame: the original viewer, and the fallback.
function NativePdf({ material, url }: { material: LessonMaterial; url: string }) {
    const { t } = useTranslation();

    return (
        <div className={styles.viewer}>
            <div className={styles.toolbar}>
                <p className={styles.hint}>{t('lessons.pdfFallback')}</p>
                <a
                    className={styles.toolbarButton}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {t('lessons.openInNewTab')}
                </a>
            </div>
            <iframe
                className={styles.frame}
                src={url}
                title={t('lessons.frameTitle', { title: material.title })}
            />
        </div>
    );
}

function HtmlMaterial({ material, url }: { material: LessonMaterial; url: string }) {
    const { t } = useTranslation();
    const { data: html, isLoading, isError } = useLessonHtml(url);
    const [fullScreen, setFullScreen] = useState(false);

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

    if (isLoading) {
        return <p className={styles.notice}>{t('lessons.loadingPage')}</p>;
    }

    if (isError || html === undefined) {
        return <p className={styles.notice}>{t('lessons.pageError')}</p>;
    }

    return (
        <div className={`${styles.viewer} ${fullScreen ? styles.fullScreen : ''}`}>
            <div className={styles.toolbar}>
                <span className={styles.toolbarTitle} dir="auto">
                    {material.title}
                </span>
                <button
                    type="button"
                    className={styles.toolbarButton}
                    onClick={() => setFullScreen((value) => !value)}
                >
                    {fullScreen ? t('lessons.exitFullScreen') : t('lessons.fullScreen')}
                </button>
            </div>
            <iframe
                className={styles.frame}
                sandbox={HTML_SANDBOX}
                srcDoc={html}
                referrerPolicy="no-referrer"
                title={t('lessons.frameTitle', { title: material.title })}
            />
        </div>
    );
}
