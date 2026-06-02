<div align="center">

<img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" />
<img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" />
<img src="https://img.shields.io/badge/Prisma-5-2D3748?style=for-the-badge&logo=prisma" />
<img src="https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql" />
<img src="https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css" />
<img src="https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel" />

# Podiia Platform

**Web platform for organizing social and academic events**

A unified environment for organizers, speakers, and participants — covering the full event lifecycle from registration to post-event analytics.

[Live Demo](https://podiia-platform.vercel.app) &nbsp;·&nbsp; [Report a Bug](https://github.com/ansnihur/podiia-platform/issues) &nbsp;·&nbsp; [Request Feature](https://github.com/ansnihur/podiia-platform/issues)

</div>

---

## Overview

Podiia is a full-stack web platform built with Next.js 14 that centralizes the organization of social, educational, and scientific events. It replaces fragmented tools (Google Forms, spreadsheets, email chains) with a single, role-aware system that serves participants, speakers, organizers, and administrators.

> Developed as a Bachelor's qualification project at Kyiv National Economic University (KNEU), 2026.

---

## Features

### Participants
- Browse and filter events by tags and search
- One-click registration with instant confirmation
- Personal dashboard with upcoming and past events
- View full event program and speaker materials
- Submit ratings and reviews after events

### Speakers
- Personal speaker dashboard
- Upload presentation materials and abstracts
- View assigned sessions and event details

### Organizers
- Create and manage events (draft → published → completed)
- Build event programs with sections and talks
- Manage speakers and their materials
- Export participant lists as CSV
- Analytics dashboard: registration trends, ratings, attendance

### Administrators
- Full admin panel with user and role management
- Event moderation and status control
- Feedback moderation

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS, Radix UI |
| Database | PostgreSQL 16 (Neon) |
| ORM | Prisma 5 |
| Authentication | NextAuth.js v4 (Credentials) |
| Deployment | Vercel |
| Icons | Lucide React |

---

## Project Structure

```
podiia-platform/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # Registration endpoint
│   │   │   ├── events/        # Event CRUD + CSV export
│   │   │   ├── registrations/ # Register / cancel
│   │   │   ├── speakers/      # Speaker management
│   │   │   ├── materials/     # Speaker materials
│   │   │   ├── feedback/      # Reviews and ratings
│   │   │   ├── profile/       # Profile updates
│   │   │   └── stats/         # Analytics data
│   │   ├── auth/              # Login and register pages
│   │   ├── dashboard/         # Organizer dashboard
│   │   ├── events/[id]/       # Event detail pages
│   │   ├── speaker/           # Speaker dashboard
│   │   ├── admin/             # Admin panel
│   │   ├── profile/           # User profile
│   │   └── my-events/         # My registrations
│   ├── components/            # Shared UI components
│   ├── lib/                   # Prisma, auth, utilities
│   ├── contexts/              # Language context (i18n)
│   └── types/                 # TypeScript type extensions
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Sample data
├── docker-compose.yml
└── Dockerfile
```

---

## Database Schema

```
User          — id, name, email, password, role
Event         — id, title, description, date, location, capacity, status, tags, organizerId
Registration  — id, userId, eventId, status
Speaker       — id, userId, eventId, topic, bio
Material      — id, title, fileUrl, speakerId, eventId
Feedback      — id, userId, eventId, rating, comment
```

---

## Role Permissions

| Feature | Participant | Speaker | Organizer | Admin |
|---------|:-----------:|:-------:|:---------:|:-----:|
| Browse events | ✓ | ✓ | ✓ | ✓ |
| Register for events | ✓ | ✓ | ✓ | ✓ |
| Submit feedback | ✓ | ✓ | ✓ | ✓ |
| Submit materials | — | ✓ | ✓ | ✓ |
| Create events | — | — | ✓ | ✓ |
| Manage own events | — | — | ✓ | ✓ |
| Organizer dashboard | — | — | ✓ | ✓ |
| Publish / cancel events | — | — | ✓ | ✓ |
| Admin panel | — | — | — | ✓ |
| Manage all users | — | — | — | ✓ |

---

## API Endpoints

| Method | Path | Description | Access |
|--------|------|-------------|--------|
| GET | `/api/events` | List events with filters | Public |
| POST | `/api/events` | Create event | Organizer+ |
| GET | `/api/events/:id` | Event details | Public |
| PATCH | `/api/events/:id` | Update event | Owner / Admin |
| DELETE | `/api/events/:id` | Delete event | Owner / Admin |
| GET | `/api/events/:id/export` | Export participants CSV | Organizer+ |
| POST | `/api/registrations` | Register for event | Authenticated |
| DELETE | `/api/registrations` | Cancel registration | Authenticated |
| POST | `/api/feedback` | Submit feedback | Authenticated |
| POST | `/api/speakers` | Add speaker to event | Organizer+ |
| POST | `/api/materials` | Upload material | Speaker+ |
| GET | `/api/stats` | Platform statistics | Admin |
| PATCH | `/api/profile` | Update profile | Authenticated |
| POST | `/api/auth/register` | Create account | Public |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or a free [Neon](https://neon.tech) account)

### Installation

```bash
# Clone the repository
git clone https://github.com/ansnihur/podiia-platform.git
cd podiia-platform

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database URL and NextAuth secret

# Push schema to database
npx prisma db push

# Seed with sample data
npx prisma db seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Docker

```bash
# Start PostgreSQL + app
docker-compose up -d

# First-time setup
docker-compose exec app npx prisma db push
docker-compose exec app npx prisma db seed
```

---

## Environment Variables

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# NextAuth (generate secret with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@events.dev | admin123 |
| Organizer | organizer@events.dev | organizer123 |
| Speaker | speaker@events.dev | speaker123 |
| Participant | participant@events.dev | participant123 |

---

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:push      # Sync Prisma schema to database
npm run db:seed      # Seed sample data
npm run db:studio    # Open Prisma Studio
```

---

## Internationalization

The platform supports **English** and **Ukrainian**. The language switcher is available in the navigation bar and persists across sessions.

---

## Deployment

The project is configured for one-click deployment on Vercel.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ansnihur/podiia-platform)

Add the following environment variables in your Vercel project settings:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

---

## License

MIT © [Anastasiia Snihur](https://github.com/ansnihur), 2026

---

<div align="center">
Made in Ukraine
</div>