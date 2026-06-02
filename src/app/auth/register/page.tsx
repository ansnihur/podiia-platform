'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { PodiiaIcon, PodiiaWordmark } from '@/components/podiia-logo';
import { useLanguage } from '@/contexts/language';

const ROLES = [
  { value: 'PARTICIPANT' },
  { value: 'ORGANIZER' },
  { value: 'SPEAKER' },
] as const;

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'PARTICIPANT' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const roleLabel = (role: string) => {
    if (role === 'PARTICIPANT') return t.auth_role_participant;
    if (role === 'ORGANIZER') return t.auth_role_organizer;
    return t.auth_role_speaker;
  };
  const roleDesc = (role: string) => {
    if (role === 'PARTICIPANT') return t.auth_role_participant_desc;
    if (role === 'ORGANIZER') return t.auth_role_organizer_desc;
    return t.auth_role_speaker_desc;
  };

  const validate = (): string => {
    const name = form.name.trim();
    const email = form.email.trim();
    const password = form.password;

    if (!name) return 'Введіть своє ім\'я';
    if (name.length < 2) return 'Ім\'я має містити щонайменше 2 символи';
    if (name.length > 60) return 'Ім\'я занадто довге (макс. 60 символів)';
    if (/\d/.test(name)) return 'Ім\'я не може містити цифри';
    if (/[^a-zA-Zа-яА-ЯіІїЇєЄґҐ'\- ]/.test(name)) return 'Ім\'я містить недопустимі символи';

    if (!email) return 'Введіть email';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Невірний формат email';

    if (!password) return 'Введіть пароль';
    if (password.length < 6) return 'Пароль має містити щонайменше 6 символів';
    if (password.length > 72) return 'Пароль занадто довгий (макс. 72 символи)';
    if (!/[A-Za-zА-Яа-яІіЇїЄєҐґ]/.test(password)) return 'Пароль має містити хоча б одну літеру';

    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) return setError(validationError);
    setLoading(true); setError('');
    const res = await fetch('/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? t.common_error); setLoading(false); return; }
    await signIn('credentials', { email: form.email, password: form.password, redirect: false });
    router.push('/'); router.refresh();
  };

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
        <div className="ua-card p-6 space-y-4">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-[#111827]">{t.auth_register_title}</h1>
            <div className="mt-2 w-10 h-[3px] bg-[#FFD84D] mx-auto rounded-full" />
          </div>

          {error && (
            <div className="rounded-lg bg-[#FEF2F2] border border-[#FCA5A5] px-4 py-3 text-sm text-[#DC2626] text-center">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-sm">👤</span>
              <input placeholder={t.auth_name} value={form.name} onChange={update('name')} required
                className={`${inputCls} pl-9`} />
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-sm">✉</span>
              <input type="email" placeholder={t.auth_email} value={form.email} onChange={update('email')} required
                className={`${inputCls} pl-9`} />
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-sm">🔒</span>
              <input type={showPw ? 'text' : 'password'} placeholder={t.auth_password} value={form.password}
                onChange={update('password')} required minLength={6}
                className={`${inputCls} pl-9 pr-10`} />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Role selector */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-[#374151]">{t.auth_account_type}</p>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map(r => (
                  <button key={r.value} type="button" onClick={() => setForm(f => ({ ...f, role: r.value }))}
                    className={`relative flex flex-col items-center gap-1 rounded-[10px] border p-3 text-center transition-all ${
                      form.role === r.value
                        ? 'border-[#FFD84D] bg-[#FFFDE7]'
                        : 'border-[#E5E7EB] bg-white hover:border-[#FFD84D]/60 hover:bg-[#FFFDE7]/40'
                    }`}>
                    {form.role === r.value && <CheckCircle2 className="absolute right-1.5 top-1.5 h-3.5 w-3.5 text-[#111827]" />}
                    <span className="text-xs font-bold text-[#111827]">{roleLabel(r.value)}</span>
                    <span className="text-[10px] text-[#6B7280] leading-tight">{roleDesc(r.value)}</span>
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 mt-1">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? t.auth_creating : t.auth_create_account}
            </button>
          </form>

          <p className="text-center text-sm text-[#6B7280]">
            {t.auth_have_account}{' '}
            <Link href="/auth/login" className="text-[#7BAAE8] font-semibold hover:underline">{t.auth_sign_in}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
