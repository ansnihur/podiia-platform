'use client';
import Link from 'next/link';
import { MapPin, Users, Clock, Calendar } from 'lucide-react';
import { formatShortDate, formatTime, daysUntil, isUpcoming } from '@/lib/utils';
import { EventImage } from '@/components/event-image';
import { useLanguage } from '@/contexts/language';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    date: string | Date;
    location: string;
    capacity: number;
    status: string;
    tags: string[];
    imageUrl?: string | null;
    organizer?: { name: string } | null;
    _count?: { registrations: number };
  };
}

export function EventCard({ event }: EventCardProps) {
  const { t, locale } = useLanguage();
  const days = daysUntil(event.date);
  const upcoming = isUpcoming(event.date);
  const registrations = event._count?.registrations ?? 0;
  const spotsLeft = event.capacity - registrations;
  const fillPercent = Math.min((registrations / event.capacity) * 100, 100);

  return (
    <div
      className="ua-event-card flex flex-col h-full group hover:-translate-y-2 hover:shadow-2xl cursor-pointer"
      style={{ transition: 'all 400ms cubic-bezier(0.34, 1.56, 0.64, 1)' }}
    >
      {/* Image */}
      <div
        className="relative h-[200px] overflow-hidden flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #FFF9E6 0%, #FFE8A3 60%, #FFD84D 100%)' }}
      >
        {event.imageUrl ? (
          <>
            <EventImage
              src={event.imageUrl}
              alt={event.title}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              fallbackClassName="h-full w-full flex items-center justify-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
          </>
        ) : (
          <div
            className="relative overflow-hidden"
            style={{ height: '200px', background: 'linear-gradient(135deg, #FFF9E6 0%, #FFE8A3 60%, #FFD84D 100%)' }}
          >
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,216,77,0.4)', zIndex: 0 }} />
            <div style={{ position: 'absolute', bottom: '-25px', left: '-15px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,200,50,0.3)', zIndex: 0 }} />
            <div style={{ position: 'absolute', inset: 0, zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none"
                stroke="rgba(160,110,0,0.5)" strokeWidth="1.5" className="animate-float">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
          </div>
        )}

        {upcoming && days >= 0 && days <= 14 && (
          <div className="absolute top-2.5 left-2.5 bg-[#FF4444] text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
            {days === 0 ? 'TODAY' : `${days}д`}
          </div>
        )}
        <div className="absolute bottom-2.5 right-2.5 bg-white rounded-lg px-2.5 py-1 text-xs font-semibold text-[#111827] shadow-sm">
          {formatShortDate(event.date, locale)}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2.5 p-4 flex-1 bg-white">
        {event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {event.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="inline-flex items-center bg-[#FFD84D] text-[#111827] rounded-full px-2.5 py-0.5 text-xs font-medium">
                {tag}
              </span>
            ))}
            {event.tags.length > 3 && (
              <span className="inline-flex items-center bg-[#FFD84D] text-[#111827] rounded-full px-2.5 py-0.5 text-xs font-medium">
                +{event.tags.length - 3}
              </span>
            )}
          </div>
        )}

        <h3 className="font-bold text-lg text-[#111827] line-clamp-2 leading-snug">
          {event.title}
        </h3>

        <div className="space-y-1.5 mt-auto">
          <div className="flex items-center gap-1.5 text-sm text-[#6B7280]">
            <Clock className="h-3.5 w-3.5 flex-shrink-0 text-[#111827]" />
            <span>{formatTime(event.date, locale)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-[#6B7280]">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-[#111827]" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-[#6B7280]">
            <Users className="h-3.5 w-3.5 flex-shrink-0 text-[#111827]" />
            <span>
              {registrations} {t.home_registered}
              {spotsLeft > 0 && ` · ${spotsLeft} ${t.home_spots_left}`}
            </span>
          </div>
        </div>

        <div className="h-[3px] w-full rounded-full bg-[#F3F4F6] overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${fillPercent}%`, background: spotsLeft === 0 ? '#EF4444' : '#FFD84D' }}
          />
        </div>
      </div>

      {/* Footer button */}
      <Link
        href={`/events/${event.id}`}
        style={{
          display: 'block', width: '100%', padding: '12px',
          background: '#7BAAE8', color: 'white',
          borderRadius: '0 0 16px 16px',
          fontSize: 14, fontWeight: 600,
          textAlign: 'center', textDecoration: 'none',
          transition: 'background 200ms ease',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = '#5A8FD4')}
        onMouseLeave={e => (e.currentTarget.style.background = '#7BAAE8')}
      >
        {t.home_details}
      </Link>
    </div>
  );
}
