import { useLayoutEffect, useRef, useState } from 'react';
import type { QuestionAdminItem } from '../../../types/admin-query-items';
import type { ContentFormat } from '../../../types/quiz';
import { RichText } from '../../content/RichText';
import { QUESTION_TYPE_LABEL } from './question-types';
import styles from './QuizEditor.module.css';

type Props = {
    content: string;
    format?: ContentFormat;
};

/**
 * The question as students see it (formulas rendered), cut to a few lines.
 * Only text that actually overflows gets the fade-out.
 */
export function QuestionPreview({ content, format = 'plain' }: Props) {
    const ref = useRef<HTMLDivElement>(null);
    const [overflows, setOverflows] = useState(false);

    useLayoutEffect(() => {
        const element = ref.current;
        if (!element) return;

        const measure = () =>
            setOverflows(element.scrollHeight > element.clientHeight + 1);
        measure();

        // KaTeX and web fonts can change the height after the first paint.
        const observer = new ResizeObserver(measure);
        observer.observe(element);
        if (element.firstElementChild) {
            observer.observe(element.firstElementChild);
        }
        return () => observer.disconnect();
    }, [content, format]);

    return (
        <div
            ref={ref}
            className={`${styles.preview} ${overflows ? styles.previewFaded : ''}`}
        >
            <RichText content={content} format={format} />
        </div>
    );
}

export function QuestionBadges({ question }: { question?: QuestionAdminItem }) {
    if (!question) return null;

    return (
        <div className={styles.badges}>
            <span className={styles.badge}>
                {QUESTION_TYPE_LABEL[question.questionType] ??
                    question.questionType}
            </span>
            {question.hasImage && (
                <span className={styles.badge}>Diagram</span>
            )}
            {question.source && (
                <span className={styles.sourceBadge} dir="auto">
                    {question.source}
                </span>
            )}
        </div>
    );
}
