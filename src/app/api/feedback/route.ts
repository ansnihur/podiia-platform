import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const { eventId, rating, comment } = await req.json();

    if (!eventId || !rating) {
      return NextResponse.json({ error: 'eventId and rating are required.' }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5.' }, { status: 400 });
    }

    // Check user attended (was registered)
    const registration = await prisma.registration.findUnique({
      where: { userId_eventId: { userId: session.user.id, eventId } },
    });
    if (!registration || registration.status === 'CANCELLED') {
      return NextResponse.json({ error: 'You must be registered for this event to leave feedback.' }, { status: 403 });
    }

    const existing = await prisma.feedback.findUnique({
      where: { userId_eventId: { userId: session.user.id, eventId } },
    });
    if (existing) {
      return NextResponse.json({ error: 'You have already submitted feedback for this event.' }, { status: 409 });
    }

    const feedback = await prisma.feedback.create({
      data: {
        userId: session.user.id,
        eventId,
        rating: parseInt(String(rating)),
        comment: comment?.trim() ?? null,
      },
    });

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error('[POST /api/feedback]', error);
    return NextResponse.json({ error: 'Failed to submit feedback.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  await prisma.feedback.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');

    const feedbacks = await prisma.feedback.findMany({
      where: eventId ? { eventId } : {},
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error('[GET /api/feedback]', error);
    return NextResponse.json({ error: 'Failed to fetch feedback.' }, { status: 500 });
  }
}
