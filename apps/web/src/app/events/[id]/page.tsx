import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { db, schema } from '@/db';
import { getEvent } from '@/lib/events';
import { getCurrentUser, hasRole } from '@/lib/session';
import { dateLine, dayNum, monthLong, monthNum, priceLabel, scaleLabel, weekdayShort } from '@/lib/format';
import { rubricName } from '@/lib/rubrics';
import { Cover } from '@/components/cover';
import { GoingButton, Stamp } from '@/components/going-button';
import { RubricIcon } from '@/components/rubric-icon';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const e = await getEvent(params.id, null);
  return e ? { title: e.title, description: e.description.slice(0, 160) } : {};
}

export default async function EventPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  const e = await getEvent(params.id, user?.id ?? null);
  // Unpublished events are visible only to their organizer and the admin.
  if (!e || (e.status !== 'PUBLISHED' && e.organizerId !== user?.id && !hasRole(user, 'ADMIN'))) notFound();

  await db.insert(schema.interactions).values({ type: 'VIEW', userId: user?.id ?? null, eventId: e.id });
  const main = e.rubrics.find((r) => r !== 'weekend') ?? e.rubrics[0];

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-8 px-4 pb-8 pt-2 sm:px-6">
      <Link href="/#afisha" className="self-start text-sm font-bold text-muted hover:text-ink">
        ← До афіші
      </Link>
      {e.status !== 'PUBLISHED' && (
        <p className="rounded-2xl bg-petal px-4 py-3 font-bold">Цю подію ще не опубліковано — її бачиш лише ти.</p>
      )}
      <Cover coverUrl={e.coverUrl} rubric={main} className="h-[280px] rounded-big sm:h-[340px]">
        <div className="absolute bottom-5 left-5 flex flex-col items-center rounded-3xl bg-white px-5 py-3 text-ink">
          <span className="text-xs font-bold uppercase tracking-[0.08em] text-carmine">{monthLong(e.startsAt)}</span>
          <span className="font-display text-5xl font-extrabold leading-none">{dayNum(e.startsAt)}</span>
          <span className="text-xs font-bold">{weekdayShort(e.startsAt)}</span>
        </div>
        {e.isGoing && <Stamp size={120} date={`${dayNum(e.startsAt)} · ${monthNum(e.startsAt)}`} className="absolute right-6 top-6" />}
      </Cover>

      <div className="flex flex-wrap gap-10">
        <div className="flex min-w-0 flex-[999_1_520px] flex-col gap-5">
          <div className="flex flex-wrap gap-2">
            {e.rubrics.map((r) => (
              <Link key={r} href={`/?r=${r}#afisha`} className="chip">
                <RubricIcon slug={r} size={22} />
                {rubricName(r)}
              </Link>
            ))}
          </div>
          <h1 className="h-display text-[clamp(30px,4vw,52px)] leading-[1.02]">{e.title}</h1>
          {e.hook && <p className="text-lg font-bold text-carmine">{e.hook}</p>}
          <p className="whitespace-pre-line text-lg leading-relaxed">{e.description}</p>
        </div>

        <aside className="flex min-w-0 flex-[1_1_300px] flex-col gap-4">
          <div className="card flex flex-col gap-4 p-6">
            <dl className="flex flex-col gap-3">
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.06em] text-muted">Коли</dt>
                <dd className="font-bold">{dateLine(e.startsAt)}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.06em] text-muted">Де</dt>
                <dd className="font-bold">
                  {e.venue}
                  {e.address && <span className="block font-normal text-muted">{e.address}, {e.city}</span>}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.06em] text-muted">Скільки людей</dt>
                <dd className="font-bold">{scaleLabel(e.capacity)}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.06em] text-muted">Ціна</dt>
                <dd className="font-bold">{priceLabel(e.priceFrom)}</dd>
              </div>
            </dl>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone pt-4">
              <span className="text-sm text-muted">{e.goingCount > 0 ? `${e.goingCount} вже йде` : 'Будь першим'}</span>
              <GoingButton eventId={e.id} initial={e.isGoing} size="lg" />
            </div>
          </div>
          <div className="card flex items-center gap-3 p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ground font-bold text-white">{e.organizer.name.charAt(0)}</span>
            <span className="flex flex-col">
              <span className="font-bold">{e.organizer.name}</span>
              <span className="text-sm text-muted">Перевірено командою Podїa</span>
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}
