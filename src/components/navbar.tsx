'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, LogOut, LayoutDashboard, Shield, ChevronDown, User, CalendarDays, Mic, MapPin } from 'lucide-react';
import { PodiiaIcon, PodiiaWordmark } from '@/components/podiia-logo';
import { useState, useEffect } from 'react';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useLanguage } from '@/contexts/language';
import { getAvatarColor } from '@/lib/avatar-color';
import { Toast } from '@/components/toast';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ToastConfig { message: string; icon: React.ReactNode; }

export function Navbar() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [toast, setToast] = useState<ToastConfig | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const initials = session?.user?.name
    ?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) ?? '?';

  const { bg: avatarBg, text: avatarText } = getAvatarColor(session?.user?.name ?? '');

  const PAGE_TOASTS: Record<string, ToastConfig> = {
    '/':                  { message: t.toast_events,     icon: <MapPin          style={{ width: 14, height: 14, color: '#B8860B' }} /> },
    '/speaker/materials': { message: t.toast_speakers,   icon: <Mic             style={{ width: 14, height: 14, color: '#7BAAE8' }} /> },
    '/dashboard':         { message: t.toast_organizers, icon: <LayoutDashboard style={{ width: 14, height: 14, color: '#7BAAE8' }} /> },
    '/admin':             { message: t.toast_admin,      icon: <Shield          style={{ width: 14, height: 14, color: '#1E293B' }} /> },
    '/profile':           { message: t.toast_profile,    icon: <User            style={{ width: 14, height: 14, color: '#6B7280' }} /> },
    '/my-events':         { message: t.toast_my_events,  icon: <CalendarDays    style={{ width: 14, height: 14, color: '#7BAAE8' }} /> },
  };

  const handleNavClick = (href: string): boolean => {
    const isCurrent = href === '/' ? pathname === '/' : pathname.startsWith(href);
    if (isCurrent) {
      setToast(PAGE_TOASTS[href] ?? { message: t.toast_fallback, icon: <MapPin style={{ width: 14, height: 14, color: '#B8860B' }} /> });
      return false;
    }
    return true;
  };

  const navigate = (href: string) => {
    if (handleNavClick(href)) router.push(href);
  };

  const navBtnCls = 'nav-link text-sm font-medium text-[#374151] hover:text-[#111827] transition-colors cursor-pointer bg-transparent border-none p-0';

  return (
    <>
      <nav className={`ua-navbar sticky top-0 z-40 w-full transition-shadow duration-300 ${scrolled ? 'shadow-md' : 'shadow-sm'}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative flex h-14 items-center">

            {/* Logo — flex-1 left */}
            <div className="flex-1">
              <Link href="/" className="flex items-center gap-2 logo-text w-fit px-1 overflow-visible">
                <PodiiaIcon size={22} />
                <PodiiaWordmark textSize="text-lg" />
              </Link>
            </div>

            {/* Center nav — desktop only, absolute center */}
            <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-5">
              <button className={navBtnCls} onClick={() => navigate('/')}>
                {t.nav_events}
              </button>
              <button className={navBtnCls} onClick={() => navigate('/speaker/materials')}>
                {t.nav_for_speakers}
              </button>
              {(session?.user.role === 'ORGANIZER' || session?.user.role === 'ADMIN') && (
                <button className={navBtnCls} onClick={() => navigate('/dashboard')}>
                  {t.nav_for_organizers}
                </button>
              )}
            </div>

            {/* Right side */}
            <div className="flex-1 flex items-center justify-end gap-2">

              {/* Desktop: lang switcher + auth */}
              <div className="hidden lg:flex items-center gap-2">
                <LanguageSwitcher />

                {session ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-1.5 rounded-full bg-white border border-[#E5E7EB] px-2.5 py-1 text-sm font-semibold text-[#111827] hover:bg-[#F9FAFB] transition-colors outline-none shadow-sm">
                        <div
                          className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                          style={{ backgroundColor: avatarBg, color: avatarText }}
                        >
                          {initials}
                        </div>
                        <span className="hidden sm:inline max-w-[100px] truncate">{session.user.name}</span>
                        <ChevronDown className="h-3 w-3 text-[#6B7280]" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52 bg-white border border-[#E5E7EB] shadow-lg">
                      <DropdownMenuLabel className="text-xs text-[#6B7280] font-normal">
                        {session.user.email}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {(session.user.role === 'ORGANIZER' || session.user.role === 'ADMIN') && (
                        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer"
                          onClick={() => navigate('/dashboard')}>
                          <LayoutDashboard className="h-4 w-4" />{t.nav_dashboard}
                        </DropdownMenuItem>
                      )}
                      {session.user.role === 'ADMIN' && (
                        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer"
                          onClick={() => navigate('/admin')}>
                          <Shield className="h-4 w-4" />{t.nav_admin}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="flex items-center gap-2 cursor-pointer"
                        onClick={() => navigate('/my-events')}>
                        <CalendarDays className="h-4 w-4" />{t.nav_my_events}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2 cursor-pointer"
                        onClick={() => navigate('/profile')}>
                        <User className="h-4 w-4" />{t.nav_profile}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="text-red-600 focus:text-red-600 cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />{t.nav_logout}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link href="/auth/login" className="text-sm font-medium text-[#374151] hover:text-[#111827] transition-colors duration-200 no-underline" style={{ textDecoration: 'none' }}>
                      {t.nav_login}
                    </Link>
                    <Link href="/auth/register" className="text-sm font-semibold bg-[#1E293B] text-white hover:bg-[#0F172A] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-95 px-4 py-2 rounded-lg">
                      {t.nav_register}
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile: hamburger */}
              <button
                className="lg:hidden p-1.5 rounded-lg text-[#374151] hover:bg-[#F3F4F6] transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-[#F3F4F6] bg-white px-4 py-4 space-y-1">

            {/* Nav links */}
            <button
              className="flex items-center gap-2 text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] px-3 py-2.5 rounded-lg transition-colors w-full text-left"
              onClick={() => { setMobileOpen(false); navigate('/'); }}
            >
              {t.nav_events}
            </button>
            <button
              className="flex items-center gap-2 text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] px-3 py-2.5 rounded-lg transition-colors w-full text-left"
              onClick={() => { setMobileOpen(false); navigate('/speaker/materials'); }}
            >
              {t.nav_for_speakers}
            </button>
            {session && (
              <button
                className="flex items-center gap-2 text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] px-3 py-2.5 rounded-lg transition-colors w-full text-left"
                onClick={() => { setMobileOpen(false); navigate('/my-events'); }}
              >
                <CalendarDays className="h-4 w-4" /> {t.nav_my_events}
              </button>
            )}
            {(session?.user.role === 'ORGANIZER' || session?.user.role === 'ADMIN') && (
              <button
                className="flex items-center gap-2 text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] px-3 py-2.5 rounded-lg transition-colors w-full text-left"
                onClick={() => { setMobileOpen(false); navigate('/dashboard'); }}
              >
                <LayoutDashboard className="h-4 w-4" /> {t.nav_dashboard}
              </button>
            )}
            {session?.user.role === 'ADMIN' && (
              <button
                className="flex items-center gap-2 text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] px-3 py-2.5 rounded-lg transition-colors w-full text-left"
                onClick={() => { setMobileOpen(false); navigate('/admin'); }}
              >
                <Shield className="h-4 w-4" /> {t.nav_admin}
              </button>
            )}
            {session && (
              <button
                className="flex items-center gap-2 text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] px-3 py-2.5 rounded-lg transition-colors w-full text-left"
                onClick={() => { setMobileOpen(false); navigate('/profile'); }}
              >
                <User className="h-4 w-4" /> {t.nav_profile}
              </button>
            )}

            {/* Divider */}
            <div className="border-t border-[#F3F4F6] my-2" />

            {/* Lang + auth */}
            <div className="flex items-center justify-between px-3 py-2">
              <LanguageSwitcher />
              {session ? (
                <button
                  onClick={() => { signOut({ callbackUrl: '/' }); setMobileOpen(false); }}
                  className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" /> {t.nav_logout}
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/auth/login" className="text-sm font-medium text-[#374151] px-3 py-1.5 rounded-lg hover:bg-[#F9FAFB]" style={{ textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>
                    {t.nav_login}
                  </Link>
                  <Link href="/auth/register" className="text-sm font-semibold bg-[#1E293B] text-white px-4 py-2 rounded-lg hover:bg-[#0F172A] transition-colors" style={{ textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>
                    {t.nav_register}
                  </Link>
                </div>
              )}
            </div>

          </div>
        )}
      </nav>

      {toast && <Toast message={toast.message} icon={toast.icon} onClose={() => setToast(null)} />}
    </>
  );
}
