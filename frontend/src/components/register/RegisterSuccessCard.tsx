import { Link } from 'react-router-dom';
import styles from '../../pages/Register/RegisterPage.module.css';

export function RegisterSuccessCard() {
    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h1 className={styles.title}>English Student System</h1>
                <p className={styles.success}>
                    Your account has been created! Please wait for your teacher
                    to approve your registration before signing in.
                </p>
                <Link className={styles.navLink} to="/login">
                    Back to login
                </Link>
            </div>
        </div>
    );
}
