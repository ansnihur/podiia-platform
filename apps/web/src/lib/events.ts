import 'server-only';
import { and, asc, count, eq, gte, ilike, inArray, or } from 'drizzle-orm';
import { db, schema } from '@/db';

const { events, eventRubrics, eventInterests, going, interests, userInterests } = schema;

export type FeedEvent = {
  id: string;
  title: string;
  description: string;
  startsAt: Date;
  city: string;
  venue: string;
  address: string | null;
  capacity: number | null;
  priceFrom: number | null;
  hook: string | null;
  coverUrl: string | null;
  featured: boolean;
  rubrics: string[];
  goingCount: number;
  isGoing: boolean;
  /** "Бо ти обрала «Книжки»" — only when the user's interests matched. */
  why: string | null;
  score: number;
};

/** Published, upcoming events with rubrics, «Іду» counts and personal ranking. */
export async function listEvents(opts: { rubric?: string; q?: string; userId?: string | null; limit?: number } = {}): Promise<FeedEvent[]> {
  const now = new Date();
  const conds = [eq(events.status, 'PUBLISHED'), gte(events.startsAt, now)];
  if (opts.q) {
    const like = `%${opts.q.trim()}%`;
    conds.push(or(ilike(events.title, like), ilike(events.description, like), ilike(events.venue, like))!);
  }
  if (opts.rubric) {
    conds.push(inArray(events.id, db.select({ id: eventRubrics.eventId }).from(eventRubrics).where(eq(eventRubrics.rubricSlug, opts.rubric))));
  }
  const rows = await db.select().from(events).where(and(...conds)).orderBy(asc(events.startsAt)).limit(opts.limit ?? 60);
  return decorate(rows, opts.userId ?? null);
}

export async function getEvent(id: string, userId: string | null) {
  const row = await db.query.events.findFirst({ where: eq(events.id, id), with: { organizer: { columns: { id: true, name: true } } } });
  if (!row) return null;
  const [decorated] = await decorate([row], userId);
  return { ...decorated, status: row.status, organizerId: row.organizerId, organizer: row.organizer };
}

async function decorate(rows: (typeof events.$inferSelect)[], userId: string | null): Promise<FeedEvent[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const [rub, ints, counts, mine, myInterests] = await Promise.all([
    db.select().from(eventRubrics).where(inArray(eventRubrics.eventId, ids)),
    db.select({ eventId: eventInterests.eventId, slug: eventInterests.interestSlug }).from(eventInterests).where(inArray(eventInterests.eventId, ids)),
    db.select({ eventId: going.eventId, n: count() }).from(going).where(inArray(going.eventId, ids)).groupBy(going.eventId),
    userId ? db.select({ eventId: going.eventId }).from(going).where(and(eq(going.userId, userId), inArray(going.eventId, ids))) : Promise.resolve([]),
    userId
      ? db.select({ slug: interests.slug, name: interests.name }).from(userInterests).innerJoin(interests, eq(interests.slug, userInterests.interestSlug)).where(eq(userInterests.userId, userId))
      : Promise.resolve([] as { slug: string; name: string }[]),
  ]);
  const mineSet = new Set(mine.map((m) => m.eventId));
  const liked = new Map(myInterests.map((i) => [i.slug, i.name]));
  return rows.map((r) => {
    const matched = ints.filter((i) => i.eventId === r.id && liked.has(i.slug)).map((i) => liked.get(i.slug)!);
    return {
      id: r.id,
      title: r.title,
      description: r.description,
      startsAt: r.startsAt,
      city: r.city,
      venue: r.venue,
      address: r.address,
      capacity: r.capacity,
      priceFrom: r.priceFrom,
      hook: r.hook,
      coverUrl: r.coverUrl,
      featured: r.featured,
      rubrics: rub.filter((x) => x.eventId === r.id).map((x) => x.rubricSlug),
      goingCount: counts.find((c) => c.eventId === r.id)?.n ?? 0,
      isGoing: mineSet.has(r.id),
      why: matched.length ? `Бо ти обрала «${matched[0]}»` : null,
      score: matched.length,
    };
  });
}

/** Personal order: matching interests first, then by date. Stable for anonymous users. */
export function rankForUser(list: FeedEvent[]) {
  return [...list].sort((a, b) => b.score - a.score || a.startsAt.getTime() - b.startsAt.getTime());
}

/** «Крок назовні»: an upcoming event from a rubric the user hasn't chosen yet. */
export async function stepOutside(userId: string) {
  const mine = await db
    .selectDistinct({ rubric: interests.rubricSlug })
    .from(userInterests)
    .innerJoin(interests, eq(interests.slug, userInterests.interestSlug))
    .where(eq(userInterests.userId, userId));
  const chosen = mine.map((m) => m.rubric).filter(Boolean) as string[];
  if (chosen.length === 0) return null;
  const candidates = await listEvents({ userId, limit: 40 });
  return candidates.find((e) => !e.isGoing && e.rubrics.filter((r) => r !== 'weekend').every((r) => !chosen.includes(r)) && e.rubrics.length > 0) ?? null;
}

export async function myGoing(userId: string) {
  const rows = await db
    .select({ e: events })
    .from(going)
    .innerJoin(events, eq(events.id, going.eventId))
    .where(eq(going.userId, userId))
    .orderBy(asc(events.startsAt));
  const decorated = await decorate(
    rows.map((r) => r.e),
    userId,
  );
  const now = Date.now();
  return {
    upcoming: decorated.filter((e) => e.startsAt.getTime() >= now),
    past: decorated.filter((e) => e.startsAt.getTime() < now).reverse(),
  };
}
