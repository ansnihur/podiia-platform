'use client';
import Link from 'next/link';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

export function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get('next') || '/';
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError('');
    const f = new FormData(e.currentTarget);
    const res = await signIn('credentials', { email: f.get('email'), password: f.get('password'), redirect: false });
    setPending(false);
    if (res?.ok) {
      router.push(next.startsWith('/') ? next : '/');
      router.refresh();
    } else setError('Email або пароль не підходять. Спробуй ще раз.');
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-md flex-col gap-4" noValidate>
      <label className="flex flex-col gap-1.5">
        <span className="label">Email</span>
        <input name="email" type="email" autoComplete="email" required className="field" />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="label">Пароль</span>
        <input name="password" type="password" autoComplete="current-password" required className="field" />
      </label>
      {error && (
        <p role="alert" className="font-bold text-carmine">
          {error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn-primary min-h-[54px] text-lg">
        {pending ? 'Входимо…' : 'Увійти'}
      </button>
      <p className="text-muted">
        Ще немає акаунта?{' '}
        <Link href={`/auth/register${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`} className="font-bold text-carmine">
          Зареєструватися
        </Link>
      </p>
    </form>
  );
}
