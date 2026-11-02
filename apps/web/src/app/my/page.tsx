import type { Metadata } from 'next';
import Link from 'next/link';
import { myGoing } from '@/lib/events';
import { requireUser } from '@/lib/session';
import { dayNum, monthShort, plural, time, weekdayShort } from '@/lib/format';
import { SpiralMark } from '@/components/brand';
import { Stamp } from '@/components/going-button';
import { SignOutButton } from './sign-out';

export const metadata: Metadata = { title: 'Мої події' };
export const dynamic = 'force-dynamic';

export default async function MyEvents() {
  const user = await requireUser('/my');
  const { upcoming, past } = await myGoing(user.id);
  const total = upcoming.length + past.length;

  return (
    <div className="mx-auto flex max-w-[960px] flex-col gap-8 px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="h-display text-[clamp(32px,4.5vw,52px)]">Мої події</h1>
        <div className="flex flex-wrap gap-2">
          <Link href="/welcome" className="btn-ghost min-h-[44px] px-5">
            Мої вподобання
          </Link>
          <SignOutButton />
        </div>
      </div>

      <div className="flex items-center gap-4 rounded-card bg-ground px-5 py-4 text-light">
        <SpiralMark size={52} />
        <div className="flex flex-1 flex-col">
          <span className="font-display text-lg font-bold">Твоя спіраль</span>
          <span className="text-sm text-[#D8CFCB]">
            {total} {plural(total, 'подія', 'події', 'подій')} на твоїй спіралі. Повна спіраль року — скоро.
          </span>
        </div>
      </div>

      <section aria-labelledby="up" className="flex flex-col gap-3">
        <h2 id="up" className="font-display text-2xl font-bold">
          Скоро
        </h2>
        {upcoming.length === 0 ? (
          <div className="card flex flex-col items-start gap-3 p-6">
            <p className="font-display text-lg font-bold">Тут поки тихо</p>
            <p className="text-muted">Закрутимо щось? Глянь, що поруч цими вихідними.</p>
            <Link href="/#afisha" className="btn-dark">
              До афіші
            </Link>
          </div>
        ) : (
          upcoming.map((e) => (
            <Link key={e.id} href={`/events/${e.id}`} className="card relative flex items-center gap-4 overflow-hidden p-4 hover:ring-2 hover:ring-ink">
              <span className="flex w-16 shrink-0 flex-col items-center rounded-2xl bg-light py-2">
                <span className="text-[10px] font-bold tracking-[0.06em] text-carmine">{monthShort(e.startsAt)}</span>
                <span className="font-display text-2xl font-extrabold leading-none">{dayNum(e.startsAt)}</span>
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1 pr-16">
                <span className="font-display font-bold leading-tight">{e.title}</span>
                <span className="text-sm text-muted">
                  {weekdayShort(e.startsAt)} · {time(e.startsAt)} · {e.venue}
                </span>
              </span>
              <Stamp size={56} className="absolute right-4 top-1/2 -translate-y-1/2" />
            </Link>
          ))
        )}
      </section>

      {past.length > 0 && (
        <section aria-labelledby="past" className="flex flex-col gap-3">
          <h2 id="past" className="font-display text-2xl font-bold">
            Минулі
          </h2>
          {past.map((e) => (
            <Link key={e.id} href={`/events/${e.id}`} className="card flex items-center gap-4 p-4 text-muted">
              <span className="w-16 shrink-0 text-center font-bold">
                {dayNum(e.startsAt)} {monthShort(e.startsAt)}
              </span>
              <span className="font-bold text-ink">{e.title}</span>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
