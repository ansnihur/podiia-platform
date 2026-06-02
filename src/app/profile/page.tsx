import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatShortDate } from '@/lib/utils';
import Link from 'next/link';
import { CalendarDays, MapPin } from 'lucide-react';
import { NameForm } from './name-form';
import { getT, getLocale } from '@/lib/get-translations';
import { getAvatarColor } from '@/lib/avatar-color';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Profile' };
export const dynamic = 'force-dynamic';

const ROLE_BADGE: Record<string, string> = {
  ADMIN:       'bg-[#1E293B] text-white border-transparent',
  ORGANIZER:   'bg-[#EFF6FF] text-[#2563EB] border-[#93C5FD]',
  SPEAKER:     'bg-[#FFFDE7] text-[#111827] border-[#FFD84D]',
  PARTICIPANT: 'bg-[#F9FAFB] text-[#6B7280] border-[#E5E7EB]',
};
const STATUS_BADGE: Record<string, string> = {
  CONFIRMED: 'bg-[#F0FDF4] text-[#15803D] border-[#86EFAC]',
  CANCELLED: 'bg-[#FEF2F2] text-[#DC2626] border-[#FCA5A5]',
  PENDING:   'bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA]',
};

const AVATAR_COLORS = ['#7BAAE8', '#F5A623', '#4CAF50', '#E91E63', '#9C27B0'];

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/login');

  const t = getT();
  const locale = getLocale();
  const [dbUser, registrations] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, role: true },
    }),
    prisma.registration.findMany({
      where: { userId: session.user.id },
      include: { event: { select: { id: true, title: true, date: true, location: true } } },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  if (!dbUser) redirect('/auth/login');

  const initials = dbUser.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) ?? '?';
  const { bg: avatarBg, text: avatarText } = getAvatarColor(dbUser.name ?? '');
  const roleLabel = ({ ADMIN: t.role_admin, ORGANIZER: t.role_organizer, SPEAKER: t.role_speaker, PARTICIPANT: t.role_participant })[dbUser.role] ?? dbUser.role;
  const sl = (s: string) => ({ CONFIRMED: t.status_confirmed, CANCELLED: t.status_cancelled, PENDING: t.status_pending })[s] ?? s;

  return (
    <div className="ua-bg min-h-screen">
      {/* Header */}
      <div className="ua-header px-4 sm:px-6 lg:px-8 py-5">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-display text-2xl font-bold text-[#111827]">{t.profile_title}</h1>
          <p className="text-sm text-[#6B7280]">{dbUser.email}</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* User info */}
        <div className="ua-card-white p-6">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0"
              style={{ backgroundColor: avatarBg, color: avatarText }}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-xl font-bold text-[#111827]">{dbUser.name}</h2>
              <p className="text-sm text-[#6B7280] mt-0.5">{dbUser.email}</p>
              <span className={`mt-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${ROLE_BADGE[dbUser.role] ?? 'bg-[#F9FAFB] text-[#6B7280]'}`}>
                {roleLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Name form */}
        <NameForm currentName={dbUser.name} />

        {/* Registrations */}
        <div className="ua-card-white overflow-hidden">
          <div className="border-b border-[#F3F4F6] px-5 py-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-[#111827]">{t.profile_my_events}</h2>
            <span className="text-xs text-[#6B7280]">{registrations.length} {t.profile_total}</span>
          </div>

          {registrations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="h-12 w-12 rounded-2xl bg-[#FFFDE7] flex items-center justify-center mb-3">
                <CalendarDays className="h-6 w-6 text-[#FFD84D]" />
              </div>
              <p className="font-semibold text-[#111827] mb-1">{t.profile_no_events}</p>
              <p className="text-sm text-[#6B7280] mb-4">{t.profile_no_events_desc}</p>
              <Link href="/" className="btn-primary" style={{ textDecoration: 'none' }}>
                {t.profile_browse}
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#F3F4F6]">
              {registrations.map((reg) => (
                <div key={reg.id} className="px-5 py-4 hover:bg-[#F9FAFB] transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-[#111827] leading-snug">{reg.event.title}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-[#6B7280] mt-1.5">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3 text-[#111827]" />
                          {formatShortDate(reg.event.date, locale)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-[#111827]" />
                          {reg.event.location}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[reg.status] ?? 'bg-[#F9FAFB] text-[#6B7280] border-[#E5E7EB]'}`}>
                        {sl(reg.status)}
                      </span>
                      <Link href={`/events/${reg.event.id}`} className="text-xs text-[#7BAAE8] hover:underline font-medium">
                        {t.profile_view}
                      </Link>
                    </div>
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
