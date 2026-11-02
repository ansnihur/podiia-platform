import 'server-only';
import { cache } from 'react';
import { getServerSession } from 'next-auth';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { authOptions } from './auth';
import { db, schema } from '@/db';
import type { Role } from '@/db/schema';

/** Fresh user from the DB (roles can change after login, e.g. when an application is approved). */
export const getCurrentUser = cache(async () => {
  const session = await getServerSession(authOptions);
  const id = session?.user?.id;
  if (!id) return null;
  const user = await db.query.users.findFirst({ where: eq(schema.users.id, id) });
  return user ?? null;
});

export async function requireUser(next = '/') {
  const user = await getCurrentUser();
  if (!user) redirect(`/auth/login?next=${encodeURIComponent(next)}`);
  return user;
}

export const hasRole = (user: { roles: Role[] } | null, role: Role) => !!user?.roles.includes(role);
