'use server';
import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db, schema } from '@/db';
import { getCurrentUser } from '@/lib/session';

/** «Іду» toggle. Logs the signal for future recommendations. */
export async function toggleGoing(eventId: string): Promise<{ going: boolean } | { needLogin: true } | { error: string }> {
  const user = await getCurrentUser();
  if (!user) return { needLogin: true };
  const event = await db.query.events.findFirst({ where: eq(schema.events.id, eventId) });
  if (!event || event.status !== 'PUBLISHED') return { error: 'Подія недоступна' };

  const existing = await db.query.going.findFirst({ where: and(eq(schema.going.userId, user.id), eq(schema.going.eventId, eventId)) });
  if (existing) {
    await db.delete(schema.going).where(and(eq(schema.going.userId, user.id), eq(schema.going.eventId, eventId)));
    await db.insert(schema.interactions).values({ type: 'UNGOING', userId: user.id, eventId });
  } else {
    await db.insert(schema.going).values({ userId: user.id, eventId }).onConflictDoNothing();
    await db.insert(schema.interactions).values({ type: 'GOING', userId: user.id, eventId });
  }
  revalidatePath('/');
  revalidatePath(`/events/${eventId}`);
  revalidatePath('/my');
  return { going: !existing };
}
