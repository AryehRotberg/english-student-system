import type { FormEvent } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useRegister } from '../../hooks/mutations';
import { LanguageToggle } from '../layout/LanguageToggle';
import { useTeachers } from '../../hooks/queries';
import styles from '../../pages/Register/RegisterPage.module.css';
import { TeacherSelect } from './TeacherSelect';

interface RegisterFormProps {
    onSuccess: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
    const { t } = useTranslation();
    const registerMutation = useRegister();
    const { data: teachers = [], isLoading: teachersLoading } = useTeachers();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [teacherId, setTeacherId] = useState('');
    const [confirmError, setConfirmError] = useState('');

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (password !== confirmPassword) {
            setConfirmError(t('auth.passwordsDontMatch'));
            return;
        }
        setConfirmError('');

        await registerMutation.mutateAsync({
            name,
            email,
            password,
            teacherId,
        });
        onSuccess();
    };

    return (
        <form
            className={styles.card}
            onSubmit={(event) => void handleSubmit(event)}
        >
            <LanguageToggle className={styles.languageButton} />
            <h1 className={styles.title}>{t('app.name')}</h1>
            <p className={styles.subtitle}>{t('auth.registerSubtitle')}</p>

            <label className={styles.label} htmlFor="name">
                {t('auth.name')}
            </label>
            <input
                className={styles.input}
                id="name"
                onChange={(event) => setName(event.target.value)}
                required
                type="text"
                value={name}
            />

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
                minLength={8}
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
            />

            <label className={styles.label} htmlFor="confirmPassword">
                {t('auth.confirmPassword')}
            </label>
            <input
                className={styles.input}
                id="confirmPassword"
                minLength={8}
                onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setConfirmError('');
                }}
                required
                type="password"
                value={confirmPassword}
            />
            {confirmError ? (
                <p className={styles.error}>{confirmError}</p>
            ) : null}

            <TeacherSelect
                teachers={teachers}
                isLoading={teachersLoading}
                value={teacherId}
                onChange={setTeacherId}
            />

            <button
                className={styles.button}
                disabled={registerMutation.isPending}
                type="submit"
            >
                {registerMutation.isPending
                    ? t('auth.creatingAccount')
                    : t('auth.register')}
            </button>

            {registerMutation.isError ? (
                <p className={styles.error}>
                    {(registerMutation.error as Error).message}
                </p>
            ) : null}

            <Link className={styles.navLink} to="/login">
                {t('auth.haveAccount')}
            </Link>
        </form>
    );
}
