import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    if (!['ORGANIZER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }
    const eventId = new URL(req.url).searchParams.get('eventId');
    if (!eventId) return NextResponse.json({ error: 'eventId required.' }, { status: 400 });

    const speakers = await prisma.speaker.findMany({
      where: { eventId },
      include: { user: { select: { id: true, name: true, email: true } }, materials: true },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(speakers);
  } catch (error) {
    console.error('[GET /api/speakers]', error);
    return NextResponse.json({ error: 'Failed to fetch speakers.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    if (!['ORGANIZER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Only organizers can add speakers.' }, { status: 403 });
    }

    const { eventId, userId, topic, bio } = await req.json();
    if (!eventId || !userId || !topic || !bio) {
      return NextResponse.json({ error: 'eventId, userId, topic, and bio are required.' }, { status: 400 });
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return NextResponse.json({ error: 'Event not found.' }, { status: 404 });

    const isOwner = event.organizerId === session.user.id;
    if (!isOwner && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const speaker = await prisma.speaker.create({
      data: { eventId, userId, topic: topic.trim(), bio: bio.trim() },
      include: { user: { select: { name: true, email: true } } },
    });

    return NextResponse.json(speaker, { status: 201 });
  } catch (error) {
    console.error('[POST /api/speakers]', error);
    return NextResponse.json({ error: 'Failed to add speaker.' }, { status: 500 });
  }
}
