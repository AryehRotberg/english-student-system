import { useState } from 'react';
import { RegisterForm } from '../../components/register/RegisterForm';
import { RegisterSuccessCard } from '../../components/register/RegisterSuccessCard';

export function RegisterPage() {
    const [success, setSuccess] = useState(false);

    if (success) {
        return <RegisterSuccessCard />;
    }

    return <RegisterForm onSuccess={() => setSuccess(true)} />;
}
