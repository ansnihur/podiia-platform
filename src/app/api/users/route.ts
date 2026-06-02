import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const roleFilter = new URL(req.url).searchParams.get('role');

    // ORGANIZER can only fetch the list of SPEAKER users (for adding to events)
    if (session.user.role === 'ORGANIZER') {
      if (roleFilter !== 'SPEAKER') {
        return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
      }
      const users = await prisma.user.findMany({
        where: { role: 'SPEAKER' },
        select: { id: true, name: true, email: true },
        orderBy: { name: 'asc' },
      });
      return NextResponse.json(users);
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const where = roleFilter ? { role: roleFilter as any } : {};
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { registrations: true, events: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('[GET /api/users]', error);
    return NextResponse.json({ error: 'Failed to fetch users.' }, { status: 500 });
  }
}
