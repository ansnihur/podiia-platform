import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatShortDate } from '@/lib/utils';
import { getT, getLocale } from '@/lib/get-translations';
import Link from 'next/link';
import { ArrowLeft, Users, Star, MessageSquare, BarChart2, CheckCircle } from 'lucide-react';
import { getAvatarColor } from '@/lib/avatar-color';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Analytics' };
export const dynamic = 'force-dynamic';

const STATUS_BADGE: Record<string, string> = {
  CONFIRMED: 'bg-[#F0FDF4] text-[#15803D] border-[#86EFAC]',
  CANCELLED: 'bg-[#FEF2F2] text-[#DC2626] border-[#FCA5A5]',
  PENDING:   'bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA]',
};

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i <= rating ? 'fill-[#FFD84D] text-[#FFD84D]' : 'text-[#E5E7EB]'}`} />
      ))}
    </span>
  );
}

export default async function AnalyticsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/login');
  if (session.user.role !== 'ORGANIZER' && session.user.role !== 'ADMIN') redirect('/');

  const t = getT();
  const locale = getLocale();
  const sl = (s: string) =>({ CONFIRMED: t.status_confirmed, CANCELLED: t.status_cancelled, PENDING: t.status_pending, PUBLISHED: t.status_published, DRAFT: t.status_draft, COMPLETED: t.status_completed })[s] ?? s;

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      registrations: { include: { user: { select: { name: true, email: true } } }, orderBy: { createdAt: 'desc' } },
      feedbacks:     { include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' } },
    },
  });

  if (!event) notFound();
  if (session.user.role === 'ORGANIZER' && event.organizerId !== session.user.id) redirect('/dashboard');

  const total     = event.registrations.length;
  const confirmed = event.registrations.filter((r) => r.status === 'CONFIRMED').length;
  const cancelled = event.registrations.filter((r) => r.status === 'CANCELLED').length;
  const fillPct   = event.capacity > 0 ? Math.round((total / event.capacity) * 100) : 0;
  const avgRating = event.feedbacks.length > 0
    ? event.feedbacks.reduce((sum, f) => sum + f.rating, 0) / event.feedbacks.length
    : null;

  const statCards = [
    { label: t.analytics_registered, value: total,                sub: `${t.analytics_of_spots} ${event.capacity}`,    icon: Users         },
    { label: t.analytics_confirmed,  value: confirmed,            sub: `${t.analytics_cancelled}: ${cancelled}`,        icon: CheckCircle   },
    { label: t.analytics_reviews,    value: event.feedbacks.length, sub: t.analytics_left_review,                       icon: MessageSquare },
    { label: t.analytics_rating,
      value: avgRating !== null ? avgRating.toFixed(1) : '—',
      sub:   avgRating !== null ? t.analytics_avg_rating : t.analytics_no_ratings,
      icon: Star },
  ];

  return (
    <div className="ua-bg min-h-screen">
      {/* Header */}
      <div className="ua-header px-4 sm:px-6 lg:px-8 py-5">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-0.5">{t.analytics_title}</p>
            <h1 className="font-display text-xl font-bold text-[#111827] leading-tight">{event.title}</h1>
            <p className="text-sm text-[#6B7280] mt-0.5">{formatShortDate(event.date, locale)} · {event.location}</p>
          </div>
          <Link href="/dashboard"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-sm font-semibold text-[#111827] transition-colors self-start sm:self-auto">
            <ArrowLeft className="h-4 w-4" /> {t.dash_back}
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statCards.map(({ label, value, sub, icon: Icon }) => (
            <div key={label} className="ua-card-white p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-[#6B7280]">{label}</p>
                <div className="h-8 w-8 rounded-lg bg-[#FFFDE7] flex items-center justify-center">
                  <Icon className="h-4 w-4 text-[#FFD84D]" />
                </div>
              </div>
              <p className="font-display text-3xl font-bold text-[#111827]">{value}</p>
              <p className="text-xs text-[#6B7280] mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* Occupancy bar */}
        <div className="ua-card-white p-5">
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 className="h-4 w-4 text-[#111827]" />
            <h2 className="font-display text-base font-semibold text-[#111827]">{t.analytics_occupancy}</h2>
            <span className="ml-auto font-bold text-sm text-[#111827]">{fillPct}%</span>
          </div>
          <div className="h-[6px] w-full rounded-full bg-[#F3F4F6] overflow-hidden">
            <div className="h-full rounded-full transition-all"
              style={{ width: `${Math.min(fillPct, 100)}%`, background: fillPct >= 90 ? '#EF4444' : '#FFD84D' }} />
          </div>
          <div className="flex justify-between text-xs text-[#6B7280] mt-1.5">
            <span>{total} {t.analytics_registered_count}</span>
            <span>{event.capacity - total} {t.analytics_free_spots}</span>
          </div>
        </div>

        {/* Participants */}
        <div className="ua-card-white overflow-hidden">
          <div className="border-b border-[#F3F4F6] px-5 py-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-[#111827]">{t.analytics_participants}</h2>
            <span className="text-xs text-[#6B7280]">{total} {t.analytics_total}</span>
          </div>
          {total === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-10 w-10 rounded-2xl bg-[#FFFDE7] flex items-center justify-center mb-2">
                <Users className="h-5 w-5 text-[#FFD84D]" />
              </div>
              <p className="text-sm text-[#6B7280]">{t.analytics_no_regs}</p>
            </div>
          ) : (
            <>
              <div className="hidden sm:grid grid-cols-[1fr_1fr_auto_auto] gap-4 px-5 py-2 bg-[#F9FAFB] text-xs font-semibold text-[#6B7280] uppercase tracking-wide border-b border-[#F3F4F6]">
                <span>{t.analytics_name}</span>
                <span>Email</span>
                <span>{t.analytics_status}</span>
                <span>{t.analytics_date}</span>
              </div>
              <div className="divide-y divide-[#F3F4F6]">
                {event.registrations.map((reg) => (
                  <div key={reg.id} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto_auto] gap-1 sm:gap-4 px-5 py-3 hover:bg-[#F9FAFB] transition-colors items-center">
                    <span className="text-sm font-semibold text-[#111827]">{reg.user.name}</span>
                    <span className="text-sm text-[#6B7280] truncate">{reg.user.email}</span>
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold w-fit ${STATUS_BADGE[reg.status] ?? 'bg-[#F9FAFB] text-[#6B7280] border-[#E5E7EB]'}`}>
                      {sl(reg.status)}
                    </span>
                    <span className="text-xs text-[#6B7280] whitespace-nowrap">{formatShortDate(reg.createdAt, locale)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Feedbacks */}
        <div className="ua-card-white overflow-hidden">
          <div className="border-b border-[#F3F4F6] px-5 py-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-[#111827]">{t.event_reviews}</h2>
            <span className="text-xs text-[#6B7280]">{event.feedbacks.length} {t.analytics_total}</span>
          </div>
          {event.feedbacks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-10 w-10 rounded-2xl bg-[#FFFDE7] flex items-center justify-center mb-2">
                <MessageSquare className="h-5 w-5 text-[#FFD84D]" />
              </div>
              <p className="text-sm text-[#6B7280]">{t.analytics_no_reviews}</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F3F4F6]">
              {event.feedbacks.map((fb) => {
                const av = getAvatarColor(fb.user.name);
                return (
                <div key={fb.id} className="px-5 py-4 hover:bg-[#F9FAFB] transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                        style={{ backgroundColor: av.bg, color: av.text }}>
                        {fb.user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-semibold text-[#111827]">{fb.user.name}</span>
                    </div>
                    <Stars rating={fb.rating} />
                  </div>
                  {fb.comment && <p className="text-sm text-[#6B7280] leading-relaxed pl-9">{fb.comment}</p>}
                </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
