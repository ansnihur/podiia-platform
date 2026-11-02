'use client';
import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toggleGoing } from '@/app/actions';
import { SpiralLine } from './brand';

export function GoingButton({ eventId, initial, size = 'md', next }: { eventId: string; initial: boolean; size?: 'md' | 'lg'; next?: string }) {
  const [isGoing, setGoing] = useState(initial);
  useEffect(() => setGoing(initial), [initial]);
  const [pending, start] = useTransition();
  const router = useRouter();

  const onClick = () =>
    start(async () => {
      const was = isGoing;
      setGoing(!was);
      if (!was && 'vibrate' in navigator) navigator.vibrate?.(15);
      const res = await toggleGoing(eventId);
      if ('going' in res) setGoing(res.going);
      else setGoing(was);
      if ('needLogin' in res) router.push(`/auth/login?next=${encodeURIComponent(next ?? `/events/${eventId}`)}`);
    });

  const big = size === 'lg';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isGoing}
      disabled={pending}
      className={`btn ${big ? 'min-h-[56px] px-9 text-lg' : 'min-h-[44px] px-5 text-[15px]'} ${isGoing ? 'border-2 border-ink bg-ink text-white' : 'bg-carmine text-white hover:bg-[#A91D16]'}`}
    >
      {isGoing ? 'Іду ✓' : 'Іду'}
    </button>
  );
}

/** Round «ІДУ!» stamp with a spiral — shown on events you're going to. */
export function Stamp({ date, size = 104, className = '' }: { date?: string; size?: number; className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none flex -rotate-12 animate-stamp flex-col items-center justify-center gap-0.5 rounded-full border-4 border-white bg-carmine text-white shadow-[0_0_0_3px_#C8241B] ${className}`}
      style={{ width: size, height: size }}
    >
      <SpiralLine width={size * 0.4} color="#FFFFFF" stroke={12} />
      <span className="font-display font-extrabold leading-none" style={{ fontSize: size * 0.2 }}>
        ІДУ!
      </span>
      {date && <span className="text-[10px] font-bold tracking-[0.1em]">{date}</span>}
    </div>
  );
}
