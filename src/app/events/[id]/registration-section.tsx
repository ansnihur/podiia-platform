'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, CheckCircle, LogIn, XCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/language';

interface Props {
  eventId: string;
  eventStatus: string;
  capacity: number;
  initialRegistrations: number;
  registrationStatus: string | null;
  isUpcoming: boolean;
  userId: string | null;
}

export function RegistrationSection({
  eventId, eventStatus, capacity,
  initialRegistrations, registrationStatus, isUpcoming, userId,
}: Props) {
  const router = useRouter();
  const { t } = useLanguage();

  const [registrations, setRegistrations] = useState(initialRegistrations);
  const [status, setStatus] = useState(registrationStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const spotsLeft = capacity - registrations;
  const fillPct = Math.min((registrations / capacity) * 100, 100);

  const doRegister = async () => {
    setLoading(true); setError('');
    const res = await fetch('/api/registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? t.common_error); }
    else { setStatus(data.status); setRegistrations(n => n + 1); router.refresh(); }
    setLoading(false);
  };

  const doCancel = async () => {
    setLoading(true); setError('');
    const res = await fetch(`/api/registrations?eventId=${eventId}`, { method: 'DELETE' });
    if (res.ok) { setStatus(null); setRegistrations(n => n - 1); router.refresh(); }
    else { setError(t.common_error); }
    setLoading(false);
  };

  return (
    <>
      {/* Seat counter */}
      <div className="space-y-1.5 bg-[#F9FAFB] rounded-xl p-3">
        <div className="flex justify-between text-sm">
          <span className="text-[#6B7280]">{t.event_seats}</span>
          <span className="font-bold text-[#111827]">{registrations} / {capacity}</span>
        </div>
        <div className="h-[3px] rounded-full bg-[#F3F4F6] overflow-hidden">
          <div className="h-full rounded-full transition-all duration-300"
            style={{ width: `${fillPct}%`, background: spotsLeft === 0 ? '#EF4444' : '#FFD84D' }} />
        </div>
        <p className="text-xs text-[#6B7280] text-right">
          {spotsLeft > 0 ? `${spotsLeft} ${t.event_spots_left}` : t.event_full}
        </p>
      </div>

      {!isUpcoming && (
        <p className="text-center text-sm text-[#6B7280] py-2">{t.event_past}</p>
      )}
      {isUpcoming && eventStatus !== 'PUBLISHED' && (
        <p className="text-center text-sm text-[#6B7280] py-2">{t.event_not_open}</p>
      )}
      {isUpcoming && eventStatus === 'PUBLISHED' && !userId && (
        <Link href={`/auth/login?next=/events/${eventId}`} className="block w-full">
          <button className="btn-primary w-full flex items-center justify-center gap-2">
            <LogIn className="h-4 w-4" /> {t.event_sign_in}
          </button>
        </Link>
      )}
      {isUpcoming && eventStatus === 'PUBLISHED' && userId && (
        status === 'CONFIRMED' || status === 'PENDING' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 rounded-lg bg-white border border-[#86EFAC] px-4 py-3">
              <CheckCircle className="h-4 w-4 text-[#16A34A]" />
              <span className="text-sm font-semibold text-[#15803D]">
                {status === 'CONFIRMED' ? t.event_registered : t.event_pending}
              </span>
            </div>
            {error && <p className="text-xs text-[#DC2626] text-center">{error}</p>}
            <button onClick={doCancel} disabled={loading}
              className="w-full py-2.5 rounded-lg bg-white border border-[#FCA5A5] text-[#EF4444] text-sm font-semibold hover:bg-[#FEF2F2] transition-colors flex items-center justify-center gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
              {t.event_cancel}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {error && <p className="text-xs text-[#DC2626] text-center">{error}</p>}
            <button onClick={doRegister} disabled={loading || spotsLeft === 0}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {spotsLeft === 0 ? t.event_full : loading ? t.event_registering : t.event_register}
            </button>
            <p className="text-xs text-center text-[#6B7280]">{t.event_free}</p>
          </div>
        )
      )}
    </>
  );
}
