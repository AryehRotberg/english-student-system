import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AnswerFile } from '../../services/answer-files.service';
import { ImageLightbox } from '../content/ImageLightbox';
import styles from './AnswerUploader.module.css';

type Props = {
    files: AnswerFile[];
    // Omitted for read-only views (results, grading).
    onRemove?: (file: AnswerFile) => void;
    onMove?: (index: number, delta: -1 | 1) => void;
    isBusy?: boolean;
};

/** Thumbnails of a handwritten answer's pages; images open in a lightbox. */
export function AnswerFileGallery({ files, onRemove, onMove, isBusy }: Props) {
    const { t } = useTranslation();
    const [openFile, setOpenFile] = useState<AnswerFile | null>(null);

    if (files.length === 0) {
        return null;
    }

    return (
        <>
            <ol className={styles.gallery}>
                {files.map((file, index) => {
                    const isPdf = file.mimeType === 'application/pdf';
                    const label = t('uploader.page', { number: index + 1 });

                    return (
                        <li key={file.id} className={styles.tile}>
                            {isPdf || !file.url ? (
                                <a
                                    className={styles.pdfTile}
                                    href={file.url ?? undefined}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label={label}
                                >
                                    <span className={styles.pdfBadge}>
                                        {isPdf ? t('uploader.pdf') : '…'}
                                    </span>
                                </a>
                            ) : (
                                <button
                                    type="button"
                                    className={styles.thumbButton}
                                    onClick={() => setOpenFile(file)}
                                    aria-label={label}
                                >
                                    <img
                                        src={file.url}
                                        alt={label}
                                        className={styles.thumb}
                                        loading="lazy"
                                    />
                                </button>
                            )}
                            <div className={styles.tileFooter}>
                                <span className={styles.pageLabel}>
                                    {label}
                                </span>
                                {onMove && files.length > 1 && (
                                    <>
                                        <button
                                            type="button"
                                            className={styles.iconButton}
                                            disabled={isBusy || index === 0}
                                            onClick={() => onMove(index, -1)}
                                            aria-label={t('uploader.moveUp')}
                                            title={t('uploader.moveUp')}
                                        >
                                            ‹
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.iconButton}
                                            disabled={
                                                isBusy ||
                                                index === files.length - 1
                                            }
                                            onClick={() => onMove(index, 1)}
                                            aria-label={t('uploader.moveDown')}
                                            title={t('uploader.moveDown')}
                                        >
                                            ›
                                        </button>
                                    </>
                                )}
                                {onRemove && (
                                    <button
                                        type="button"
                                        className={styles.iconButton}
                                        disabled={isBusy}
                                        onClick={() => onRemove(file)}
                                        aria-label={t('uploader.remove')}
                                        title={t('uploader.remove')}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ol>
            {openFile?.url && (
                <ImageLightbox
                    src={openFile.url}
                    alt={t('uploader.page', {
                        number: files.indexOf(openFile) + 1,
                    })}
                    onClose={() => setOpenFile(null)}
                />
            )}
        </>
    );
}
