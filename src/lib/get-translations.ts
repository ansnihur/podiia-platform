import { cookies } from 'next/headers';
import { translations } from './translations';

export function getLocale(): 'uk' | 'en' {
  const v = cookies().get('locale')?.value;
  return v === 'en' ? 'en' : 'uk';
}

export function getT() {
  return translations[getLocale()];
}
