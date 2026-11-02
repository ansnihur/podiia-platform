import './load-env';
/**
 * Seeds rubrics, interests, the admin account and a handful of demo events.
 * Safe to re-run: reference data is upserted, demo events are only created once.
 *
 *   SEED_ADMIN_EMAIL=you@example.com SEED_ADMIN_PASSWORD=... npm run db:seed
 */
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { rubrics as brandRubrics } from '@podiia/brand';
import * as s from './schema';
import { rubricsForEvent } from '../lib/rubrics';

const INTERESTS: { slug: string; name: string; rubric: string }[] = [
  { slug: 'science', name: 'Наука й лекції', rubric: 'mind' },
  { slug: 'it', name: 'IT і нетворкінг', rubric: 'mind' },
  { slug: 'career', name: 'Кар’єра', rubric: 'mind' },
  { slug: 'languages', name: 'Мови', rubric: 'mind' },
  { slug: 'books', name: 'Книжки', rubric: 'soul' },
  { slug: 'cinema-theatre', name: 'Кіно й театр', rubric: 'soul' },
  { slug: 'art', name: 'Мистецтво', rubric: 'soul' },
  { slug: 'music', name: 'Музика', rubric: 'soul' },
  { slug: 'gatherings', name: 'Посиденьки й вечірки', rubric: 'group' },
  { slug: 'food', name: 'Їжа й дегустації', rubric: 'group' },
  { slug: 'board-games', name: 'Настолки', rubric: 'group' },
  { slug: 'banya', name: 'Баня й відпочинок', rubric: 'group' },
  { slug: 'movement', name: 'Тіло й рух', rubric: 'hands' },
  { slug: 'workshops', name: 'Майстер-класи', rubric: 'hands' },
  { slug: 'hackathons', name: 'Хакатони', rubric: 'hands' },
  { slug: 'running', name: 'Спорт і забіги', rubric: 'hands' },
];

function inDays(days: number, hour: number, minute = 0) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  d.setUTCHours(hour - 2, minute, 0, 0); // Kyiv is UTC+2 in winter
  return d;
}

const DEMO = [
  { title: 'Культурний фестиваль студентів КНЕУ', description: 'Музика, театр, ярмарок і майстер-класи від студентських спільнот. Приходь із друзями або сам — тут легко знайти своїх.', days: 3, hour: 13, venue: 'КНЕУ', address: 'просп. Берестейський, 54/1', capacity: 1500, interests: ['music', 'art', 'gatherings'], featured: true, hook: 'вхід вільний' },
  { title: 'Банний вечір: пара й чай', description: 'Невелика компанія, справжня баня на дровах, трав’яний чай і довгі розмови.', days: 5, hour: 18, venue: '[Баня на Подолі]', capacity: 8, interests: ['banya', 'gatherings'], hook: 'віники й чай з нас' },
  { title: 'Англійський розмовний клуб', description: 'Говоримо англійською на легкі теми в кав’ярні. Рівень B1+, ведуча допомагає з помилками.', days: 9, hour: 19, venue: '[Кав’ярня]', capacity: 12, interests: ['languages'], hook: 'можна прийти самому' },
  { title: 'Ранковий стретчинг у балетній залі', description: 'Мʼяке розтягування біля балетного станка. Підходить для будь-якого рівня.', days: 6, hour: 9, venue: '[Студія]', capacity: 15, interests: ['movement'], hook: 'можна прийти самому' },
  { title: 'Hackathon: EdTech Solutions', description: '24 години, команди до 5 людей, ментори й призи. Будуємо інструменти для освіти.', days: 18, hour: 10, venue: 'Unit.City', address: 'вул. Дорогожицька, 3', capacity: 120, interests: ['hackathons', 'it'], hook: 'команди до 5' },
  { title: 'Книжковий клуб: обговорення', description: 'Обговорюємо книжку місяця за чаєм. Можна не дочитати — головне, щоб було цікаво.', days: 4, hour: 19, venue: '[Бар-бібліотека]', capacity: 12, interests: ['books'], hook: 'чай і печиво' },
  { title: 'Вечір настолок', description: 'Від «Каркасона» до «Кодових імен». Пояснимо правила, знайдемо команду.', days: 11, hour: 18, venue: '[Антикафе]', capacity: 24, interests: ['board-games', 'gatherings'], hook: 'можна прийти самому' },
];

async function main() {
  const client = postgres(process.env.DATABASE_URL!, { max: 1 });
  const db = drizzle(client, { schema: s });

  for (const r of brandRubrics) {
    await db.insert(s.rubrics).values(r).onConflictDoUpdate({ target: s.rubrics.slug, set: { name: r.name, symbol: r.symbol, order: r.order } });
  }
  for (const i of INTERESTS) {
    await db
      .insert(s.interests)
      .values({ slug: i.slug, name: i.name, rubricSlug: i.rubric })
      .onConflictDoUpdate({ target: s.interests.slug, set: { name: i.name, rubricSlug: i.rubric } });
  }

  const email = (process.env.SEED_ADMIN_EMAIL ?? 'admin@podiia.local').toLowerCase();
  let admin = await db.query.users.findFirst({ where: eq(s.users.email, email) });
  if (!admin) {
    const password = process.env.SEED_ADMIN_PASSWORD ?? crypto.randomUUID().slice(0, 12);
    [admin] = await db
      .insert(s.users)
      .values({ name: 'Анастасія', email, passwordHash: bcrypt.hashSync(password, 10), city: 'Київ', roles: ['PARTICIPANT', 'ORGANIZER', 'ADMIN'], onboarded: true })
      .returning();
    if (!process.env.SEED_ADMIN_PASSWORD) console.log(`Admin created: ${email} / ${password}  (change it after first login)`);
  }

  const existing = await db.query.events.findFirst();
  if (!existing) {
    for (const e of DEMO) {
      const startsAt = inDays(e.days, e.hour);
      const [ev] = await db
        .insert(s.events)
        .values({ title: e.title, description: e.description, startsAt, city: 'Київ', venue: e.venue, address: e.address, capacity: e.capacity, hook: e.hook, featured: !!e.featured, status: 'PUBLISHED', publishedAt: new Date(), organizerId: admin.id })
        .returning();
      await db.insert(s.eventInterests).values(e.interests.map((slug) => ({ eventId: ev.id, interestSlug: slug })));
      const rubricSlugs = rubricsForEvent(e.interests.map((slug) => INTERESTS.find((i) => i.slug === slug)!.rubric), startsAt);
      await db.insert(s.eventRubrics).values(rubricSlugs.map((slug) => ({ eventId: ev.id, rubricSlug: slug })));
    }
    console.log(`Created ${DEMO.length} demo events`);
  }

  await client.end();
  console.log('Seed done');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
