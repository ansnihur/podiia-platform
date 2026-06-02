'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, CalendarDays, Users, TrendingUp, RefreshCw, Mic, BookOpen } from 'lucide-react';
import { EventCard } from '@/components/event-card';
import { useLanguage } from '@/contexts/language';

const POPULAR_TAGS = ['AI', 'Workshop', 'Research', 'Social', 'Technology', 'Culture', 'Music', 'Science'];

interface Event {
  id: string; title: string; description: string;
  date: string; location: string; capacity: number;
  status: string; tags: string[]; imageUrl?: string | null;
  organizer?: { name: string } | null;
  _count?: { registrations: number };
}
interface Stats { eventsCount: number; usersCount: number; registrationsCount: number; }

export default function HomePage() {
  const { t, locale } = useLanguage();
  const [inputValue, setInputValue] = useState('');
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<Stats>({ eventsCount: 0, usersCount: 0, registrationsCount: 0 });
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    fetch('/api/stats', { cache: 'no-store' }).then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  const fetchEvents = (s: string, tg: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (s) params.set('search', s);
    if (tg) params.set('tag', tg);
    params.set('status', 'PUBLISHED');
    fetch(`/api/events?${params}`, { cache: 'no-store' }).then(r => r.json()).then(data => {
      setEvents(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchEvents(search, tag); }, [search, tag, key]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const onFocus = () => fetchEvents(search, tag);
    const onPageShow = (e: PageTransitionEvent) => { if (e.persisted) fetchEvents(search, tag); };
    window.addEventListener('focus', onFocus);
    window.addEventListener('pageshow', onPageShow);
    return () => { window.removeEventListener('focus', onFocus); window.removeEventListener('pageshow', onPageShow); };
  }, [search, tag]);

  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    document.querySelectorAll('.scroll-animate').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [events, loading]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setSearch(inputValue.trim()); };
  const clearFilters = () => { setSearch(''); setTag(''); setInputValue(''); };

  const eventsLabel   = locale === 'uk' ? 'заходів'    : 'events';
  const usersLabel    = locale === 'uk' ? 'учасників'  : 'users';

  return (
    <div className="ua-bg min-h-screen">

      {/* ── HERO ── */}
      <section
        className="relative overflow-hidden flex flex-col justify-center min-h-[60vh] md:h-[calc(100vh-64px)]"
        style={{ background: '#FEFBF0', borderBottom: '1px solid #F3F4F6' }}
      >
        {/* Blobs */}
        <div className="pointer-events-none absolute" style={{ right: '-180px', top: '40px', width: '480px', height: '480px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,216,77,0.18) 0%, transparent 70%)' }} />
        <div className="pointer-events-none absolute" style={{ left: '-120px', bottom: '-40px', width: '360px', height: '360px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,170,232,0.10) 0%, transparent 70%)' }} />

        {/* Desktop clouds — absolute positioned */}
        {!isMobile && (
          <>
            <div className="pointer-events-none absolute"
              style={{ left: '2%', top: '15%', animation: 'float 6s ease-in-out infinite', animationDelay: '0s', width: '280px' }}>
              <div style={{ position: 'relative', width: '280px' }}>
                <img src="/cloud.png" alt="" style={{ width: '100%', display: 'block', filter: 'brightness(1.1) drop-shadow(0 4px 12px rgba(255,216,77,0.25))' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <CalendarDays style={{ width: 20, height: 20, color: '#B8860B' }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#111827', textShadow: '0 1px 4px rgba(255,255,255,0.95), 0 0 8px rgba(255,255,255,0.8)' }}>{locale === 'uk' ? 'Конференції' : 'Conferences'}</span>
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute"
              style={{ right: '3%', top: '8%', animation: 'float 8s ease-in-out infinite', animationDelay: '1s', width: '175px' }}>
              <div style={{ position: 'relative', width: '175px' }}>
                <img src="/cloud.png" alt="" style={{ width: '100%', display: 'block', filter: 'brightness(1.1) drop-shadow(0 4px 12px rgba(123,170,232,0.25))' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <Mic style={{ width: 20, height: 20, color: '#7BAAE8' }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#111827', textShadow: '0 1px 4px rgba(255,255,255,0.95), 0 0 8px rgba(255,255,255,0.8)' }}>{locale === 'uk' ? 'Воркшопи' : 'Workshops'}</span>
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute"
              style={{ left: '1%', bottom: '20%', animation: 'float 7s ease-in-out infinite', animationDelay: '2s', width: '220px' }}>
              <div style={{ position: 'relative', width: '220px' }}>
                <img src="/cloud.png" alt="" style={{ width: '100%', display: 'block', filter: 'brightness(1.1) drop-shadow(0 4px 12px rgba(255,216,77,0.25))' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <Users style={{ width: 20, height: 20, color: '#16A34A' }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#111827', textShadow: '0 1px 4px rgba(255,255,255,0.95), 0 0 8px rgba(255,255,255,0.8)' }}>{locale === 'uk' ? 'Учасники' : 'Participants'}</span>
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute"
              style={{ right: '2%', top: '42%', animation: 'float 9s ease-in-out infinite', animationDelay: '0.5s', width: '250px' }}>
              <div style={{ position: 'relative', width: '250px' }}>
                <img src="/cloud.png" alt="" style={{ width: '100%', display: 'block', filter: 'brightness(1.1) drop-shadow(0 4px 12px rgba(123,170,232,0.25))' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <BookOpen style={{ width: 20, height: 20, color: '#7BAAE8' }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#111827', textShadow: '0 1px 4px rgba(255,255,255,0.95), 0 0 8px rgba(255,255,255,0.8)' }}>{locale === 'uk' ? 'Матеріали' : 'Materials'}</span>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="relative mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 flex flex-col gap-4 md:gap-6 py-8 md:py-0">

          {/* Title */}
          <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <h1 className="font-bold leading-none text-3xl md:text-5xl">
              <span className="text-[#111827]">{t.hero_title_1} </span>
              <span className="text-[#7BAAE8]">{t.hero_title_2} </span>
              <span className="text-[#FFD84D]">{t.hero_title_3}</span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-center text-base text-[#6B7280] max-w-xl mx-auto leading-relaxed animate-fade-in-up"
            style={{ animationDelay: '0.3s' }}>
            {t.hero_subtitle.split('\n').map((line, i, arr) => (
              <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
            ))}
          </p>

          {/* Mobile clouds — absolute scattered */}
          {isMobile && (
            <div style={{ position: 'relative', height: '200px', width: '100%' }}>

              {/* Хмаринка 1 — велика, зліва вгорі */}
              <div className="pointer-events-none" style={{ position: 'absolute', left: '0%', top: '0px', animation: 'float 6s ease-in-out infinite' }}>
                <div style={{ position: 'relative', width: '130px' }}>
                  <img src="/cloud.png" alt="" style={{ width: '100%', filter: 'brightness(1.15) drop-shadow(0 2px 8px rgba(255,216,77,0.4))' }} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                    <CalendarDays style={{ width: 16, height: 16, color: '#B8860B' }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#111827', textShadow: '0 1px 4px rgba(255,255,255,0.95), 0 0 8px rgba(255,255,255,0.8)' }}>{locale === 'uk' ? 'Конференції' : 'Conferences'}</span>
                  </div>
                </div>
              </div>

              {/* Хмаринка 2 — середня, справа вгорі */}
              <div className="pointer-events-none" style={{ position: 'absolute', right: '5%', top: '10px', animation: 'float 8s ease-in-out infinite 1s' }}>
                <div style={{ position: 'relative', width: '105px' }}>
                  <img src="/cloud.png" alt="" style={{ width: '100%', filter: 'brightness(1.2) drop-shadow(0 2px 8px rgba(123,170,232,0.4))' }} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                    <Mic style={{ width: 14, height: 14, color: '#7BAAE8' }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#111827', textShadow: '0 1px 4px rgba(255,255,255,0.95), 0 0 8px rgba(255,255,255,0.8)' }}>{locale === 'uk' ? 'Воркшопи' : 'Workshops'}</span>
                  </div>
                </div>
              </div>

              {/* Хмаринка 3 — велика, зліва знизу */}
              <div className="pointer-events-none" style={{ position: 'absolute', left: '10%', bottom: '0px', animation: 'float 7s ease-in-out infinite 2s' }}>
                <div style={{ position: 'relative', width: '115px' }}>
                  <img src="/cloud.png" alt="" style={{ width: '100%', filter: 'brightness(1.15) drop-shadow(0 2px 8px rgba(22,163,74,0.3))' }} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                    <Users style={{ width: 15, height: 15, color: '#16A34A' }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#111827', textShadow: '0 1px 4px rgba(255,255,255,0.95), 0 0 8px rgba(255,255,255,0.8)' }}>{locale === 'uk' ? 'Учасники' : 'Participants'}</span>
                  </div>
                </div>
              </div>

              {/* Хмаринка 4 — маленька, справа знизу */}
              <div className="pointer-events-none" style={{ position: 'absolute', right: '2%', bottom: '15px', animation: 'float 9s ease-in-out infinite 0.5s' }}>
                <div style={{ position: 'relative', width: '95px' }}>
                  <img src="/cloud.png" alt="" style={{ width: '100%', filter: 'brightness(1.2) drop-shadow(0 2px 8px rgba(123,170,232,0.3))' }} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                    <BookOpen style={{ width: 13, height: 13, color: '#7BAAE8' }} />
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#111827', textShadow: '0 1px 4px rgba(255,255,255,0.95), 0 0 8px rgba(255,255,255,0.8)' }}>{locale === 'uk' ? 'Матеріали' : 'Materials'}</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Search */}
          <div className="mx-auto w-full max-w-xl animate-fade-in-up" style={{ animationDelay: '0.45s' }}>
            <form onSubmit={handleSearch}>
              <div className="relative flex items-center">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF] pointer-events-none" />
                <input
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder={t.home_search_placeholder}
                  className="w-full py-3 rounded-full border border-[#E5E7EB] bg-white text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FFD84D] shadow-md"
                  style={{ paddingLeft: '2.75rem', paddingRight: '3.5rem' }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setSearch((e.target as HTMLInputElement).value.trim());
                      setTimeout(() => {
                        document.getElementById('events-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 100);
                    }
                  }}
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-[#FFD84D] hover:bg-[#FFC93C] flex items-center justify-center transition-colors flex-shrink-0 hover:translate-y-[-50%] hover:shadow-none" style={{ transform: 'translateY(-50%)' }}>
                  <Search className="h-3.5 w-3.5 text-[#111827]" />
                </button>
              </div>
            </form>
          </div>

          {/* Stats */}
          <div className="hidden sm:flex gap-2 flex-wrap justify-center animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            {[
              { icon: CalendarDays, value: stats.eventsCount,       label: t.home_live_events },
              { icon: Users,        value: stats.usersCount,         label: t.home_members },
              { icon: TrendingUp,   value: stats.registrationsCount, label: t.home_registrations },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-1.5 rounded-full bg-white border border-[#F3F4F6] px-4 py-2 shadow-sm">
                <Icon className="h-3.5 w-3.5 text-[#FFD84D] flex-shrink-0" />
                <span className="font-bold text-[#111827] text-xs">{value.toLocaleString()}</span>
                <span className="text-xs text-[#6B7280] hidden sm:inline">{label}</span>
              </div>
            ))}
          </div>

          {/* CTA button */}
          <div className="flex justify-center animate-fade-in-up" style={{ animationDelay: '0.75s' }}>
            <a href="#events-section"
              style={{ background: '#7BAAE8', color: 'white', borderRadius: 8, padding: '12px 28px', fontWeight: 600, fontSize: 14, textDecoration: 'none', transition: 'all 250ms ease', display: 'inline-block' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#5A8FD4'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#7BAAE8'; (e.currentTarget as HTMLAnchorElement).style.transform = ''; }}
            >
              {t.hero_find}
            </a>
          </div>

          {/* Value cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in-up" style={{ animationDelay: '0.9s' }}>

            {/* Organizers */}
            <div
              className="cursor-default"
              style={{ background: 'white', border: '1px solid #F3F4F6', borderRadius: 20, padding: 24, transition: 'all 300ms ease', display: 'flex', flexDirection: 'column' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = '#FFD84D'; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = '#F3F4F6'; el.style.transform = ''; el.style.boxShadow = ''; }}
            >
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#FFF9E6', border: '1.5px solid #FFD84D', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <CalendarDays style={{ width: 22, height: 22, color: '#B8860B' }} />
              </div>
              <h3 className="font-bold text-[#111827] text-sm mb-1">{t.hero_organizer_title}</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed" style={{ flex: 1, marginBottom: 12 }}>{t.hero_organizer_text}</p>
              <Link href="/auth/register" style={{ fontSize: 14, fontWeight: 600, color: '#7BAAE8', textDecoration: 'none', marginTop: 'auto' }}>
                {t.hero_organizer_link}
              </Link>
            </div>

            {/* Speakers */}
            <div
              className="cursor-default"
              style={{ background: 'white', border: '1px solid #F3F4F6', borderRadius: 20, padding: 24, transition: 'all 300ms ease', display: 'flex', flexDirection: 'column' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = '#FFD84D'; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = '#F3F4F6'; el.style.transform = ''; el.style.boxShadow = ''; }}
            >
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#EFF6FF', border: '1.5px solid #7BAAE8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Mic style={{ width: 22, height: 22, color: '#7BAAE8' }} />
              </div>
              <h3 className="font-bold text-[#111827] text-sm mb-1">{t.hero_speaker_title}</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed" style={{ flex: 1, marginBottom: 12 }}>{t.hero_speaker_text}</p>
              <Link href="/speaker/materials" style={{ fontSize: 14, fontWeight: 600, color: '#7BAAE8', textDecoration: 'none', marginTop: 'auto' }}>
                {t.hero_speaker_link}
              </Link>
            </div>

            {/* Participants */}
            <div
              className="cursor-default"
              style={{ background: 'white', border: '1px solid #F3F4F6', borderRadius: 20, padding: 24, transition: 'all 300ms ease', display: 'flex', flexDirection: 'column' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = '#FFD84D'; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = '#F3F4F6'; el.style.transform = ''; el.style.boxShadow = ''; }}
            >
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#F0FDF4', border: '1.5px solid #86EFAC', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Users style={{ width: 22, height: 22, color: '#16A34A' }} />
              </div>
              <h3 className="font-bold text-[#111827] text-sm mb-1">{t.hero_participant_title}</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed" style={{ flex: 1, marginBottom: 12 }}>{t.hero_participant_text}</p>
              <a href="#events-section" style={{ fontSize: 14, fontWeight: 600, color: '#7BAAE8', textDecoration: 'none', marginTop: 'auto' }}>
                {t.hero_participant_link}
              </a>
            </div>

          </div>

        </div>
      </section>

      {/* ── EVENTS ── */}
      <div id="events-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setTag('')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all hover:scale-105 active:scale-95 ${
              !tag
                ? 'bg-[#1E293B] text-white border-transparent'
                : 'bg-white border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB]'
            }`}
          >
            {t.home_filter_all}
          </button>
          {POPULAR_TAGS.map((tg) => (
            <button
              key={tg}
              onClick={() => setTag(tg === tag ? '' : tg)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all hover:scale-105 active:scale-95 ${
                tag === tg
                  ? 'bg-[#1E293B] text-white border-transparent'
                  : 'bg-white border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB]'
              }`}
            >
              {tg}
            </button>
          ))}
        </div>

        {/* Section header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-bold text-2xl text-[#111827]">
              {search ? `"${search}"` : tag ? tag : t.home_upcoming}
            </h2>
            <p className="text-sm text-[#6B7280] mt-0.5">{events.length} {t.home_found}</p>
          </div>
          <div className="flex items-center gap-2">
            {(search || tag) && (
              <button onClick={clearFilters} className="no-lift text-sm text-[#7BAAE8] font-medium hover:text-[#5A8FD4] transition-colors cursor-pointer">
                {t.home_clear}
              </button>
            )}
            <button
              onClick={() => setKey(prev => prev + 1)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-xs font-medium text-[#374151] transition-colors disabled:opacity-40"
            >
              <RefreshCw className="h-3.5 w-3.5" /> {t.home_refresh}
            </button>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="ua-event-card h-64">
                <div className="h-[200px] shimmer-bg" />
                <div className="p-4 space-y-2">
                  <div className="h-3 w-2/3 rounded-full shimmer-bg" />
                  <div className="h-4 w-full rounded-full shimmer-bg" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((event, index) => (
              <div key={event.id} className={`scroll-animate animate-stagger-${Math.min(index + 1, 6)}`}>
                <EventCard event={{ ...event, date: event.date }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="ua-card flex flex-col items-center justify-center py-16 text-center">
            <Search className="h-12 w-12 text-[#C8A000]/40 mb-3" />
            <h3 className="font-display text-xl font-semibold text-[#1a1a1a] mb-2">{t.home_no_events}</h3>
            <p className="text-[#1a1a1a]/60 mb-5 max-w-sm text-sm">{t.home_no_events_desc}</p>
            <button onClick={clearFilters} className="ua-btn-primary px-5 py-2 rounded-full text-sm font-semibold">
              {t.home_browse_all}
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
