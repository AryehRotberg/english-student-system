import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ImageLightbox.module.css';

type Props = {
    src: string;
    alt: string;
    onClose: () => void;
};

/** Full-screen image view with zoom and rotate, for reading handwriting. */
export function ImageLightbox({ src, alt, onClose }: Props) {
    const { t } = useTranslation();
    const [zoomed, setZoomed] = useState(false);
    const [rotation, setRotation] = useState(0);

    useEffect(() => {
        const handleKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKey);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKey);
        };
    }, [onClose]);

    return (
        <div
            className={styles.overlay}
            role="dialog"
            aria-modal="true"
            aria-label={alt}
            onClick={onClose}
        >
            <div
                className={styles.toolbar}
                onClick={(event) => event.stopPropagation()}
            >
                <button
                    type="button"
                    className={styles.toolButton}
                    onClick={() => setZoomed((z) => !z)}
                    aria-pressed={zoomed}
                >
                    {zoomed ? '−' : '+'}
                </button>
                <button
                    type="button"
                    className={styles.toolButton}
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    aria-label="Rotate"
                >
                    ⟳
                </button>
                <a
                    className={styles.toolButton}
                    href={src}
                    target="_blank"
                    rel="noreferrer"
                >
                    {t('common.open')}
                </a>
                <button
                    type="button"
                    className={styles.toolButton}
                    onClick={onClose}
                    aria-label={t('common.close')}
                >
                    ×
                </button>
            </div>
            <div
                className={styles.stage}
                data-zoomed={zoomed}
                onClick={(event) => event.stopPropagation()}
            >
                <img
                    src={src}
                    alt={alt}
                    className={styles.image}
                    style={{ transform: `rotate(${rotation}deg)` }}
                    onClick={() => setZoomed((z) => !z)}
                />
            </div>
        </div>
    );
}
