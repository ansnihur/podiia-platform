'use client';
import { useLanguage } from '@/contexts/language';

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="language-switcher flex items-center gap-0 rounded-full border-2 border-black/15 overflow-hidden bg-white/60">
      <button
        onClick={() => setLocale('uk')}
        style={{ transition: 'all 200ms ease', transform: 'none' }}
        className={`px-2.5 py-1 text-xs font-bold hover:translate-y-0 hover:shadow-none ${
          locale === 'uk'
            ? 'bg-[#1a1a1a] text-white'
            : 'bg-transparent text-[#1a1a1a] hover:bg-black/10'
        }`}
      >
        УКР
      </button>
      <button
        onClick={() => setLocale('en')}
        style={{ transition: 'all 200ms ease', transform: 'none' }}
        className={`px-2.5 py-1 text-xs font-bold hover:translate-y-0 hover:shadow-none ${
          locale === 'en'
            ? 'bg-[#1a1a1a] text-white'
            : 'bg-transparent text-[#1a1a1a] hover:bg-black/10'
        }`}
      >
        ENG
      </button>
    </div>
  );
}
