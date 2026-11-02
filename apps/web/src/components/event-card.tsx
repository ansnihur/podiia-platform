import Link from 'next/link';
import type { FeedEvent } from '@/lib/events';
import { dayNum, monthShort, time, weekdayShort, scaleLabel } from '@/lib/format';
import { rubricName } from '@/lib/rubrics';
import { Cover } from './cover';
import { GoingButton, Stamp } from './going-button';

export function EventCard({ e }: { e: FeedEvent }) {
  const main = e.rubrics.find((r) => r !== 'weekend') ?? e.rubrics[0];
  return (
    <article className="card relative flex flex-col overflow-hidden">
      <Cover coverUrl={e.coverUrl} rubric={main} className="h-44 p-4">
        <div className="relative flex h-full items-end justify-between gap-2">
          <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-ink">{scaleLabel(e.capacity)}</span>
          <span className="flex min-w-[54px] flex-col items-center rounded-2xl bg-white px-2 py-1.5 text-ink">
            <span className="text-[10px] font-bold tracking-[0.06em] text-carmine">{monthShort(e.startsAt)}</span>
            <span className="font-display text-2xl font-extrabold leading-none">{dayNum(e.startsAt)}</span>
          </span>
        </div>
      </Cover>
      {e.isGoing && <Stamp size={72} className="absolute right-4 top-4" />}
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-xs font-bold text-muted">{e.rubrics.map(rubricName).join(' · ')}</p>
        <h3 className="font-display text-lg font-bold leading-tight">
          <Link href={`/events/${e.id}`} className="after:absolute after:inset-0 hover:text-carmine">
            {e.title}
          </Link>
        </h3>
        <p className="text-sm text-muted">
          {weekdayShort(e.startsAt)} · {time(e.startsAt)} · {e.venue}
        </p>
        {e.why ? <p className="text-sm font-bold text-carmine">{e.why}</p> : e.hook ? <p className="text-sm font-bold text-ink">{e.hook}</p> : null}
        <div className="relative z-10 mt-auto flex items-center justify-between gap-3 pt-2">
          <span className="text-sm text-muted">{e.goingCount > 0 ? `${e.goingCount} іде` : 'Будь першим'}</span>
          <GoingButton eventId={e.id} initial={e.isGoing} next="/" />
        </div>
      </div>
    </article>
  );
}
