import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface Params { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        organizer: { select: { name: true, email: true } },
        speakers: { include: { user: { select: { name: true } }, materials: true } },
        _count: { select: { registrations: { where: { status: 'CONFIRMED' } }, feedbacks: true } },
        feedbacks: { include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!event) return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
    return NextResponse.json(event);
  } catch (error) {
    console.error('[GET /api/events/:id]', error);
    return NextResponse.json({ error: 'Failed to fetch event.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const event = await prisma.event.findUnique({ where: { id: params.id } });
    if (!event) return NextResponse.json({ error: 'Event not found.' }, { status: 404 });

    const isOwner = event.organizerId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const body = await req.json();
    const allowedFields = ['title', 'description', 'date', 'location', 'capacity', 'tags', 'imageUrl', 'status'];
    const updateData: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = field === 'date' ? new Date(body[field]) : body[field];
      }
    }

    const updated = await prisma.event.update({
      where: { id: params.id },
      data: updateData,
      include: {
        organizer: { select: { name: true } },
        _count: { select: { registrations: { where: { status: 'CONFIRMED' } } } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PATCH /api/events/:id]', error);
    return NextResponse.json({ error: 'Failed to update event.' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const event = await prisma.event.findUnique({ where: { id: params.id } });
    if (!event) return NextResponse.json({ error: 'Event not found.' }, { status: 404 });

    const isOwner = event.organizerId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    await prisma.event.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/events/:id]', error);
    return NextResponse.json({ error: 'Failed to delete event.' }, { status: 500 });
  }
}
