import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import styles from '../auth/Auth.module.css';
import { AuthLayout } from '../auth/AuthLayout';

export function RegisterSuccessCard() {
    const { t } = useTranslation();
    return (
        <AuthLayout title={t('auth.registeredTitle')}>
            <p className={styles.success} role="status">
                {t('auth.registered')}
            </p>
            <Link className={styles.submit} to="/login">
                {t('auth.backToLogin')}
            </Link>
        </AuthLayout>
    );
}
