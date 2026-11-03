import type { FormEvent } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useRegister } from '../../hooks/mutations';
import { useTeachers } from '../../hooks/queries';
import styles from '../auth/Auth.module.css';
import { AuthField, AuthLayout } from '../auth/AuthLayout';
import { LockIcon, MailIcon, UserIcon } from '../hub/icons';
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
        <AuthLayout
            title={t('auth.registerTitle')}
            subtitle={t('auth.registerSubtitle')}
        >
            <form
                className={styles.form}
                onSubmit={(event) => void handleSubmit(event)}
            >
                <AuthField
                    id="name"
                    label={t('auth.name')}
                    icon={<UserIcon />}
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                />
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
                    hint={t('auth.passwordHint')}
                    icon={<LockIcon />}
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                />
                <AuthField
                    id="confirmPassword"
                    label={t('auth.confirmPassword')}
                    icon={<LockIcon />}
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    value={confirmPassword}
                    onChange={(event) => {
                        setConfirmPassword(event.target.value);
                        setConfirmError('');
                    }}
                />
                {confirmError ? (
                    <p className={styles.error} role="alert">
                        {confirmError}
                    </p>
                ) : null}

                <TeacherSelect
                    teachers={teachers}
                    isLoading={teachersLoading}
                    value={teacherId}
                    onChange={setTeacherId}
                />

                {registerMutation.isError ? (
                    <p className={styles.error} role="alert">
                        {(registerMutation.error as Error).message}
                    </p>
                ) : null}

                <button
                    className={styles.submit}
                    disabled={registerMutation.isPending}
                    type="submit"
                >
                    {registerMutation.isPending
                        ? t('auth.creatingAccount')
                        : t('auth.register')}
                </button>
            </form>

            <p className={styles.footer}>
                {t('auth.haveAccountPrompt')}{' '}
                <Link to="/login">{t('auth.login')}</Link>
            </p>
        </AuthLayout>
    );
}
