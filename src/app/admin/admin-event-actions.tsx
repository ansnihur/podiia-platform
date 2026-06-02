'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Eye, CheckCircle, XCircle, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface Props { eventId: string; currentStatus: string; }

export function AdminEventActions({ eventId, currentStatus }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const update = async (status: string) => {
    setLoading(status);
    await fetch(`/api/events/${eventId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    router.refresh();
    setLoading(null);
  };

  const btnBase = "h-7 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1 border-2 transition-colors";

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <Link href={`/events/${eventId}`}>
        <button className={`${btnBase} border-[#F5C800] bg-[#FFF8D6] hover:bg-[#FFE566] text-[#1a1a1a]`}>
          <Eye className="h-3 w-3" /> Перегляд
        </button>
      </Link>
      {currentStatus === 'DRAFT' && (
        <button onClick={() => update('PUBLISHED')} disabled={!!loading}
          className={`${btnBase} border-green-300 bg-green-50 hover:bg-green-100 text-green-700`}>
          {loading === 'PUBLISHED' ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />} Опублікувати
        </button>
      )}
      {currentStatus === 'PUBLISHED' && (<>
        <button onClick={() => update('COMPLETED')} disabled={!!loading}
          className={`${btnBase} border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700`}>
          {loading === 'COMPLETED' ? <Loader2 className="h-3 w-3 animate-spin" /> : <BookOpen className="h-3 w-3" />} Завершити
        </button>
        <button onClick={() => update('CANCELLED')} disabled={!!loading}
          className={`${btnBase} border-red-300 bg-red-50 hover:bg-red-100 text-red-700`}>
          {loading === 'CANCELLED' ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />} Скасувати
        </button>
      </>)}
      {currentStatus === 'CANCELLED' && (
        <button onClick={() => update('PUBLISHED')} disabled={!!loading}
          className={`${btnBase} border-green-300 bg-green-50 hover:bg-green-100 text-green-700`}>
          {loading === 'PUBLISHED' ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />} Відновити
        </button>
      )}
    </div>
  );
}
