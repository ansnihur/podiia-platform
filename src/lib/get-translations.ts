import { cookies } from 'next/headers';
import { translations } from './translations';
import type { T } from './translations';

export function getLocale(): 'uk' | 'en' {
  const v = cookies().get('locale')?.value;
  return v === 'en' ? 'en' : 'uk';
}

export function getT(): T {
  return translations[getLocale()] as T;
}