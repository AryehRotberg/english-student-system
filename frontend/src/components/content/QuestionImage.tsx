import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuestionImageUrl } from '../../hooks/queries';
import { ImageLightbox } from './ImageLightbox';
import styles from './QuestionImage.module.css';

type Props = {
    questionId: string;
    hasImage: boolean;
};

/** A question's diagram (e.g. geometry). Tap to enlarge. */
export function QuestionImage({ questionId, hasImage }: Props) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const {
        data: url,
        isLoading,
        isError,
    } = useQuestionImageUrl(questionId, hasImage);

    if (!hasImage) {
        return null;
    }

    if (isLoading) {
        return <p className={styles.status}>{t('richText.imageLoading')}</p>;
    }

    if (isError || !url) {
        return <p className={styles.status}>{t('richText.imageFailed')}</p>;
    }

    return (
        <>
            <button
                type="button"
                className={styles.frame}
                onClick={() => setIsOpen(true)}
                aria-label={t('richText.zoomIn')}
            >
                <img
                    src={url}
                    alt={t('richText.imageAlt')}
                    className={styles.image}
                    loading="lazy"
                />
            </button>
            {isOpen && (
                <ImageLightbox
                    src={url}
                    alt={t('richText.imageAlt')}
                    onClose={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
