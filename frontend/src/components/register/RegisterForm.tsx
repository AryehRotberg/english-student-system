import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRegister } from '../../hooks/mutations';
import { useTeachers } from '../../hooks/queries';
import styles from '../../pages/Register/RegisterPage.module.css';
import { TeacherSelect } from './TeacherSelect';

interface RegisterFormProps {
    onSuccess: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
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
            setConfirmError('Passwords do not match');
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
            <h1 className={styles.title}>English Student System</h1>
            <p className={styles.subtitle}>Create an account to get started.</p>

            <label className={styles.label} htmlFor="name">
                Name
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
                Email
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
                Password
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
                Confirm Password
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
                    ? 'Creating account...'
                    : 'Register'}
            </button>

            {registerMutation.isError ? (
                <p className={styles.error}>
                    {(registerMutation.error as Error).message}
                </p>
            ) : null}

            <Link className={styles.navLink} to="/login">
                Already have an account? Sign in
            </Link>
        </form>
    );
}
