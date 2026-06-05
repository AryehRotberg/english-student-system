import { escapeHtml } from './send-email.utils';

describe('escapeHtml', () => {
    it('should escape ampersands', () => {
        expect(escapeHtml('a & b')).toBe('a &amp; b');
    });

    it('should escape less-than signs', () => {
        expect(escapeHtml('<div>')).toBe('&lt;div&gt;');
    });

    it('should escape greater-than signs', () => {
        expect(escapeHtml('a > b')).toBe('a &gt; b');
    });

    it('should escape double quotes', () => {
        expect(escapeHtml('"quoted"')).toBe('&quot;quoted&quot;');
    });

    it('should escape single quotes', () => {
        expect(escapeHtml("it's")).toBe('it&#39;s');
    });

    it('should escape multiple special characters in one string', () => {
        expect(escapeHtml('<script>alert("xss")</script>')).toBe(
            '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
        );
    });

    it('should return the original string when there are no special characters', () => {
        expect(escapeHtml('Hello World')).toBe('Hello World');
    });

    it('should return an empty string when given an empty string', () => {
        expect(escapeHtml('')).toBe('');
    });

    it('should escape ampersands before other characters to avoid double-escaping', () => {
        expect(escapeHtml('a & <b>')).toBe('a &amp; &lt;b&gt;');
    });
});
