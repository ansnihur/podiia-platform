import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendRegistrationConfirmation } from '@/lib/email';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');

    const registrations = await prisma.registration.findMany({
      where: {
        ...(eventId ? { eventId } : {}),
        ...(session.user.role === 'PARTICIPANT' ? { userId: session.user.id } : {}),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        event: { select: { id: true, title: true, date: true, location: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(registrations);
  } catch (error) {
    console.error('[GET /api/registrations]', error);
    return NextResponse.json({ error: 'Failed to fetch registrations.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    // Guard against stale JWT after DB reseed — user ID may no longer exist
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return NextResponse.json(
        { error: 'Session expired. Please sign out and sign in again.' },
        { status: 401 },
      );
    }

    const { eventId } = await req.json();
    if (!eventId) return NextResponse.json({ error: 'eventId is required.' }, { status: 400 });

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { _count: { select: { registrations: true } } },
    });

    if (!event) return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
    if (event.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'This event is not accepting registrations.' }, { status: 400 });
    }
    if (new Date(event.date) < new Date()) {
      return NextResponse.json({ error: 'This event has already passed.' }, { status: 400 });
    }
    if (event._count.registrations >= event.capacity) {
      return NextResponse.json({ error: 'This event is fully booked.' }, { status: 400 });
    }

    const existing = await prisma.registration.findUnique({
      where: { userId_eventId: { userId: session.user.id, eventId } },
    });
    // Only block if registration is active — cancelled users may re-register
    if (existing && existing.status !== 'CANCELLED') {
      return NextResponse.json({ error: 'You are already registered for this event.' }, { status: 409 });
    }

    // Upsert: update existing cancelled record or create a new one
    const registration = existing
      ? await prisma.registration.update({
          where: { userId_eventId: { userId: session.user.id, eventId } },
          data: { status: 'CONFIRMED' },
        })
      : await prisma.registration.create({
          data: { userId: session.user.id, eventId, status: 'CONFIRMED' },
        });

    sendRegistrationConfirmation(
      { name: user.name, email: user.email },
      { title: event.title, date: event.date, location: event.location },
      eventId,
    ).catch((err) => console.error('[email] Failed to send confirmation:', err));

    return NextResponse.json(registration, { status: 201 });
  } catch (error) {
    console.error('[POST /api/registrations]', error);
    return NextResponse.json({ error: 'Failed to register.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');
    if (!eventId) return NextResponse.json({ error: 'eventId is required.' }, { status: 400 });

    const registration = await prisma.registration.findUnique({
      where: { userId_eventId: { userId: session.user.id, eventId } },
    });
    if (!registration) return NextResponse.json({ error: 'Registration not found.' }, { status: 404 });

    await prisma.registration.update({
      where: { userId_eventId: { userId: session.user.id, eventId } },
      data: { status: 'CANCELLED' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/registrations]', error);
    return NextResponse.json({ error: 'Failed to cancel registration.' }, { status: 500 });
  }
}
