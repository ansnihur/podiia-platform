'use client';
import Link from 'next/link';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { register } from '../actions';

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError('');
    const f = new FormData(e.currentTarget);
    const res = await register(null, f);
    if (res.error) {
      setError(res.error);
      setPending(false);
      return;
    }
    await signIn('credentials', { email: f.get('email'), password: f.get('password'), redirect: false });
    router.push('/welcome');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-md flex-col gap-4" noValidate>
      <label className="flex flex-col gap-1.5">
        <span className="label">Як тебе звати</span>
        <input name="name" autoComplete="given-name" required className="field" />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="label">Email</span>
        <input name="email" type="email" autoComplete="email" required className="field" />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="label">Пароль</span>
        <input name="password" type="password" autoComplete="new-password" minLength={8} required className="field" aria-describedby="pw-hint" />
        <span id="pw-hint" className="text-sm text-muted">
          Щонайменше 8 символів
        </span>
      </label>
      {error && (
        <p role="alert" className="font-bold text-carmine">
          {error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn-primary min-h-[54px] text-lg">
        {pending ? 'Створюємо…' : 'Далі'}
      </button>
      <p className="text-muted">
        Уже є акаунт?{' '}
        <Link href="/auth/login" className="font-bold text-carmine">
          Увійти
        </Link>
      </p>
    </form>
  );
}
