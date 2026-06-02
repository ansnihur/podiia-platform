import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatShortDate } from '@/lib/utils';
import { getT, getLocale } from '@/lib/get-translations';
import { CalendarDays, Users, TrendingUp, CheckCircle, Clock, Eye, BarChart2, Download } from 'lucide-react';
import Link from 'next/link';
import { CreateEventDialog } from './create-event-dialog';
import { EventStatusButtons } from './event-status-buttons';
import { SpeakersDialog } from './speakers-dialog';
import { getAvatarColor } from '@/lib/avatar-color';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Кабінет' };
export const dynamic = 'force-dynamic';

const STATUS_BADGE: Record<string, string> = {
  PUBLISHED: 'bg-[#F0FDF4] text-[#15803D] border-[#86EFAC]',
  DRAFT:     'bg-[#F9FAFB] text-[#6B7280] border-[#E5E7EB]',
  CANCELLED: 'bg-[#FEF2F2] text-[#DC2626] border-[#FCA5A5]',
  COMPLETED: 'bg-[#EFF6FF] text-[#2563EB] border-[#93C5FD]',
};
const REG_BADGE: Record<string, string> = {
  CONFIRMED: 'bg-[#F0FDF4] text-[#15803D] border-[#86EFAC]',
  CANCELLED: 'bg-[#FEF2F2] text-[#DC2626] border-[#FCA5A5]',
  PENDING:   'bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA]',
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/login');
  if (session.user.role === 'PARTICIPANT') redirect('/');

  const t = getT();
  const locale = getLocale();
  const sl = (s: string) => ({ PUBLISHED: t.status_published, DRAFT: t.status_draft, CANCELLED: t.status_cancelled, COMPLETED: t.status_completed, CONFIRMED: t.status_confirmed, PENDING: t.status_pending })[s] ?? s;
  const isAdmin = session.user.role === 'ADMIN';

  const events = await prisma.event.findMany({
    where: isAdmin ? {} : { organizerId: session.user.id },
    include: {
      _count: { select: { registrations: { where: { status: 'CONFIRMED' } }, feedbacks: true } },
      registrations: { include: { user: { select: { name: true, email: true } } }, orderBy: { createdAt: 'desc' }, take: 5 },
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalReg  = events.reduce((s: number, e: typeof events[number]) => s + e._count.registrations, 0);
  const published = events.filter((e: typeof events[number]) => e.status === 'PUBLISHED').length;
  const upcoming  = events.filter((e: typeof events[number]) => new Date(e.date) > new Date()).length;

  const stats = [
    { label: t.dash_total_events,  value: events.length, icon: CalendarDays },
    { label: t.dash_published,     value: published,     icon: CheckCircle  },
    { label: t.dash_upcoming,      value: upcoming,      icon: Clock        },
    { label: t.dash_registrations, value: totalReg,      icon: Users        },
  ];

  return (
    <div className="ua-bg min-h-screen">
      {/* Header */}
      <div className="ua-header px-4 sm:px-6 lg:px-8 py-5">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#111827]">{t.dash_organizer_title}</h1>
            <p className="text-sm text-[#6B7280]">{t.dash_welcome} <span className="font-semibold text-[#111827]">{session.user.name}</span></p>
          </div>
          <CreateEventDialog />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="ua-card-white p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-[#6B7280]">{label}</p>
                <div className="h-8 w-8 rounded-lg bg-[#FFFDE7] flex items-center justify-center">
                  <Icon className="h-4 w-4 text-[#FFD84D]" />
                </div>
              </div>
              <p className="font-display text-3xl font-bold text-[#111827]">{value}</p>
            </div>
          ))}
        </div>

        {/* Events table */}
        <div className="ua-card-white overflow-hidden">
          <div className="border-b border-[#F3F4F6] px-5 py-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-[#111827]">{t.dash_your_events}</h2>
            <span className="text-xs text-[#6B7280]">{events.length} {t.dash_total}</span>
          </div>

          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="h-12 w-12 rounded-2xl bg-[#FFFDE7] flex items-center justify-center mb-3">
                <CalendarDays className="h-6 w-6 text-[#FFD84D]" />
              </div>
              <p className="font-semibold text-[#111827] mb-1">{t.dash_no_events}</p>
              <p className="text-sm text-[#6B7280] mb-4">{t.dash_no_events_desc}</p>
              <CreateEventDialog />
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {events.map((event: any) => (
                <div key={event.id} className="bg-white border border-[#F3F4F6] rounded-xl p-4 flex gap-3 hover:border-[#FFD84D] transition-all">
                  {/* Accent bar */}
                  <div className="w-1 rounded-full bg-[#FFD84D] self-stretch flex-shrink-0" />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Title + Status */}
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <h3 className="font-bold text-base text-[#111827] truncate">{event.title}</h3>
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold flex-shrink-0 ${STATUS_BADGE[event.status] ?? 'bg-[#F9FAFB] text-[#6B7280] border-[#E5E7EB]'}`}>
                        {sl(event.status)}
                      </span>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-4 text-sm text-[#6B7280] mb-3">
                      <span>{formatShortDate(event.date, locale)}</span>
                      <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-[#111827]" />{event._count.registrations}/{event.capacity}</span>
                      <span className="flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5 text-[#111827]" />{event._count.feedbacks} {t.dash_reviews}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-[#F3F4F6] justify-end">
                      <EventStatusButtons eventId={event.id} status={event.status} />
                      <SpeakersDialog eventId={event.id} eventTitle={event.title} />
                      <a href={`/api/events/${event.id}/export`} download>
                        <button className="flex items-center gap-1.5 border text-xs font-medium rounded-lg px-2.5 py-1.5 transition-colors bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0] hover:bg-[#DCFCE7]">
                          <Download className="h-3.5 w-3.5" /> CSV
                        </button>
                      </a>
                      <Link href={`/dashboard/events/${event.id}/analytics`}>
                        <button className="flex items-center gap-1.5 border text-xs font-medium rounded-lg px-2.5 py-1.5 transition-colors bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE] hover:bg-[#DBEAFE]">
                          <BarChart2 className="h-3.5 w-3.5" /> {t.dash_analytics}
                        </button>
                      </Link>
                      <Link href={`/events/${event.id}`}>
                        <button className="flex items-center gap-1.5 border border-transparent text-xs font-medium rounded-lg px-2.5 py-1.5 transition-colors bg-[#7BAAE8] text-white hover:bg-[#5A8FD4]">
                          <Eye className="h-3.5 w-3.5" /> {t.dash_view}
                        </button>
                      </Link>
                    </div>

                    {/* Recent registrations */}
                    {event.registrations.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-dashed border-[#F3F4F6]">
                        <p className="text-xs font-medium text-[#6B7280] mb-1.5">{t.dash_recent_regs}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {event.registrations.map((reg: any) => {
                            const av = getAvatarColor(reg.user.name);
                            return (
                            <div key={reg.id} className="flex items-center gap-1 rounded-full bg-[#F9FAFB] border border-[#F3F4F6] px-2 py-0.5">
                              <div className="h-4 w-4 rounded-full flex items-center justify-center text-[8px] font-bold"
                                style={{ backgroundColor: av.bg, color: av.text }}>
                                {reg.user.name.charAt(0)}
                              </div>
                              <span className="text-xs font-medium text-[#111827]">{reg.user.name}</span>
                              <span className={`text-[10px] font-medium ${REG_BADGE[reg.status]?.includes('15803D') ? 'text-[#15803D]' : reg.status === 'CANCELLED' ? 'text-[#DC2626]' : 'text-[#C2410C]'}`}>
                                {sl(reg.status)}
                              </span>
                            </div>
                            );
                          })}
                          {event._count.registrations > 5 && (
                            <span className="text-xs text-[#6B7280] self-center">+{event._count.registrations - 5}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
