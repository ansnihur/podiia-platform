import Link from 'next/link';
import { listEvents, rankForUser, stepOutside } from '@/lib/events';
import { getCurrentUser } from '@/lib/session';
import { dateLine, greeting, relativeDays, scaleLabel } from '@/lib/format';
import { rubrics, rubricName } from '@/lib/rubrics';
import { EventCard } from '@/components/event-card';
import { GoingButton, Stamp } from '@/components/going-button';
import { RubricIcon } from '@/components/rubric-icon';
import { SpiralLine } from '@/components/brand';

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: { searchParams: { r?: string; q?: string } }) {
  const user = await getCurrentUser();
  const rubric = rubrics.some((r) => r.slug === searchParams.r) ? searchParams.r : undefined;
  const q = searchParams.q?.slice(0, 80) || undefined;

  const [list, step] = await Promise.all([listEvents({ rubric, q, userId: user?.id }), user ? stepOutside(user.id) : null]);
  const featured = !rubric && !q ? list.find((e) => e.featured) : undefined;
  const feed = rankForUser(list.filter((e) => e.id !== featured?.id));
  const firstName = user?.name.split(' ')[0];

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-14 px-4 pb-8 pt-4 sm:px-6">
      <section className="flex flex-wrap items-stretch gap-6">
        <div className="flex min-w-0 flex-[999_1_520px] flex-col justify-center gap-5 py-4">
          {firstName && <p className="text-lg text-muted">{greeting()}, {firstName}</p>}
          <h1 className="h-display text-[clamp(40px,5.4vw,76px)] leading-[0.98]">Куди підемо сьогодні?</h1>
          <p className="max-w-[560px] text-xl leading-relaxed text-muted">Від посиденьок на вісьмох до фестивалів на тисячі — усі події міста, підібрані під тебе.</p>
          <form role="search" action="/" className="flex max-w-[560px] gap-2 rounded-full bg-white p-1.5 ring-2 ring-stone">
            <label htmlFor="q" className="sr-only">
              Пошук подій
            </label>
            <input id="q" name="q" type="search" defaultValue={q} placeholder="Баня, стретчинг, IT, театр…" className="min-h-[48px] min-w-0 flex-1 bg-transparent px-4 text-[17px] focus:outline-none" />
            {rubric && <input type="hidden" name="r" value={rubric} />}
            <button type="submit" className="btn-dark">
              Знайти
            </button>
          </form>
        </div>

        {featured && (
          <article aria-label="Подія тижня" className="relative flex min-h-[420px] min-w-0 flex-[1_1_400px] flex-col overflow-hidden rounded-big bg-ground p-7 text-white">
            <SpiralLine width={420} color="#C8241B" stroke={8} className="absolute -right-36 -top-10" />
            <span className="relative self-start rounded-full bg-carmine px-3 py-1.5 text-[13px] font-bold">Подія тижня · {relativeDays(featured.startsAt)}</span>
            {featured.isGoing && <Stamp size={104} className="absolute bottom-32 right-7" />}
            <div className="relative mt-auto flex flex-col gap-4">
              <h2 className="font-display text-[32px] font-extrabold leading-[1.05] tracking-[-0.02em]">
                <Link href={`/events/${featured.id}`} className="hover:text-petal">
                  {featured.title}
                </Link>
              </h2>
              <p className="text-[#F5D5CF]">
                {dateLine(featured.startsAt)} · {featured.venue}
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <GoingButton eventId={featured.id} initial={featured.isGoing} size="lg" next="/" />
                <span className="text-sm text-[#F5D5CF]">
                  {featured.goingCount > 0 ? `${featured.goingCount} вже йде` : scaleLabel(featured.capacity)}
                </span>
              </div>
            </div>
          </article>
        )}
      </section>

      {step && (
        <Link href={`/events/${step.id}`} className="relative flex flex-col gap-1 overflow-hidden rounded-card bg-carmine px-6 py-5 text-white hover:bg-[#A91D16]">
          <SpiralLine width={220} color="#FFFFFF" stroke={8} className="absolute -bottom-10 -right-16 opacity-30" />
          <span className="relative text-sm font-bold text-[#FFE3DD]">Крок назовні</span>
          <span className="relative font-display text-xl font-bold leading-snug">
            Щось нове для тебе — «{rubricName(step.rubrics.find((r) => r !== 'weekend') ?? step.rubrics[0])}». Може, «{step.title}»?
          </span>
        </Link>
      )}

      <section aria-labelledby="rub" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="rub" className="font-display text-[26px] font-bold tracking-[-0.02em]">
            Що тобі до душі?
          </h2>
          {rubric && (
            <Link href="/#afisha" className="text-sm font-bold text-carmine">
              Показати все
            </Link>
          )}
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
          {rubrics.map((r) => {
            const on = r.slug === rubric;
            return (
              <Link
                key={r.slug}
                href={on ? '/#afisha' : `/?r=${r.slug}${q ? `&q=${encodeURIComponent(q)}` : ''}#afisha`}
                aria-current={on ? 'true' : undefined}
                className={`flex min-h-[72px] items-center gap-3 rounded-[20px] border-2 px-4 py-3 font-bold transition-colors ${on ? 'border-ground bg-ground text-white' : 'border-stone bg-white hover:border-ink'}`}
              >
                <RubricIcon slug={r.slug} size={40} ink={on ? '#FFFFFF' : '#2A0E10'} />
                {r.name}
              </Link>
            );
          })}
        </div>
      </section>

      <section id="afisha" aria-labelledby="feed" className="flex scroll-mt-6 flex-col gap-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="feed" className="font-display text-[26px] font-bold tracking-[-0.02em]">
            {q ? `Знайшли за «${q}»` : rubric ? rubricName(rubric) : user ? 'Для тебе' : 'Цього тижня й далі'}
          </h2>
          <p className="text-sm text-muted">{feed.length} подій · від камерних до масштабних</p>
        </div>
        {feed.length === 0 ? (
          <div className="card flex flex-col items-start gap-3 p-8">
            <SpiralLine width={120} color="#E7E6E3" stroke={10} />
            <p className="font-display text-xl font-bold">Тут поки тихо</p>
            <p className="text-muted">Закрутимо щось інше? Спробуй іншу рубрику або слово.</p>
            <Link href="/#afisha" className="btn-dark mt-1">
              Уся афіша
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-5">
            {feed.map((e) => (
              <EventCard key={e.id} e={e} />
            ))}
          </div>
        )}
      </section>

      <section className="relative flex flex-wrap items-center justify-between gap-6 overflow-hidden rounded-big bg-carmine px-8 py-10 text-white">
        <SpiralLine width={360} color="#FFFFFF" stroke={7} className="absolute -right-24 -top-16 opacity-25" />
        <div className="relative flex max-w-xl flex-col gap-2">
          <h2 className="font-display text-3xl font-extrabold tracking-[-0.02em]">Скликай людей</h2>
          <p className="text-lg text-[#FFE3DD]">Робиш баню з друзями, клуб чи конференцію? Стань організатором — ми перевіримо й допоможемо знайти своїх.</p>
        </div>
        <span className="relative rounded-full bg-white px-6 py-3 font-bold text-carmine">Заявки відкриємо зовсім скоро</span>
      </section>
    </div>
  );
}
