import { afterEach, describe, expect, it } from 'vitest';
import i18n from './index';
import { en } from './locales/en';
import { he } from './locales/he';

function keys(value: object, prefix = ''): string[] {
    return Object.entries(value).flatMap(([key, child]) =>
        typeof child === 'object' && child !== null
            ? keys(child, `${prefix}${key}.`)
            : [`${prefix}${key}`],
    );
}

describe('translations', () => {
    afterEach(async () => {
        await i18n.changeLanguage('en');
    });

    it('has every English key in Hebrew', () => {
        expect(keys(he).sort()).toEqual(keys(en).sort());
    });

    it('switches the document to right-to-left for Hebrew', async () => {
        await i18n.changeLanguage('he');

        expect(document.documentElement.dir).toBe('rtl');
        expect(document.documentElement.lang).toBe('he');
        expect(i18n.t('nav.dashboard')).toBe('לוח בקרה');
    });

    it('resolves Hebrew plurals, including the dual form, without leaking keys', async () => {
        await i18n.changeLanguage('he');

        for (const count of [1, 2, 3, 10]) {
            const text = i18n.t('exam.points', { count });
            expect(text).not.toContain('exam.points');
        }
        expect(i18n.t('exam.points', { count: 1 })).toBe('נקודה אחת');
        expect(i18n.t('exam.points', { count: 25 })).toBe('25 נקודות');
    });

    it('uses English pluralization in English', () => {
        expect(i18n.t('exam.points', { count: 1 })).toBe('1 point');
        expect(i18n.t('exam.points', { count: 25 })).toBe('25 points');
    });
});
