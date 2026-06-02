'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useLanguage } from '@/contexts/language';
import { CheckCircle, Flag, XCircle, RotateCcw } from 'lucide-react';

interface Props { eventId: string; status: string; }

export function EventStatusButtons({ eventId, status }: Props) {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState<string | null>(null);

  const transitions: Record<string, { label: string; icon: React.ElementType; next: string; style: string }[]> = {
    DRAFT: [
      { label: t.dash_publish,      icon: CheckCircle, next: 'PUBLISHED',
        style: 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0] hover:bg-[#DCFCE7]' },
    ],
    PUBLISHED: [
      { label: t.dash_complete,     icon: Flag,     next: 'COMPLETED',
        style: 'bg-[#EFF6FF] text-[#3B82F6] border-[#BFDBFE] hover:bg-[#DBEAFE]' },
      { label: t.dash_cancel_event, icon: XCircle,  next: 'CANCELLED',
        style: 'bg-[#FEF2F2] text-[#EF4444] border-[#FECACA] hover:bg-[#FEE2E2]' },
    ],
    CANCELLED: [
      { label: t.dash_restore,      icon: RotateCcw, next: 'DRAFT',
        style: 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0] hover:bg-[#DCFCE7]' },
    ],
    COMPLETED: [
      { label: t.dash_restore,      icon: RotateCcw, next: 'DRAFT',
        style: 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0] hover:bg-[#DCFCE7]' },
    ],
  };

  const buttons = transitions[status] ?? [];
  if (buttons.length === 0) return null;

  async function changeStatus(next: string) {
    setLoading(next);
    try {
      await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <>
      {buttons.map(({ label, icon: Icon, next, style }) => (
        <button key={next} onClick={() => changeStatus(next)} disabled={loading !== null}
          className={`flex items-center gap-1.5 border text-xs font-medium rounded-lg px-2.5 py-1.5 transition-colors disabled:opacity-50 ${style}`}>
          {loading === next ? (
            <span className="w-8 text-center">…</span>
          ) : (
            <><Icon className="h-3.5 w-3.5" /> {label}</>
          )}
        </button>
      ))}
    </>
  );
}
