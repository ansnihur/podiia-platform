CREATE TYPE "public"."application_status" AS ENUM('PENDING', 'NEEDS_INFO', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('DRAFT', 'PENDING_REVIEW', 'CHANGES_REQUESTED', 'PUBLISHED', 'REJECTED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."interaction_type" AS ENUM('VIEW', 'GOING', 'UNGOING', 'SAVE', 'SHARE');--> statement-breakpoint
CREATE TYPE "public"."moderation_action" AS ENUM('APPROVED', 'CHANGES_REQUESTED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."organizer_kind" AS ENUM('PERSON', 'COMMUNITY', 'COMPANY');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('PARTICIPANT', 'ORGANIZER', 'SPEAKER', 'ADMIN');--> statement-breakpoint
CREATE TABLE "event_interests" (
	"event_id" text NOT NULL,
	"interest_slug" text NOT NULL,
	CONSTRAINT "event_interests_event_id_interest_slug_pk" PRIMARY KEY("event_id","interest_slug")
);
--> statement-breakpoint
CREATE TABLE "event_rubrics" (
	"event_id" text NOT NULL,
	"rubric_slug" text NOT NULL,
	CONSTRAINT "event_rubrics_event_id_rubric_slug_pk" PRIMARY KEY("event_id","rubric_slug")
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone,
	"city" text NOT NULL,
	"venue" text NOT NULL,
	"address" text,
	"capacity" integer,
	"price_from" integer,
	"hook" text,
	"cover_url" text,
	"featured" boolean DEFAULT false NOT NULL,
	"status" "event_status" DEFAULT 'DRAFT' NOT NULL,
	"organizer_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "going" (
	"user_id" text NOT NULL,
	"event_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "going_user_id_event_id_pk" PRIMARY KEY("user_id","event_id")
);
--> statement-breakpoint
CREATE TABLE "interactions" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "interaction_type" NOT NULL,
	"user_id" text,
	"event_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interests" (
	"slug" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"rubric_slug" text
);
--> statement-breakpoint
CREATE TABLE "moderation_log" (
	"id" text PRIMARY KEY NOT NULL,
	"action" "moderation_action" NOT NULL,
	"comment" text,
	"event_id" text NOT NULL,
	"admin_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_applications" (
	"id" text PRIMARY KEY NOT NULL,
	"role" "role" NOT NULL,
	"kind" "organizer_kind" DEFAULT 'PERSON' NOT NULL,
	"about" text NOT NULL,
	"links" text[] DEFAULT '{}' NOT NULL,
	"status" "application_status" DEFAULT 'PENDING' NOT NULL,
	"admin_note" text,
	"user_id" text NOT NULL,
	"decided_by_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"decided_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "rubrics" (
	"slug" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"symbol" text NOT NULL,
	"order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_interests" (
	"user_id" text NOT NULL,
	"interest_slug" text NOT NULL,
	CONSTRAINT "user_interests_user_id_interest_slug_pk" PRIMARY KEY("user_id","interest_slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"city" text,
	"roles" "role"[] DEFAULT '{"PARTICIPANT"}' NOT NULL,
	"onboarded" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "event_interests" ADD CONSTRAINT "event_interests_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_interests" ADD CONSTRAINT "event_interests_interest_slug_interests_slug_fk" FOREIGN KEY ("interest_slug") REFERENCES "public"."interests"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_rubrics" ADD CONSTRAINT "event_rubrics_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_rubrics" ADD CONSTRAINT "event_rubrics_rubric_slug_rubrics_slug_fk" FOREIGN KEY ("rubric_slug") REFERENCES "public"."rubrics"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_organizer_id_users_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "going" ADD CONSTRAINT "going_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "going" ADD CONSTRAINT "going_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interests" ADD CONSTRAINT "interests_rubric_slug_rubrics_slug_fk" FOREIGN KEY ("rubric_slug") REFERENCES "public"."rubrics"("slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_log" ADD CONSTRAINT "moderation_log_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_log" ADD CONSTRAINT "moderation_log_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_applications" ADD CONSTRAINT "role_applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_applications" ADD CONSTRAINT "role_applications_decided_by_id_users_id_fk" FOREIGN KEY ("decided_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_interests" ADD CONSTRAINT "user_interests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_interests" ADD CONSTRAINT "user_interests_interest_slug_interests_slug_fk" FOREIGN KEY ("interest_slug") REFERENCES "public"."interests"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "events_status_starts_idx" ON "events" USING btree ("status","starts_at");--> statement-breakpoint
CREATE INDEX "events_city_idx" ON "events" USING btree ("city","status","starts_at");--> statement-breakpoint
CREATE INDEX "going_event_idx" ON "going" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "interactions_user_idx" ON "interactions" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "interactions_event_idx" ON "interactions" USING btree ("event_id","type");--> statement-breakpoint
CREATE INDEX "moderation_event_idx" ON "moderation_log" USING btree ("event_id","created_at");--> statement-breakpoint
CREATE INDEX "applications_status_idx" ON "role_applications" USING btree ("status","created_at");