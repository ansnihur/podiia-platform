/**
 * Podїa — data model v2 (startup).
 * The thesis version lives on branch `v1` / tag `v1.0-thesis` with its own database.
 */
import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

const id = () =>
  text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());
const createdAt = () => timestamp('created_at', { withTimezone: true }).notNull().defaultNow();

export const roleEnum = pgEnum('role', ['PARTICIPANT', 'ORGANIZER', 'SPEAKER', 'ADMIN']);
/** Every event is moderated before anyone sees it. */
export const eventStatusEnum = pgEnum('event_status', [
  'DRAFT',
  'PENDING_REVIEW',
  'CHANGES_REQUESTED',
  'PUBLISHED',
  'REJECTED',
  'CANCELLED',
]);
export const applicationStatusEnum = pgEnum('application_status', ['PENDING', 'NEEDS_INFO', 'APPROVED', 'REJECTED']);
export const organizerKindEnum = pgEnum('organizer_kind', ['PERSON', 'COMMUNITY', 'COMPANY']);
export const moderationActionEnum = pgEnum('moderation_action', ['APPROVED', 'CHANGES_REQUESTED', 'REJECTED']);
/** Signals for recommendations — logged from day one, used later. */
export const interactionTypeEnum = pgEnum('interaction_type', ['VIEW', 'GOING', 'UNGOING', 'SAVE', 'SHARE']);

export type Role = (typeof roleEnum.enumValues)[number];
export type EventStatus = (typeof eventStatusEnum.enumValues)[number];

export const users = pgTable('users', {
  id: id(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  city: text('city'),
  roles: roleEnum('roles').array().notNull().default(['PARTICIPANT']),
  onboarded: boolean('onboarded').notNull().default(false),
  createdAt: createdAt(),
});

/** Mood rubrics: Для розуму, Для душі, Гуртом, Руками, На вихідні. */
export const rubrics = pgTable('rubrics', {
  slug: text('slug').primaryKey(),
  name: text('name').notNull(),
  symbol: text('symbol').notNull(),
  order: integer('order').notNull(),
});

/** Concrete interests picked at sign-up ("Книжки", "IT і нетворкінг"…). */
export const interests = pgTable('interests', {
  slug: text('slug').primaryKey(),
  name: text('name').notNull(),
  rubricSlug: text('rubric_slug').references(() => rubrics.slug),
});

export const userInterests = pgTable(
  'user_interests',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    interestSlug: text('interest_slug')
      .notNull()
      .references(() => interests.slug, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.userId, t.interestSlug] })],
);

export const events = pgTable(
  'events',
  {
    id: id(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
    endsAt: timestamp('ends_at', { withTimezone: true }),
    city: text('city').notNull(),
    venue: text('venue').notNull(),
    address: text('address'),
    /** null = no limit */
    capacity: integer('capacity'),
    /** Price in kopecks; null = free. Paid tickets come in a later stage. */
    priceFrom: integer('price_from'),
    /** Short human hook: "віники й чай з нас", "можна прийти самому". */
    hook: text('hook'),
    coverUrl: text('cover_url'),
    featured: boolean('featured').notNull().default(false),
    status: eventStatusEnum('status').notNull().default('DRAFT'),
    organizerId: text('organizer_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: createdAt(),
    publishedAt: timestamp('published_at', { withTimezone: true }),
  },
  (t) => [index('events_status_starts_idx').on(t.status, t.startsAt), index('events_city_idx').on(t.city, t.status, t.startsAt)],
);

export const eventRubrics = pgTable(
  'event_rubrics',
  {
    eventId: text('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    rubricSlug: text('rubric_slug')
      .notNull()
      .references(() => rubrics.slug, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.eventId, t.rubricSlug] })],
);

export const eventInterests = pgTable(
  'event_interests',
  {
    eventId: text('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    interestSlug: text('interest_slug')
      .notNull()
      .references(() => interests.slug, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.eventId, t.interestSlug] })],
);

/** «Іду» — a free registration. Paid tickets will extend this later. */
export const going = pgTable(
  'going',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    eventId: text('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.eventId] }), index('going_event_idx').on(t.eventId)],
);

export const interactions = pgTable(
  'interactions',
  {
    id: id(),
    type: interactionTypeEnum('type').notNull(),
    userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
    eventId: text('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    createdAt: createdAt(),
  },
  (t) => [index('interactions_user_idx').on(t.userId, t.createdAt), index('interactions_event_idx').on(t.eventId, t.type)],
);

/** Anyone can apply to become an organizer or speaker; the admin decides. */
export const roleApplications = pgTable(
  'role_applications',
  {
    id: id(),
    role: roleEnum('role').notNull(),
    kind: organizerKindEnum('kind').notNull().default('PERSON'),
    about: text('about').notNull(),
    links: text('links').array().notNull().default([]),
    status: applicationStatusEnum('status').notNull().default('PENDING'),
    adminNote: text('admin_note'),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    decidedById: text('decided_by_id').references(() => users.id, { onDelete: 'set null' }),
    createdAt: createdAt(),
    decidedAt: timestamp('decided_at', { withTimezone: true }),
  },
  (t) => [index('applications_status_idx').on(t.status, t.createdAt)],
);

export const moderationLog = pgTable(
  'moderation_log',
  {
    id: id(),
    action: moderationActionEnum('action').notNull(),
    comment: text('comment'),
    eventId: text('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    adminId: text('admin_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: createdAt(),
  },
  (t) => [index('moderation_event_idx').on(t.eventId, t.createdAt)],
);

// ---------- relations (for db.query.* with `with`)
export const usersRelations = relations(users, ({ many }) => ({
  interests: many(userInterests),
  organizedEvents: many(events),
  going: many(going),
}));
export const rubricsRelations = relations(rubrics, ({ many }) => ({ interests: many(interests), events: many(eventRubrics) }));
export const interestsRelations = relations(interests, ({ one, many }) => ({
  rubric: one(rubrics, { fields: [interests.rubricSlug], references: [rubrics.slug] }),
  users: many(userInterests),
}));
export const userInterestsRelations = relations(userInterests, ({ one }) => ({
  user: one(users, { fields: [userInterests.userId], references: [users.id] }),
  interest: one(interests, { fields: [userInterests.interestSlug], references: [interests.slug] }),
}));
export const eventsRelations = relations(events, ({ one, many }) => ({
  organizer: one(users, { fields: [events.organizerId], references: [users.id] }),
  rubrics: many(eventRubrics),
  interests: many(eventInterests),
  going: many(going),
  moderation: many(moderationLog),
}));
export const eventRubricsRelations = relations(eventRubrics, ({ one }) => ({
  event: one(events, { fields: [eventRubrics.eventId], references: [events.id] }),
  rubric: one(rubrics, { fields: [eventRubrics.rubricSlug], references: [rubrics.slug] }),
}));
export const eventInterestsRelations = relations(eventInterests, ({ one }) => ({
  event: one(events, { fields: [eventInterests.eventId], references: [events.id] }),
  interest: one(interests, { fields: [eventInterests.interestSlug], references: [interests.slug] }),
}));
export const goingRelations = relations(going, ({ one }) => ({
  user: one(users, { fields: [going.userId], references: [users.id] }),
  event: one(events, { fields: [going.eventId], references: [events.id] }),
}));
export const moderationLogRelations = relations(moderationLog, ({ one }) => ({
  event: one(events, { fields: [moderationLog.eventId], references: [events.id] }),
  admin: one(users, { fields: [moderationLog.adminId], references: [users.id] }),
}));
