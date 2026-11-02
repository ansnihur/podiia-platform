import type { Metadata } from 'next';
import { asc, eq } from 'drizzle-orm';
import { db, schema } from '@/db';
import { requireUser } from '@/lib/session';
import { rubrics } from '@/lib/rubrics';
import { RubricIcon } from '@/components/rubric-icon';
import { saveOnboarding } from '../auth/actions';

export const metadata: Metadata = { title: 'Що тобі до душі?' };
export const dynamic = 'force-dynamic';

const CITIES = ['Київ', 'Львів', 'Харків', 'Одеса', 'Дніпро', 'Вінниця', 'Інше місто'];

export default async function Welcome({ searchParams }: { searchParams: { error?: string } }) {
  const user = await requireUser('/welcome');
  const [all, mine] = await Promise.all([
    db.select().from(schema.interests).orderBy(asc(schema.interests.name)),
    db.select().from(schema.userInterests).where(eq(schema.userInterests.userId, user.id)),
  ]);
  const picked = new Set(mine.map((m) => m.interestSlug));

  return (
    <div className="mx-auto flex max-w-[960px] flex-col gap-8 px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-3">
        <p className="text-lg text-muted">Привіт, {user.name.split(' ')[0]}!</p>
        <h1 className="h-display text-[clamp(32px,4.5vw,56px)] leading-[1.02]">Що тобі до душі?</h1>
        <p className="max-w-2xl text-lg text-muted">Обери кілька — і стрічка підлаштується. Потім вона вчитиметься з того, куди ти ходиш.</p>
      </div>
      {searchParams.error && (
        <p role="alert" className="font-bold text-carmine">
          Обери місто, будь ласка.
        </p>
      )}
      <form action={saveOnboarding} className="flex flex-col gap-8">
        {rubrics
          .filter((r) => all.some((i) => i.rubricSlug === r.slug))
          .map((r) => (
            <fieldset key={r.slug} className="flex flex-col gap-3">
              <legend className="mb-3 flex items-center gap-3 font-display text-xl font-bold">
                <RubricIcon slug={r.slug} size={32} />
                {r.name}
              </legend>
              <div className="flex flex-wrap gap-2">
                {all
                  .filter((i) => i.rubricSlug === r.slug)
                  .map((i) => (
                    <label key={i.slug} className="cursor-pointer">
                      <input type="checkbox" name="interests" value={i.slug} defaultChecked={picked.has(i.slug)} className="peer sr-only" />
                      <span className="chip peer-checked:bg-ground peer-checked:text-white peer-checked:ring-ground peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-carmine">
                        {i.name}
                      </span>
                    </label>
                  ))}
              </div>
            </fieldset>
          ))}
        <label className="flex max-w-sm flex-col gap-1.5">
          <span className="label">Твоє місто</span>
          <select name="city" defaultValue={user.city ?? 'Київ'} className="field">
            {CITIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn-primary min-h-[56px] self-start px-10 text-lg">
          Показати мої події
        </button>
      </form>
    </div>
  );
}
