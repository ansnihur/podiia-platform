'use client';
import { signOut } from 'next-auth/react';

export function SignOutButton() {
  return (
    <button type="button" onClick={() => signOut({ callbackUrl: '/' })} className="btn-ghost min-h-[44px] px-5">
      Вийти
    </button>
  );
}
