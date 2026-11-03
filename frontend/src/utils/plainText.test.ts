import { describe, expect, it } from 'vitest';
import { markdownExcerpt, markdownToPlainText } from './plainText';

describe('markdownToPlainText', () => {
    it('drops HTML and images', () => {
        expect(
            markdownToPlainText(
                '<center><img src="https://example.com/a.png" width="100%"></center>\n\nOnce upon a time',
            ),
        ).toBe('Once upon a time');
        expect(markdownToPlainText('![A frog](frog.png) Frogs sing.')).toBe('Frogs sing.');
    });

    it('keeps link text and removes formatting', () => {
        expect(
            markdownToPlainText(
                '**I**\\ [Mushrooms](/vocab?topicId=01a14ffa-f103) are _tasty_.',
            ),
        ).toBe('I Mushrooms are tasty.');
    });

    it('removes headings, quotes and list markers', () => {
        expect(
            markdownToPlainText('# Homework: My Day\n> Hi!\n- one\n2. two'),
        ).toBe('Homework: My Day Hi! one two');
    });

    it('keeps escaped characters and decodes entities', () => {
        expect(markdownToPlainText('5 \\* 3 &amp; more&nbsp;text')).toBe(
            '5 * 3 & more text',
        );
    });

    it('leaves underscores inside words alone', () => {
        expect(markdownToPlainText('snake_case words')).toBe('snake_case words');
    });
});

describe('markdownExcerpt', () => {
    it('cuts at a word boundary and adds an ellipsis', () => {
        expect(markdownExcerpt('one two three four', 12)).toBe('one two…');
        expect(markdownExcerpt('short', 12)).toBe('short');
    });
});
