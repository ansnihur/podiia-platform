'use server';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db, schema } from '@/db';
import { getCurrentUser } from '@/lib/session';

const RegisterSchema = z.object({
  name: z.string().trim().min(2, 'Як до тебе звертатися? Мінімум 2 літери').max(60),
  email: z.string().trim().toLowerCase().email('Перевір email'),
  password: z.string().min(8, 'Пароль — щонайменше 8 символів').max(100),
});

export async function register(_: unknown, form: FormData): Promise<{ error?: string; ok?: boolean }> {
  const parsed = RegisterSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { name, email, password } = parsed.data;
  const exists = await db.query.users.findFirst({ where: eq(schema.users.email, email) });
  if (exists) return { error: 'Цей email уже зареєстрований. Спробуй увійти.' };
  await db.insert(schema.users).values({ name, email, passwordHash: await bcrypt.hash(password, 10) });
  return { ok: true };
}

const OnboardingSchema = z.object({
  city: z.string().trim().min(2).max(60),
  interests: z.array(z.string()).max(30),
});

export async function saveOnboarding(form: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login?next=/welcome');
  const parsed = OnboardingSchema.safeParse({ city: form.get('city'), interests: form.getAll('interests') });
  if (!parsed.success) redirect('/welcome?error=1');
  const { city, interests } = parsed.data;
  const known = new Set((await db.select({ slug: schema.interests.slug }).from(schema.interests)).map((i) => i.slug));
  const chosen = interests.filter((s) => known.has(s));
  await db.transaction(async (tx) => {
    await tx.update(schema.users).set({ city, onboarded: true }).where(eq(schema.users.id, user.id));
    await tx.delete(schema.userInterests).where(eq(schema.userInterests.userId, user.id));
    if (chosen.length) await tx.insert(schema.userInterests).values(chosen.map((interestSlug) => ({ userId: user.id, interestSlug })));
  });
  revalidatePath('/');
  redirect('/');
}
