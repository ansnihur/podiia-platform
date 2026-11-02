import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthShell } from '../auth-shell';
import { LoginForm } from './login-form';

export const metadata: Metadata = { title: 'Вхід' };

export default function LoginPage() {
  return (
    <AuthShell title="Раді бачити знову" lead="Увійди, щоб тиснути «Іду» й бачити події під себе.">
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
