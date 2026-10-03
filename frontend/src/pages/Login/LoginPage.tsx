import type { FormEvent } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LanguageToggle } from '../../components/layout/LanguageToggle';
import { useLogin } from '../../hooks/mutations';
import styles from './LoginPage.module.css';

export function LoginPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const loginMutation = useLogin();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        await loginMutation.mutateAsync({ email, password });
        const redirect = searchParams.get('redirect');
        navigate(redirect ?? '/', { replace: true });
    };

    return (
        <div className={styles.page}>
            <form
                className={styles.card}
                onSubmit={(event) => void handleSubmit(event)}
            >
                <LanguageToggle className={styles.languageButton} />
                <h1 className={styles.title}>{t('app.name')}</h1>
                <p className={styles.subtitle}>{t('auth.signInSubtitle')}</p>

                <label className={styles.label} htmlFor="email">
                    {t('auth.email')}
                </label>
                <input
                    className={styles.input}
                    id="email"
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    type="email"
                    value={email}
                />

                <label className={styles.label} htmlFor="password">
                    {t('auth.password')}
                </label>
                <input
                    className={styles.input}
                    id="password"
                    minLength={6}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    type="password"
                    value={password}
                />

                <button
                    className={styles.button}
                    disabled={loginMutation.isPending}
                    type="submit"
                >
                    {loginMutation.isPending
                        ? t('auth.signingIn')
                        : t('auth.login')}
                </button>

                {loginMutation.isError ? (
                    <p className={styles.error}>
                        {(loginMutation.error as Error).message}
                    </p>
                ) : null}

                <Link className={styles.navLink} to="/register">
                    {t('auth.noAccount')}
                </Link>
            </form>
        </div>
    );
}
