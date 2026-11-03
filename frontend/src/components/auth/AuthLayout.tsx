import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink } from 'react-router-dom';
import {
    BookIcon,
    ChevronDownIcon,
    EyeIcon,
    EyeOffIcon,
    HeroRings,
} from '../hub/icons';
import { LanguageToggle } from '../layout/LanguageToggle';
import styles from './Auth.module.css';

function pillClass({ isActive }: { isActive: boolean }) {
    return isActive ? `${styles.switchLink} ${styles.switchActive}` : styles.switchLink;
}

/**
 * Sign-in and registration pages: the form on the start side, a branded
 * panel on the other. Phones get the form alone, with the logo above it.
 */
export function AuthLayout({
    title,
    subtitle,
    children,
}: {
    title: string;
    subtitle?: ReactNode;
    children: ReactNode;
}) {
    const { t } = useTranslation();

    return (
        <div className={styles.page}>
            <main className={styles.formSide}>
                <header className={styles.top}>
                    <Link to="/login" className={styles.smallBrand}>
                        <span className={styles.smallMark} aria-hidden="true">
                            <BookIcon size={18} strokeWidth={2} />
                        </span>
                        {t('app.name')}
                    </Link>
                    <div className={styles.topActions}>
                        <LanguageToggle className={styles.language} withIcon />
                        <nav className={styles.switch} aria-label={t('auth.authNav')}>
                            <NavLink to="/login" className={pillClass}>
                                {t('auth.login')}
                            </NavLink>
                            <NavLink to="/register" className={pillClass}>
                                {t('auth.register')}
                            </NavLink>
                        </nav>
                    </div>
                </header>

                <div className={styles.formWrap}>
                    <h1 className={styles.title}>{title}</h1>
                    {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                    {children}
                </div>
            </main>

            <aside className={styles.brandSide}>
                <HeroRings className={styles.rings} />
                <span className={styles.brandName}>
                    <BookIcon size={20} strokeWidth={2} />
                    {t('app.name')}
                </span>
                <div className={styles.brandCenter}>
                    <span className={styles.bigMark} aria-hidden="true">
                        <BookIcon size={64} strokeWidth={1.75} />
                    </span>
                    <p className={styles.headline}>
                        {t('auth.brandHeadline')}{' '}
                        <span className={styles.highlight}>
                            {t('auth.brandHighlight')}
                        </span>
                    </p>
                    <p className={styles.tagline}>{t('auth.brandTagline')}</p>
                </div>
            </aside>
        </div>
    );
}

/** A labelled input with a leading icon; passwords get a show/hide button. */
export function AuthField({
    id,
    label,
    hint,
    icon,
    type = 'text',
    ...inputProps
}: {
    id: string;
    label: string;
    hint?: string;
    icon: ReactNode;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'id'>) {
    const { t } = useTranslation();
    const [revealed, setRevealed] = useState(false);
    const isPassword = type === 'password';

    return (
        <div className={styles.field}>
            <label className={styles.label} htmlFor={id}>
                {label}
            </label>
            {hint && (
                <p className={styles.hint} id={`${id}-hint`}>
                    {hint}
                </p>
            )}
            <div className={styles.control}>
                <span className={styles.controlIcon} aria-hidden="true">
                    {icon}
                </span>
                <input
                    {...inputProps}
                    id={id}
                    type={isPassword && revealed ? 'text' : type}
                    className={styles.input}
                    aria-describedby={hint ? `${id}-hint` : undefined}
                />
                {isPassword && (
                    <button
                        type="button"
                        className={styles.reveal}
                        aria-label={
                            revealed ? t('auth.hidePassword') : t('auth.showPassword')
                        }
                        aria-pressed={revealed}
                        onClick={() => setRevealed((value) => !value)}
                    >
                        {revealed ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                    </button>
                )}
            </div>
        </div>
    );
}

export function AuthSelect({
    id,
    label,
    children,
    ...selectProps
}: {
    id: string;
    label: string;
    children: ReactNode;
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'>) {
    return (
        <div className={styles.field}>
            <label className={styles.label} htmlFor={id}>
                {label}
            </label>
            <div className={styles.control}>
                <select {...selectProps} id={id} className={styles.select}>
                    {children}
                </select>
                <ChevronDownIcon
                    size={16}
                    className={styles.selectChevron}
                    aria-hidden="true"
                />
            </div>
        </div>
    );
}
