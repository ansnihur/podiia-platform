import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface Params { params: { id: string } }

function transliterate(text: string): string {
  const map: Record<string, string> = {
    'а':'a','б':'b','в':'v','г':'h','ґ':'g','д':'d','е':'e','є':'ie',
    'ж':'zh','з':'z','и':'y','і':'i','ї':'yi','й':'i','к':'k','л':'l',
    'м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u',
    'ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh','щ':'shch','ь':'',
    'ю':'yu','я':'ya','ё':'yo','э':'e','ъ':'','ы':'y',
    ' ':'_',
  };
  return text.toLowerCase().split('').map(c => map[c] ?? c).join('').replace(/[^a-z0-9_]/g, '').slice(0, 50);
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const isAdmin = session.user.role === 'ADMIN';
    const isOrganizer = session.user.role === 'ORGANIZER';
    if (!isAdmin && !isOrganizer) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const event = await prisma.event.findUnique({ where: { id: params.id } });
    if (!event) return NextResponse.json({ error: 'Event not found.' }, { status: 404 });

    if (!isAdmin && event.organizerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const registrations = await prisma.registration.findMany({
      where: { eventId: params.id, status: 'CONFIRMED' },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    });

    const rows = registrations.map((r) => {
      const name = `"${(r.user.name ?? '').replace(/"/g, '""')}"`;
      const email = `"${(r.user.email ?? '').replace(/"/g, '""')}"`;
      const date = r.createdAt.toISOString().replace('T', ' ').slice(0, 19);
      return `${name},${email},${r.status},${date}`;
    });

    const BOM = '﻿';
    const csv = BOM + 'Імʼя,Email,Статус,Дата реєстрації\n' + rows.join('\n');

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${transliterate(event.title)}_participants.csv"`,
      },
    });
  } catch (error) {
    console.error('[GET /api/events/:id/export]', error);
    return NextResponse.json({ error: 'Failed to export participants.' }, { status: 500 });
  }
}
