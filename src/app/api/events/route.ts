import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') ?? undefined;
    const tag = searchParams.get('tag') ?? undefined;
    const status = searchParams.get('status') ?? undefined;

    const events = await prisma.event.findMany({
      where: {
        ...(status ? { status: status as 'PUBLISHED' | 'DRAFT' | 'CANCELLED' | 'COMPLETED' } : {}),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { location: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(tag && { tags: { has: tag } }),
      },
      include: {
        organizer: { select: { name: true, email: true } },
        _count: { select: { registrations: { where: { status: 'CONFIRMED' } } } },
      },
      orderBy: { date: 'asc' },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('[GET /api/events]', error);
    return NextResponse.json({ error: 'Failed to fetch events.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    if (!['ORGANIZER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Only organizers can create events.' }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, date, location, capacity, tags, imageUrl } = body;

    if (!title || !description || !date || !location) {
      return NextResponse.json({ error: 'Title, description, date, and location are required.' }, { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        date: new Date(date),
        location: location.trim(),
        capacity: capacity ?? 100,
        tags: Array.isArray(tags) ? tags : [],
        imageUrl: imageUrl ?? null,
        status: 'DRAFT',
        organizerId: session.user.id,
      },
      include: {
        organizer: { select: { name: true } },
        _count: { select: { registrations: { where: { status: 'CONFIRMED' } } } },
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('[POST /api/events]', error);
    return NextResponse.json({ error: 'Failed to create event.' }, { status: 500 });
  }
}
