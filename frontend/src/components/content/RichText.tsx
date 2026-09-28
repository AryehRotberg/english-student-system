import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import type { ContentFormat } from '../../types/quiz';
import styles from './RichText.module.css';

type Props = {
    content: string;
    format?: ContentFormat;
    className?: string;
};

/**
 * Question text, study guides and feedback. Markdown supports $inline$ and
 * $$display$$ LaTeX (KaTeX) and fenced code blocks for Computer Science.
 *
 * The HTML is sanitized before KaTeX runs, so authored content can never
 * inject markup while KaTeX's own output is kept intact. dir="auto" lets a
 * Hebrew question flow right-to-left while formulas and code stay LTR.
 */
export function RichText({ content, format = 'plain', className }: Props) {
    const classes = [styles.richText, className].filter(Boolean).join(' ');

    if (format !== 'markdown') {
        return (
            <div className={`${classes} ${styles.plain}`} dir="auto">
                {content}
            </div>
        );
    }

    return (
        <div className={classes} dir="auto">
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeSanitize, rehypeKatex]}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
