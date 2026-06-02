'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { translations, type Locale, type T } from '@/lib/translations';

interface LanguageContextType {
  locale: Locale;
  t: T;
  setLocale: (l: Locale) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: 'uk',
  t: translations.uk as T,
  setLocale: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('uk');
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale | null;
    if (saved === 'en' || saved === 'uk') setLocaleState(saved);
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('locale', l);
    document.cookie = `locale=${l}; path=/; max-age=31536000`;
    router.refresh();
  };

  return (
    <LanguageContext.Provider value={{ locale, t: translations[locale] as T, setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}