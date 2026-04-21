import { useState } from 'react';
import { RegisterForm } from '../../components/register/RegisterForm';
import { RegisterSuccessCard } from '../../components/register/RegisterSuccessCard';
import styles from './RegisterPage.module.css';

export function RegisterPage() {
    const [success, setSuccess] = useState(false);

    if (success) {
        return <RegisterSuccessCard />;
    }

    return (
        <div className={styles.page}>
            <RegisterForm onSuccess={() => setSuccess(true)} />
        </div>
    );
}
