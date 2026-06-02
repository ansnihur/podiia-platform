import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatShortDate, formatTime, daysUntil, isUpcoming } from '@/lib/utils';
import { getT, getLocale } from '@/lib/get-translations';
import { Calendar, MapPin, Users, Star, Mic, Clock, BookOpen, FileText } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { RegistrationSection } from './registration-section';
import { FeedbackForm } from './feedback-form';
import { getAvatarColor } from '@/lib/avatar-color';
import { HeroImage } from './hero-image';
import { BackButton } from './back-button';
import type { Metadata } from 'next';

interface Props { params: { id: string } }

async function getEvent(id: string) {
  return prisma.event.findUnique({
    where: { id },
    include: {
      organizer: { select: { name: true, email: true } },
      speakers: { include: { user: { select: { name: true } }, materials: true } },
      _count: { select: { registrations: { where: { status: 'CONFIRMED' } } } },
      feedbacks: { include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' } },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = await getEvent(params.id);
  if (!event) return { title: 'Not Found' };
  return { title: event.title, description: event.description.slice(0, 160) };
}

export default async function EventDetailPage({ params }: Props) {
  const [event, session] = await Promise.all([getEvent(params.id), getServerSession(authOptions)]);
  if (!event) notFound();

  const t = getT();
  const locale = getLocale();

  const registration = session?.user
    ? await prisma.registration.findUnique({ where: { userId_eventId: { userId: session.user.id, eventId: event.id } } })
    : null;

  const hasExistingFeedback = session?.user
    ? event.feedbacks.some((fb: any) => fb.userId === session.user.id)
    : false;
  const canLeaveFeedback = !!session?.user && registration?.status === 'CONFIRMED' && !hasExistingFeedback;

  const avgRating = event.feedbacks.length
    ? event.feedbacks.reduce((s: number, f: { rating: number }) => s + f.rating, 0) / event.feedbacks.length
    : null;

  const registrations = event._count.registrations;
  const spotsLeft = event.capacity - registrations;
  const days = daysUntil(event.date);
  const upcoming = isUpcoming(event.date);

  const statusColorMap: Record<string, string> = {
    PUBLISHED: 'bg-[#F0FDF4] text-[#15803D] border-[#86EFAC]',
    DRAFT:     'bg-[#F9FAFB] text-[#6B7280] border-[#E5E7EB]',
    CANCELLED: 'bg-[#FEF2F2] text-[#DC2626] border-[#FCA5A5]',
    COMPLETED: 'bg-[#EFF6FF] text-[#2563EB] border-[#93C5FD]',
  };

  return (
    <div className="ua-bg min-h-screen">
      {/* Hero */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <HeroImage imageUrl={event.imageUrl} title={event.title} />
        <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-8" style={{ zIndex: 10 }}>
          <div className="mx-auto w-full max-w-5xl">
            <div className="mb-3"><BackButton /></div>
            <div className="flex flex-wrap gap-2 mb-2.5">
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusColorMap[event.status] ?? 'bg-gray-100 text-gray-600'}`}>
                {({PUBLISHED:t.status_published,DRAFT:t.status_draft,CANCELLED:t.status_cancelled,COMPLETED:t.status_completed})[event.status]??event.status}
              </span>
              {event.tags.map((tag: string) => (
                <span key={tag} className="inline-flex items-center rounded-full border border-white/40 bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white">
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="font-display text-2xl md:text-4xl font-bold leading-tight text-white">
              {event.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <div className="ua-card-white p-6">
              <h2 className="font-display text-xl font-semibold mb-3 text-[#1a1a1a]">{t.event_about}</h2>
              <p className="text-[#1a1a1a]/70 leading-relaxed whitespace-pre-line text-sm">{event.description}</p>
            </div>

            {/* Speakers */}
            {event.speakers.length > 0 && (
              <div className="ua-card-white p-6">
                <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2 text-[#1a1a1a]">
                  <Mic className="h-5 w-5 text-[#7BAAE8]" /> {t.event_speakers}
                </h2>
                <div className="space-y-4">
                  {event.speakers.map((speaker: any) => {
                    const av = getAvatarColor(speaker.user.name);
                    return (
                    <div key={speaker.id} className="rounded-xl border border-[#F3F4F6] bg-white p-4 space-y-2">
                      <div className="flex items-start gap-3">
                        <div className="h-9 w-9 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm"
                          style={{ backgroundColor: av.bg, color: av.text }}>
                          {speaker.user.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">{speaker.user.name}</h3>
                          <p className="text-xs text-[#1565C0] font-medium mt-0.5">{speaker.topic}</p>
                        </div>
                      </div>
                      <p className="text-xs text-[#1a1a1a]/60 leading-relaxed">{speaker.bio}</p>
                      {speaker.materials.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {speaker.materials.map((m: any) => (
                            <a key={m.id} href={m.fileUrl} target="_blank" rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg border border-[#E5E7EB] bg-white px-2.5 py-1 text-xs font-medium hover:bg-[#F9FAFB] transition-colors text-[#111827]">
                              <FileText className="h-3.5 w-3.5 text-[#FFD84D]" /> {m.title}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reviews */}
            {event.feedbacks.length > 0 && (
              <div className="ua-card-white p-6">
                <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2 text-[#1a1a1a]">
                  <Star className="h-5 w-5 text-[#FFD84D] fill-[#FFD84D]" />
                  {t.event_reviews}
                  {avgRating && <span className="text-base font-normal text-[#1a1a1a]/50 ml-1">{avgRating.toFixed(1)}/5 ({event.feedbacks.length})</span>}
                </h2>
                <div className="space-y-3">
                  {event.feedbacks.map((fb: any) => (
                    <div key={fb.id} className="rounded-xl border border-[#F3F4F6] bg-white p-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-sm">{fb.user.name}</span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-3.5 w-3.5 ${i < fb.rating ? 'text-[#FFD84D] fill-[#FFD84D]' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                      {fb.comment && <p className="text-xs text-[#1a1a1a]/60">{fb.comment}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback form */}
            {canLeaveFeedback && <FeedbackForm eventId={event.id} />}
          </div>

          {/* Sidebar */}
          <div className="lg:min-w-[300px]">
            <div className="sticky top-24 space-y-4">
            {/* Registration card */}
            <div className="ua-card p-5 space-y-4">
              {upcoming && days >= 0 && days <= 7 && (
                <div className="rounded-lg bg-[#FFFDE7] border border-[#FFD84D] px-4 py-2.5 text-sm font-semibold text-[#111827] text-center">
                  {days === 0 ? t.event_today : `⏳ ${days} ${t.event_days_left}`}
                </div>
              )}
              <RegistrationSection
                eventId={event.id}
                eventStatus={event.status}
                capacity={event.capacity}
                initialRegistrations={registrations}
                registrationStatus={registration?.status ?? null}
                isUpcoming={upcoming}
                userId={session?.user?.id ?? null}
              />
            </div>

            {/* Details */}
            <div className="ua-card-white p-4 space-y-3">
              <h3 className="font-semibold text-sm text-[#1a1a1a]">{t.event_details}</h3>
              {[
                { icon: Calendar, label: formatShortDate(event.date, locale), sub: formatTime(event.date, locale) },
                { icon: MapPin, label: event.location },
                { icon: Users, label: `${t.event_capacity}: ${event.capacity}` },
              ].map(({ icon: Icon, label, sub }, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-[#FFE566] flex items-center justify-center flex-shrink-0">
                    <Icon className="h-3.5 w-3.5 text-[#C8A000]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    {sub && <p className="text-xs text-[#1a1a1a]/50">{sub}</p>}
                  </div>
                </div>
              ))}
            </div>

            {/* Program link */}
            <Link href={`/events/${event.id}/program`}>
              <div className="ua-card-white p-4 flex items-center gap-3 hover:bg-[#F9FAFB] transition-colors cursor-pointer border border-[#7BAAE8]">
                <div className="h-9 w-9 rounded-lg bg-[#EBF3FF] flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-4 w-4 text-[#1565C0]" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#1565C0]">{t.event_program}</p>
                  <p className="text-xs text-[#1a1a1a]/50">{t.event_speakers_topics}</p>
                </div>
              </div>
            </Link>

            {/* Organizer */}
            <div className="ua-card-white p-4">
              <h3 className="font-semibold text-sm text-[#1a1a1a] mb-2.5">{t.event_organized_by}</h3>
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm"
                  style={{ backgroundColor: getAvatarColor(event.organizer.name).bg, color: getAvatarColor(event.organizer.name).text }}>
                  {event.organizer.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm">{event.organizer.name}</p>
                  <p className="text-xs text-[#1a1a1a]/50">{event.organizer.email}</p>
                </div>
              </div>
            </div>
            </div>{/* /sticky */}
          </div>{/* /sidebar */}
        </div>
      </div>
    </div>
  );
}
