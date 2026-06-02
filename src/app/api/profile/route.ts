import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const body = await req.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    if (!name) {
      return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
    }
    if (name.length > 60) {
      return NextResponse.json({ error: 'Name is too long.' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { name },
      select: { id: true, name: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PATCH /api/profile]', error);
    return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 });
  }
}
