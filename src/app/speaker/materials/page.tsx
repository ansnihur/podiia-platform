import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatShortDate } from '@/lib/utils';
import { getT, getLocale } from '@/lib/get-translations';
import { Mic, FileText, CalendarDays, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { AddMaterialForm } from './add-material-form';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Speaker Materials' };
export const dynamic = 'force-dynamic';

export default async function SpeakerMaterialsPage() {
  const session = await getServerSession(authOptions);
  const t = getT();
  const locale = getLocale();
  const isSpeaker =session?.user.role === 'SPEAKER' || session?.user.role === 'ORGANIZER' || session?.user.role === 'ADMIN';

  if (!session || !isSpeaker) {
    return (
      <div className="ua-bg min-h-screen flex items-center justify-center px-4">
        <div className="ua-card w-full max-w-md p-8 text-center space-y-5">
          <div className="h-16 w-16 rounded-2xl bg-[#FFFDE7] flex items-center justify-center mx-auto">
            <Mic className="h-8 w-8 text-[#FFD84D]" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-[#111827] mb-2">{t.speaker_title}</h1>
            <p className="text-sm text-[#6B7280] leading-relaxed">{t.speaker_contact_organizer}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link href="/auth/login" className="flex-1">
              <button className="w-full py-2.5 rounded-lg bg-[#7BAAE8] text-white font-semibold text-sm hover:bg-[#5A8FD4] transition-colors">
                {t.nav_login}
              </button>
            </Link>
            <Link href="/" className="flex-1">
              <button className="w-full py-2.5 rounded-lg border border-[#E5E7EB] bg-white text-[#111827] font-semibold text-sm hover:bg-[#F9FAFB] transition-colors">
                {t.speaker_browse}
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const speakerSlots = await prisma.speaker.findMany({
    where: { userId: session.user.id },
    include: {
      event: { select: { id: true, title: true, date: true, location: true } },
      materials: { orderBy: { createdAt: 'desc' } },
    },
    orderBy: { event: { date: 'desc' } },
  });

  return (
    <div className="ua-bg min-h-screen">
      <div className="ua-header px-4 sm:px-6 lg:px-8 py-5">
        <div className="mx-auto max-w-4xl flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#FFFDE7] flex items-center justify-center flex-shrink-0">
            <Mic className="h-5 w-5 text-[#FFD84D]" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-[#111827]">{t.speaker_title}</h1>
            <p className="text-sm text-[#6B7280] mt-0.5">{t.speaker_subtitle}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {speakerSlots.length > 0 && (
          <AddMaterialForm
            speakerSlots={speakerSlots.map(s => ({
              id: s.id,
              topic: s.topic,
              eventId: s.event.id,
              event: { title: s.event.title },
            }))}
          />
        )}

        {speakerSlots.length === 0 ? (
          <div className="ua-card-white flex flex-col items-center justify-center py-16 text-center">
            <div className="h-14 w-14 rounded-2xl bg-[#FFFDE7] flex items-center justify-center mb-3">
              <Mic className="h-7 w-7 text-[#FFD84D]" />
            </div>
            <p className="font-semibold text-[#111827] mb-1">{t.speaker_not_added}</p>
            <p className="text-sm text-[#6B7280] mb-5">{t.speaker_contact_organizer}</p>
            <Link href="/">
              <button className="px-5 py-2.5 rounded-lg bg-[#7BAAE8] text-white text-sm font-semibold hover:bg-[#5A8FD4] transition-colors">
                {t.speaker_browse}
              </button>
            </Link>
          </div>
        ) : (
          speakerSlots.map((slot) => (
            <div key={slot.id} className="ua-card-white overflow-hidden">
              <div className="border-b border-[#F3F4F6] px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link href={`/events/${slot.event.id}`}
                      className="font-display font-semibold text-base text-[#111827] hover:text-[#7BAAE8] transition-colors inline-flex items-center gap-1.5">
                      {slot.event.title}
                      <ExternalLink className="h-3.5 w-3.5 text-[#9CA3AF]" />
                    </Link>
                    <div className="flex flex-wrap gap-3 text-xs text-[#6B7280] mt-1">
                      <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3 text-[#111827]" />{formatShortDate(slot.event.date, locale)}</span>
                      <span>{slot.event.location}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2.5 rounded-lg bg-[#F9FAFB] border border-[#F3F4F6] px-3 py-2">
                  <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{t.speaker_topic}</p>
                  <p className="text-sm font-medium text-[#111827] mt-0.5">{slot.topic}</p>
                </div>
              </div>

              <div className="px-5 py-4">
                <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2.5">
                  {t.speaker_materials} ({slot.materials.length})
                </p>
                {slot.materials.length === 0 ? (
                  <p className="text-sm text-[#9CA3AF] italic">{t.speaker_no_materials}</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {slot.materials.map((m) => (
                      <a key={m.id} href={m.fileUrl} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] px-3 py-1.5 text-sm font-medium transition-colors text-[#111827]">
                        <FileText className="h-3.5 w-3.5 text-[#FFD84D]" />
                        {m.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
