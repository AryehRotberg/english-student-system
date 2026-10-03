import { useTranslation } from 'react-i18next';
import { useUpdateMyPreferences } from '../../hooks/mutations';
import { useAuthUser } from '../../hooks/queries';

type Props = {
    className?: string;
};

/** Switches between English and Hebrew; saved to the account when signed in. */
export function LanguageToggle({ className }: Props) {
    const { t, i18n } = useTranslation();
    const { data: user } = useAuthUser();
    const updatePreferences = useUpdateMyPreferences();

    const next = i18n.language === 'he' ? 'en' : 'he';

    return (
        <button
            type="button"
            className={className}
            lang={next}
            title={t('language.switchToTitle')}
            disabled={updatePreferences.isPending}
            onClick={() => {
                void i18n.changeLanguage(next);
                if (user) {
                    updatePreferences.mutate(next);
                }
            }}
        >
            {t('language.switchTo')}
        </button>
    );
}
