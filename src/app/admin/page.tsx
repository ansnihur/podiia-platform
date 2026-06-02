import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatShortDate } from '@/lib/utils';
import { getT, getLocale } from '@/lib/get-translations';
import { Users, CalendarDays, ClipboardList, Star, Shield } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminEventActions } from './admin-event-actions';
import { DeleteFeedbackButton } from './delete-feedback-button';
import { getAvatarColor } from '@/lib/avatar-color';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Адмін-панель' };
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
const ROLE_BADGE: Record<string, string> = {
  ADMIN:       'bg-[#1E293B] text-white border-transparent',
  ORGANIZER:   'bg-[#EFF6FF] text-[#2563EB] border-[#93C5FD]',
  SPEAKER:     'bg-[#FFFDE7] text-[#111827] border-[#FFD84D]',
  PARTICIPANT: 'bg-[#F9FAFB] text-[#6B7280] border-[#E5E7EB]',
};

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') redirect('/');

  const t = getT();
  const locale = getLocale();
  const sl = (s: string) => ({ PUBLISHED: t.status_published, DRAFT: t.status_draft, CANCELLED: t.status_cancelled, COMPLETED: t.status_completed, CONFIRMED: t.status_confirmed, PENDING: t.status_pending })[s] ?? s;
  const rl = (r: string) =>({ ADMIN: t.role_admin, ORGANIZER: t.role_organizer, SPEAKER: t.role_speaker, PARTICIPANT: t.role_participant })[r] ?? r;

  const [users, events, registrations, feedbacks] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: 'desc' }, include: { _count: { select: { registrations: true, events: true } } } }),
    prisma.event.findMany({ orderBy: { createdAt: 'desc' }, include: { organizer: { select: { name: true } }, _count: { select: { registrations: true } } } }),
    prisma.registration.findMany({ orderBy: { createdAt: 'desc' }, take: 30, include: { user: { select: { name: true, email: true } }, event: { select: { title: true } } } }),
    prisma.feedback.findMany({ orderBy: { createdAt: 'desc' }, take: 20, include: { user: { select: { name: true } }, event: { select: { title: true } } } }),
  ]);

  const stats = [
    { label: t.admin_users,         value: users.length,         icon: Users        },
    { label: t.admin_events,        value: events.length,        icon: CalendarDays  },
    { label: t.admin_registrations, value: registrations.length, icon: ClipboardList },
    { label: t.admin_reviews,       value: feedbacks.length,     icon: Star          },
  ];

  const thCls = "text-left px-4 py-3 text-xs font-bold text-[#6B7280] uppercase tracking-wide";
  const tdCls = "px-4 py-3";

  return (
    <div className="ua-bg min-h-screen">
      {/* Header */}
      <div className="ua-header px-4 sm:px-6 lg:px-8 py-5">
        <div className="mx-auto max-w-7xl flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-[#FFFDE7] flex items-center justify-center">
            <Shield className="h-5 w-5 text-[#FFD84D]" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-[#111827]">{t.admin_title}</h1>
            <p className="text-xs text-[#6B7280]">{t.admin_subtitle}</p>
          </div>
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

        {/* Tabs */}
        <Tabs defaultValue="events">
          <TabsList className="bg-white border border-[#F3F4F6] p-1 h-auto gap-1 shadow-sm">
            {[
              { value: 'events',        icon: CalendarDays,  label: `${t.admin_all_events} (${events.length})` },
              { value: 'users',         icon: Users,         label: `${t.admin_all_users} (${users.length})` },
              { value: 'registrations', icon: ClipboardList, label: t.admin_all_regs },
              { value: 'reviews',       icon: Star,          label: t.admin_all_reviews },
            ].map(({ value, icon: Icon, label }) => (
              <TabsTrigger key={value} value={value}
                className="data-[state=active]:bg-[#1E293B] data-[state=active]:text-white data-[state=active]:shadow-none text-xs font-semibold gap-1.5 rounded-lg text-[#6B7280]">
                <Icon className="h-3.5 w-3.5" /> {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* EVENTS */}
          <TabsContent value="events">
            <div className="ua-card-white overflow-hidden">
              <div className="border-b border-[#F3F4F6] px-5 py-3">
                <h2 className="font-semibold text-sm text-[#111827]">{t.admin_all_events}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#F9FAFB] border-b border-[#F3F4F6]">
                    <tr>
                      {[t.admin_name, t.admin_organizer, t.admin_date, t.admin_status, t.admin_regs_count, t.admin_actions].map(h => (
                        <th key={h} className={thCls}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6]">
                    {events.map((event: any) => (
                      <tr key={event.id} className="hover:bg-[#F9FAFB] transition-colors">
                        <td className={tdCls}>
                          <p className="font-semibold line-clamp-1 max-w-[200px] text-sm text-[#111827]">{event.title}</p>
                          <p className="text-xs text-[#6B7280] mt-0.5">{event.location}</p>
                        </td>
                        <td className={`${tdCls} text-sm text-[#6B7280]`}>{event.organizer.name}</td>
                        <td className={`${tdCls} text-sm text-[#6B7280] whitespace-nowrap`}>{formatShortDate(event.date, locale)}</td>
                        <td className={tdCls}>
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[event.status] ?? 'bg-[#F9FAFB] text-[#6B7280] border-[#E5E7EB]'}`}>
                            {sl(event.status)}
                          </span>
                        </td>
                        <td className={tdCls}>
                          <span className="font-semibold text-[#111827]">{event._count.registrations}</span>
                          <span className="text-[#6B7280]"> / {event.capacity}</span>
                        </td>
                        <td className={tdCls}>
                          <AdminEventActions eventId={event.id} currentStatus={event.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* USERS */}
          <TabsContent value="users">
            <div className="ua-card-white overflow-hidden">
              <div className="border-b border-[#F3F4F6] px-5 py-3">
                <h2 className="font-semibold text-sm text-[#111827]">{t.admin_all_users}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#F9FAFB] border-b border-[#F3F4F6]">
                    <tr>
                      {[t.admin_user, 'Email', t.admin_role, t.admin_events, t.admin_registrations, t.admin_date].map(h => (
                        <th key={h} className={thCls}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6]">
                    {users.map((user: any) => {
                      const av = getAvatarColor(user.name);
                      return (
                      <tr key={user.id} className="hover:bg-[#F9FAFB] transition-colors">
                        <td className={tdCls}>
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
                              style={{ backgroundColor: av.bg, color: av.text }}>
                              {user.name.charAt(0)}
                            </div>
                            <span className="font-semibold text-sm text-[#111827]">{user.name}</span>
                          </div>
                        </td>
                        <td className={`${tdCls} text-xs text-[#6B7280]`}>{user.email}</td>
                        <td className={tdCls}>
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${ROLE_BADGE[user.role] ?? 'bg-[#F9FAFB] text-[#6B7280]'}`}>
                            {rl(user.role)}
                          </span>
                        </td>
                        <td className={`${tdCls} text-center font-medium text-[#111827]`}>{user._count.events}</td>
                        <td className={`${tdCls} text-center font-medium text-[#111827]`}>{user._count.registrations}</td>
                        <td className={`${tdCls} text-xs text-[#6B7280] whitespace-nowrap`}>{formatShortDate(user.createdAt, locale)}</td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* REGISTRATIONS */}
          <TabsContent value="registrations">
            <div className="ua-card-white overflow-hidden">
              <div className="border-b border-[#F3F4F6] px-5 py-3">
                <h2 className="font-semibold text-sm text-[#111827]">{t.admin_recent_regs}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#F9FAFB] border-b border-[#F3F4F6]">
                    <tr>
                      {[t.admin_user, 'Email', t.admin_event, t.admin_status, t.admin_date].map(h => (
                        <th key={h} className={thCls}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6]">
                    {registrations.map((reg: any) => (
                      <tr key={reg.id} className="hover:bg-[#F9FAFB] transition-colors">
                        <td className={`${tdCls} font-semibold text-[#111827]`}>{reg.user.name}</td>
                        <td className={`${tdCls} text-xs text-[#6B7280]`}>{reg.user.email}</td>
                        <td className={tdCls}>
                          <p className="line-clamp-1 max-w-[200px] text-sm text-[#111827]">{reg.event.title}</p>
                        </td>
                        <td className={tdCls}>
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${REG_BADGE[reg.status] ?? 'bg-[#F9FAFB] text-[#6B7280] border-[#E5E7EB]'}`}>
                            {sl(reg.status)}
                          </span>
                        </td>
                        <td className={`${tdCls} text-xs text-[#6B7280] whitespace-nowrap`}>{formatShortDate(reg.createdAt, locale)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* REVIEWS */}
          <TabsContent value="reviews">
            <div className="ua-card-white overflow-hidden">
              <div className="border-b border-[#F3F4F6] px-5 py-3">
                <h2 className="font-semibold text-sm text-[#111827]">{t.admin_recent_reviews}</h2>
              </div>
              <div className="divide-y divide-[#F3F4F6]">
                {feedbacks.map((fb: any) => (
                  <div key={fb.id} className="px-5 py-4 hover:bg-[#F9FAFB] transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-semibold text-sm text-[#111827]">{fb.user.name}</span>
                          <span className="text-xs text-[#6B7280]">{t.admin_about}</span>
                          <span className="text-sm text-[#7BAAE8] truncate font-medium">{fb.event.title}</span>
                        </div>
                        {fb.comment && <p className="text-sm text-[#6B7280]">{fb.comment}</p>}
                        <p className="text-xs text-[#9CA3AF] mt-1">{formatShortDate(fb.createdAt, locale)}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < fb.rating ? 'text-[#FFD84D] fill-[#FFD84D]' : 'text-[#E5E7EB]'}`} />
                          ))}
                        </div>
                        <DeleteFeedbackButton id={fb.id} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
