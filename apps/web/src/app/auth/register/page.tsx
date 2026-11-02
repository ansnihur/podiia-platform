import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthShell } from '../auth-shell';
import { RegisterForm } from './register-form';

export const metadata: Metadata = { title: 'Реєстрація' };

export default function RegisterPage() {
  return (
    <AuthShell title="Давай знайомитися" lead="Хвилина на реєстрацію — і далі обереш, що тобі до душі.">
      <Suspense>
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}
