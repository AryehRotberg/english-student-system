import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import type { UiLanguage } from '../types/subject';
import { en } from './locales/en';
import { he } from './locales/he';

const STORAGE_KEY = 'ui-language';

// Remembered per browser so the login page opens in the last language used;
// the signed-in user's saved preference (users.ui_language) takes over once
// it loads.
function readStoredLanguage(): UiLanguage {
    try {
        return localStorage.getItem(STORAGE_KEY) === 'he' ? 'he' : 'en';
    } catch {
        return 'en';
    }
}

export function isRtl(language: string): boolean {
    return language === 'he';
}

function applyToDocument(language: string) {
    document.documentElement.lang = language;
    document.documentElement.dir = isRtl(language) ? 'rtl' : 'ltr';
}

void i18n.use(initReactI18next).init({
    resources: {
        en: { translation: en },
        he: { translation: he },
    },
    lng: readStoredLanguage(),
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
});

applyToDocument(i18n.language);

i18n.on('languageChanged', (language) => {
    applyToDocument(language);
    try {
        localStorage.setItem(STORAGE_KEY, language);
    } catch {
        // Storage can be unavailable (private mode); the language still applies.
    }
});

export function currentLanguage(): UiLanguage {
    return i18n.language === 'he' ? 'he' : 'en';
}

export default i18n;
