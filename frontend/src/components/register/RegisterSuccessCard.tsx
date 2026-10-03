import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import styles from '../../pages/Register/RegisterPage.module.css';

export function RegisterSuccessCard() {
    const { t } = useTranslation();
    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h1 className={styles.title}>{t('app.name')}</h1>
                <p className={styles.success}>{t('auth.registered')}</p>
                <Link className={styles.navLink} to="/login">
                    {t('auth.backToLogin')}
                </Link>
            </div>
        </div>
    );
}
