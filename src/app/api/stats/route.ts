import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [eventsCount, usersCount, registrationsCount] = await Promise.all([
      prisma.event.count({ where: { status: 'PUBLISHED' } }),
      prisma.user.count(),
      prisma.registration.count({
        where: {
          status: 'CONFIRMED',
          event: { date: { gte: new Date() } },
        },
      }),
    ]);
    return NextResponse.json({ eventsCount, usersCount, registrationsCount });
  } catch {
    return NextResponse.json({ eventsCount: 0, usersCount: 0, registrationsCount: 0 });
  }
}
