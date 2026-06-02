import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, locale: string = 'uk'): string {
  return new Intl.DateTimeFormat(locale === 'uk' ? 'uk-UA' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatTime(date: Date | string, locale: string = 'uk'): string {
  return new Intl.DateTimeFormat(locale === 'uk' ? 'uk-UA' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: locale !== 'uk',
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string, locale: string = 'uk'): string {
  const sep = locale === 'uk' ? ' о ' : ' at ';
  return `${formatDate(date, locale)}${sep}${formatTime(date, locale)}`;
}

export function formatShortDate(date: Date | string, locale: string = 'uk'): string {
  return new Intl.DateTimeFormat(locale === 'uk' ? 'uk-UA' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

export function isUpcoming(date: Date | string): boolean {
  return new Date(date) > new Date();
}

export function daysUntil(date: Date | string): number {
  const diff = new Date(date).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export const STATUS_LABELS: Record<string, string> = {
  PUBLISHED: 'Опубліковано',
  DRAFT: 'Чернетка',
  CANCELLED: 'Скасовано',
  COMPLETED: 'Завершено',
  CONFIRMED: 'Підтверджено',
  PENDING: 'Очікує',
};

export function statusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    PUBLISHED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    DRAFT: 'bg-slate-100 text-slate-600 border-slate-200',
    CANCELLED: 'bg-red-100 text-red-700 border-red-200',
    COMPLETED: 'bg-blue-100 text-blue-700 border-blue-200',
    CONFIRMED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
  };
  return map[status] ?? 'bg-slate-100 text-slate-600';
}

export function roleColor(role: string): string {
  const map: Record<string, string> = {
    ADMIN: 'bg-purple-100 text-purple-700 border-purple-200',
    ORGANIZER: 'bg-blue-100 text-blue-700 border-blue-200',
    SPEAKER: 'bg-amber-100 text-amber-700 border-amber-200',
    PARTICIPANT: 'bg-slate-100 text-slate-600 border-slate-200',
  };
  return map[role] ?? 'bg-slate-100 text-slate-600';
}
