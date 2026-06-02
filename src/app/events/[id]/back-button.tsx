'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/language';

export function BackButton() {
  const router = useRouter();
  const { t } = useLanguage();
  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm transition-colors"
    >
      <ArrowLeft className="h-4 w-4" />
      {t.event_back}
    </button>
  );
}
