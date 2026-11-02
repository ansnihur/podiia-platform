# Podїa — контекст для Claude

Podїa — платформа всіх подій міста, від бані з друзями до IT Arena. Веб зараз, мобільний застосунок (Expo) пізніше. Авторка й адмін — Анастасія. Відповідай українською.

## Гілки
- `v1` і тег `v1.0-thesis` — дипломна версія. Її показує podiia-platform.vercel.app. **Не змінювати.**
- `rebuild` — нова версія. Зливається в `main` через PR.

## Структура
- `apps/web` — Next.js 14 (App Router), TypeScript, Tailwind, NextAuth (credentials), Drizzle ORM + Postgres.
  - `src/db/schema.ts` — схема: users (ролі PARTICIPANT/ORGANIZER/SPEAKER/ADMIN), rubrics, interests, events (статус модерації), going («Іду»), interactions (журнал для рекомендацій), roleApplications, moderationLog.
  - `src/app` — сторінки: `/`, `/events/[id]`, `/auth/login`, `/auth/register`, `/welcome` (вподобання), `/my`.
  - `src/components` — brand (SpiralMark, Wordmark, Logo), cover, event-card, going-button, rubric-icon.
- `packages/brand` — токени дизайну, спільні для вебу й застосунку: кольори, рубрики, `SPIRAL_PATH`, кольори обкладинок.

## Запуск
```
docker compose up -d                      # локальна Postgres
cp apps/web/.env.example apps/web/.env
npm install
npm run db:migrate && npm run db:seed     # сід друкує логін адміна
npm run dev                               # http://localhost:3000
```
Перед комітом: `npm run typecheck -w @podiia/web` і `npm run build`.
Зміна схеми: правиш `schema.ts` → `npm run db:generate -w @podiia/web` → `npm run db:migrate`.

## Дизайн-система v3 «Трипільська спіраль»
- Шрифти: Unbounded (`font-display`, заголовки), Onest (текст). Інших не додавати.
- Кольори лише з `@podiia/brand` / Tailwind: light #F3F3F1 (фон, без крему), ground #2A0E10 (темні блоки), carmine #C8241B (бренд і тільки дія «Іду»), ink #1A1414, stone #E7E6E3, petal #F7B49A, muted #5A5350.
- Знак — S-спіраль на карміновому колі. Ніяких свастик чи коловратів, навіть «м’яких».
- Форми округлі: кнопки `rounded-full`, картки `rounded-card` (24px). Без жорстких тіней.
- Орнамент один раз на екран, як акцент. Решта — чистий інтерфейс.
- Рубрики: Для розуму, Для душі, Гуртом, Руками, На вихідні (автоматично для Сб/Нд).
- Голос: на «ти», тепло, без канцеляриту й тиску («Тут поки тихо — закрутимо щось?»).
- Доступність: контраст AA, цілі натискання ≥ 44px, `aria-*` на інтерактивних елементах.

## Продукт
- Учасники завжди безкоштовно. Організатори й спікери — за заявкою, адмін підтверджує. Кожна подія проходить модерацію.
- Оплати (квитки, тарифи організаторів) — пізніше, через український провайдер. Поки лише безкоштовні події.

## Наступні кроки
1. Кабінет організатора: заявка на роль, створення події, статус модерації.
2. Адмінка: черга модерації, заявки на ролі.
3. Деплой нової версії: окремий Vercel-проєкт або Root Directory `apps/web`, нова база Neon.
4. Рекомендації за вподобаннями + журналом взаємодій. «Твоя спіраль».
