'use client';
import Link from 'next/link';
import { useLanguage } from '@/contexts/language';
import { PodiiaIcon, PodiiaWordmark } from '@/components/podiia-logo';

export function FooterWrapper() {
  const { t } = useLanguage();
  return (
    <footer className="ua-footer mt-12" style={{ background: '#111827' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6 text-center sm:text-left">
          <div className="space-y-1.5 flex flex-col items-center sm:items-start">
            <Link href="/terms" className="block text-sm font-semibold text-white hover:text-white/80 transition-colors">
              {t.footer_terms}
            </Link>
            <Link href="/events" className="block text-sm text-[#D1D5DB] hover:text-white transition-colors">
              {t.footer_help}
            </Link>
            <a href="mailto:podiia.platform@gmail.com" className="block text-sm text-[#FFD84D] font-medium hover:text-[#FFE57A] transition-colors">
              {t.footer_contact}
            </a>
          </div>
          <div className="flex items-center justify-center text-sm font-medium text-[#D1D5DB]">
            {t.footer_kyiv_time}
          </div>
          <div className="flex items-center justify-center sm:justify-end gap-4">
            <Link href="/auth/register" className="text-sm font-semibold text-white hover:text-white/80 transition-colors">
              {t.nav_register}
            </Link>
            <Link href="/auth/login" className="text-sm font-semibold text-white hover:text-white/80 transition-colors">
              {t.nav_login}
            </Link>
          </div>
        </div>

        <div className="border-t border-white/10 pt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full border border-[#4B5563] flex items-center justify-center text-[#D1D5DB] hover:border-[#FFD84D] hover:text-[#FFD84D] transition-colors font-bold text-sm">
              f
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full border border-[#4B5563] flex items-center justify-center text-[#D1D5DB] hover:border-[#FFD84D] hover:text-[#FFD84D] transition-colors">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/>
              </svg>
            </a>
            <span className="text-sm text-[#9CA3AF]">{t.footer_copyright} {new Date().getFullYear()}</span>
          </div>
          <Link href="/" className="flex items-center gap-2">
            <PodiiaIcon size={22} />
            <span className="font-display text-lg font-bold text-white">
              Pod<span className="text-[#7BAAE8]">i</span><span className="text-[#FFD84D]">i</span>a
            </span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
