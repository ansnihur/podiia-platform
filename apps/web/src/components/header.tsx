import Link from 'next/link';
import { getCurrentUser } from '@/lib/session';
import { Logo } from './brand';

export async function Header() {
  const user = await getCurrentUser();
  return (
    <header className="mx-auto flex w-full max-w-[1280px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
      <Link href="/" aria-label="Podїa — на головну" className="text-ink">
        <Logo size={24} />
      </Link>
      <nav aria-label="Головна навігація" className="flex flex-wrap items-center gap-x-6 gap-y-2 font-medium">
        <Link href="/#afisha" className="hover:text-carmine">
          Афіша
        </Link>
        {user && (
          <Link href="/my" className="hover:text-carmine">
            Мої події
          </Link>
        )}
        {user ? (
          <Link href="/my" className="flex h-11 w-11 items-center justify-center rounded-full bg-ground font-bold text-white" aria-label={`Профіль: ${user.name}`}>
            {user.name.charAt(0).toUpperCase()}
          </Link>
        ) : (
          <Link href="/auth/login" className="btn-dark min-h-[44px] px-5">
            Увійти
          </Link>
        )}
      </nav>
    </header>
  );
}
