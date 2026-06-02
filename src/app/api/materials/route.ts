import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const { speakerId, eventId, title, fileUrl } = await req.json();
    if (!speakerId || !eventId || !title || !fileUrl) {
      return NextResponse.json({ error: 'speakerId, eventId, title, and fileUrl are required.' }, { status: 400 });
    }

    const speaker = await prisma.speaker.findUnique({ where: { id: speakerId } });
    if (!speaker || speaker.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const material = await prisma.material.create({
      data: { speakerId, eventId, title: title.trim(), fileUrl: fileUrl.trim() },
    });

    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    console.error('[POST /api/materials]', error);
    return NextResponse.json({ error: 'Failed to add material.' }, { status: 500 });
  }
}
