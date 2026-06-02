'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { PodiiaIcon, PodiiaWordmark } from '@/components/podiia-logo';
import { useLanguage } from '@/contexts/language';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validate = (): string => {
    if (!email.trim()) return 'Введіть email';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Невірний формат email';
    if (!password) return 'Введіть пароль';
    if (password.length < 6) return 'Пароль має містити щонайменше 6 символів';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setLoading(true); setError('');
    const result = await signIn('credentials', { email, password, redirect: false });
    if (result?.error) { setError(t.auth_invalid); setLoading(false); }
    else { router.push('/'); router.refresh(); }
  };

  const demos = [
    { label: 'Admin',              email: 'admin@events.dev',       pw: 'admin123' },
    { label: t.auth_role_organizer, email: 'organizer@events.dev',   pw: 'organizer123' },
    { label: t.auth_role_speaker,   email: 'speaker@events.dev',     pw: 'speaker123' },
    { label: t.auth_role_participant, email: 'participant@events.dev', pw: 'participant123' },
  ];

  const inputCls = "w-full px-3.5 py-3 rounded-[10px] border border-[#E5E7EB] bg-white text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FFD84D] transition-colors";

  return (
    <div className="ua-bg min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-4">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2 text-center">
          <PodiiaIcon size={36} />
          <PodiiaWordmark textSize="text-2xl" />
        </div>

        {/* Form card */}
        <div className="ua-card p-6 space-y-5">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-[#111827]">{t.auth_login_title}</h1>
            <div className="mt-2 w-10 h-[3px] bg-[#FFD84D] mx-auto rounded-full" />
          </div>

          {error && (
            <div className="rounded-lg bg-[#FEF2F2] border border-[#FCA5A5] px-4 py-3 text-sm text-[#DC2626] text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-sm">✉</span>
              <input type="email" placeholder={t.auth_email} value={email}
                onChange={e => setEmail(e.target.value)} required
                className={`${inputCls} pl-9`} />
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-sm">🔒</span>
              <input type={showPw ? 'text' : 'password'} placeholder={t.auth_password} value={password}
                onChange={e => setPassword(e.target.value)} required
                className={`${inputCls} pl-9 pr-10`} />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? t.auth_signing_in : t.auth_sign_in}
            </button>
          </form>

          <p className="text-center text-sm text-[#6B7280]">
            {t.auth_no_account}{' '}
            <Link href="/auth/register" className="text-[#7BAAE8] font-semibold hover:underline">{t.auth_create}</Link>
          </p>
        </div>

        {/* Demo accounts */}
        <div className="ua-card p-4 space-y-3">
          <p className="text-xs font-semibold text-[#6B7280] text-center uppercase tracking-wide">{t.auth_demo_accounts}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {demos.map(acc => (
              <button key={acc.label} onClick={() => { setEmail(acc.email); setPassword(acc.pw); }}
                className="py-2 px-1 text-xs font-semibold rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] hover:border-[#FFD84D] transition-colors text-[#111827]">
                {acc.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-center text-[#9CA3AF]">{t.auth_auto_fill}</p>
        </div>
      </div>
    </div>
  );
}
