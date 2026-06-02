import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatShortDate, formatTime } from '@/lib/utils';
import { CalendarDays, MapPin, BookOpen, CalendarX } from 'lucide-react';
import { EventImage } from '@/components/event-image';
import Link from 'next/link';
import { getT, getLocale } from '@/lib/get-translations';
import type { T } from '@/lib/translations';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'My Events' };
export const dynamic = 'force-dynamic';

const STATUS_BADGE: Record<string, string> = {
  CONFIRMED: 'bg-[#F0FDF4] text-[#15803D] border-[#86EFAC]',
  CANCELLED: 'bg-[#FEF2F2] text-[#DC2626] border-[#FCA5A5]',
  PENDING:   'bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA]',
};

export default async function MyEventsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/login');

  const t = getT();
  const locale = getLocale();
  const registrations = await prisma.registration.findMany({
    where: { userId: session.user.id },
    include: { event: { select: { id: true, title: true, date: true, location: true, imageUrl: true, status: true } } },
    orderBy: { event: { date: 'asc' } },
  });

  const now = new Date();
  const upcoming = registrations.filter((r) => new Date(r.event.date) > now);
  const past     = registrations.filter((r) => new Date(r.event.date) <= now);
  const sl = (s: string) => ({ CONFIRMED: t.status_confirmed, CANCELLED: t.status_cancelled, PENDING: t.status_pending })[s] ?? s;

  return (
    <div className="ua-bg min-h-screen">
      <div className="ua-header px-4 sm:px-6 lg:px-8 py-5">
        <div className="mx-auto max-w-4xl">
          <h1 className="font-display text-2xl font-bold text-[#111827]">{t.my_events_title}</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">{t.my_events_subtitle}</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {registrations.length === 0 ? (
          <div className="ua-card-white flex flex-col items-center justify-center py-16 text-center">
            <div className="h-14 w-14 rounded-2xl bg-[#FFFDE7] flex items-center justify-center mb-3">
              <CalendarX className="h-7 w-7 text-[#FFD84D]" />
            </div>
            <p className="font-semibold text-[#111827] mb-1">{t.my_events_empty}</p>
            <p className="text-sm text-[#6B7280] mb-5">{t.my_events_empty_desc}</p>
            <Link href="/">
              <button className="px-5 py-2.5 rounded-lg bg-[#7BAAE8] text-white text-sm font-semibold hover:bg-[#5A8FD4] transition-colors">
                {t.my_events_browse}
              </button>
            </Link>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && <Section title={t.my_events_upcoming} regs={upcoming} t={t} sl={sl} locale={locale} />}
            {past.length > 0 && <Section title={t.my_events_past} regs={past} t={t} sl={sl} locale={locale} muted />}
          </>
        )}
      </div>
    </div>
  );
}

type Reg = { id: string; status: string; event: { id: string; title: string; date: Date; location: string; imageUrl: string | null; status: string } };

function Section({ title, regs, t, sl, locale, muted = false }: { title: string; regs: Reg[]; t: T; sl: (s: string) => string; locale: string; muted?: boolean }) {
  const STATUS_BADGE: Record<string, string> = {
    CONFIRMED: 'bg-[#F0FDF4] text-[#15803D] border-[#86EFAC]',
    CANCELLED: 'bg-[#FEF2F2] text-[#DC2626] border-[#FCA5A5]',
    PENDING:   'bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA]',
  };

  return (
    <div className="ua-card-white overflow-hidden">
      <div className="border-b border-[#F3F4F6] px-5 py-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-[#111827]">{title}</h2>
        <span className="text-xs text-[#6B7280]">{regs.length}</span>
      </div>
      <div className="divide-y divide-[#F3F4F6]">
        {regs.map((reg) => (
          <div key={reg.id} className={`flex gap-4 px-5 py-4 transition-colors ${muted ? 'opacity-60 hover:opacity-100' : 'hover:bg-[#F9FAFB]'}`}>
            <div className="h-16 w-24 flex-shrink-0 rounded-lg overflow-hidden bg-[#FFFDE7] border border-[#F3F4F6]">
              {reg.event.imageUrl ? (
                <EventImage src={reg.event.imageUrl} alt={reg.event.title} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #FFD84D 0%, #FFC93C 100%)' }}>
                  <CalendarDays className="h-5 w-5 text-[#111827]" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start gap-2 mb-1">
                <Link href={`/events/${reg.event.id}`} className="font-semibold text-sm text-[#111827] hover:text-[#7BAAE8] transition-colors truncate">
                  {reg.event.title}
                </Link>
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold flex-shrink-0 ${STATUS_BADGE[reg.status] ?? 'bg-[#F9FAFB] text-[#6B7280] border-[#E5E7EB]'}`}>
                  {sl(reg.status)}
                </span>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-[#6B7280] mb-2.5">
                <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3 text-[#111827]" />{formatShortDate(reg.event.date, locale)}, {formatTime(reg.event.date, locale)}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-[#111827]" />{reg.event.location}</span>
              </div>
              <Link href={`/events/${reg.event.id}/program`}>
                <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-xs font-semibold text-[#111827] transition-colors">
                  <BookOpen className="h-3 w-3" /> {t.my_events_view_program}
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
