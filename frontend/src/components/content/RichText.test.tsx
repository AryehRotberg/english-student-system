import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RichText } from './RichText';

describe('RichText', () => {
    it('renders inline and display LaTeX with KaTeX', () => {
        const { container } = render(
            <RichText
                format="markdown"
                // Display math needs $$ on their own lines (remark-math).
                content={'Find $f\'(x)$ for:\n\n$$\nf(x)=\\frac{x^2}{2}\n$$'}
            />,
        );

        expect(container.querySelectorAll('.katex').length).toBe(2);
        expect(container.querySelector('.katex-display')).not.toBeNull();
    });

    it('renders code blocks for Computer Science questions', () => {
        const { container } = render(
            <RichText
                format="markdown"
                content={'```java\nint x = 5;\n```'}
            />,
        );

        expect(container.querySelector('pre code')?.textContent).toContain(
            'int x = 5;',
        );
    });

    it('never renders raw HTML from authored content', () => {
        const { container } = render(
            <RichText
                format="markdown"
                content={
                    'Hello <script>alert(1)</script><img src=x onerror="alert(1)">'
                }
            />,
        );

        expect(container.querySelector('script')).toBeNull();
        expect(container.querySelector('img')).toBeNull();
    });

    it('keeps plain text as typed, markup and all', () => {
        const { container } = render(
            <RichText content={'2 * 3 = 6 and $5 is not math'} />,
        );

        expect(container.textContent).toBe('2 * 3 = 6 and $5 is not math');
        expect(container.querySelector('.katex')).toBeNull();
    });

    it('lets the browser pick the direction for mixed Hebrew/LTR text', () => {
        const { container } = render(
            <RichText format="markdown" content="מצאו את $x$" />,
        );

        expect(container.firstElementChild?.getAttribute('dir')).toBe('auto');
    });
});
