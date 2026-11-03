import type { FormEvent } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import styles from '../../components/auth/Auth.module.css';
import { AuthField, AuthLayout } from '../../components/auth/AuthLayout';
import { LockIcon, MailIcon } from '../../components/hub/icons';
import { useLogin } from '../../hooks/mutations';

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
        <AuthLayout
            title={t('auth.loginTitle')}
            subtitle={t('auth.signInSubtitle')}
        >
            <form
                className={styles.form}
                onSubmit={(event) => void handleSubmit(event)}
            >
                <AuthField
                    id="email"
                    label={t('auth.email')}
                    icon={<MailIcon />}
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />
                <AuthField
                    id="password"
                    label={t('auth.password')}
                    icon={<LockIcon />}
                    type="password"
                    autoComplete="current-password"
                    minLength={6}
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                />

                {loginMutation.isError ? (
                    <p className={styles.error} role="alert">
                        {(loginMutation.error as Error).message}
                    </p>
                ) : null}

                <button
                    className={styles.submit}
                    disabled={loginMutation.isPending}
                    type="submit"
                >
                    {loginMutation.isPending
                        ? t('auth.signingIn')
                        : t('auth.login')}
                </button>
            </form>

            <p className={styles.footer}>
                {t('auth.noAccountPrompt')}{' '}
                <Link to="/register">{t('auth.register')}</Link>
            </p>
        </AuthLayout>
    );
}
