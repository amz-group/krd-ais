import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Camera, ImagePlus, History as HistoryIcon, Database, Hand, LogOut } from 'lucide-react';
import { useLang } from '@/lib/i18n';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeToggle from '@/components/ThemeToggle';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

const navItems = [
  { to: '/', key: 'nav.dashboard', icon: LayoutDashboard },
  { to: '/translate', key: 'nav.translate', icon: Camera },
  { to: '/upload', key: 'nav.upload', icon: ImagePlus },
  { to: '/history', key: 'nav.history', icon: HistoryIcon },
  { to: '/dataset', key: 'nav.dataset', icon: Database }
];

export default function Layout() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const subtitle = lang === 'ku' ? t('brand.subtitleKu') : lang === 'ar' ? t('brand.subtitleAr') : t('brand.subtitleEn');

  const logout = async () => {
    await base44.auth.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="hidden md:flex fixed inset-y-0 start-0 w-64 flex-col border-e border-border bg-card/50 backdrop-blur">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="grid place-items-center h-11 w-11 rounded-2xl brand-gradient text-white shadow-lg shadow-primary/20">
              <Hand className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <div className="text-lg font-extrabold tracking-tight leading-none">KRD AI</div>
              <div className="text-[11px] text-muted-foreground mt-1 leading-tight">{subtitle}</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}>
              <item.icon className="h-5 w-5" />
              <span>{t(item.key)}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
          <Button variant="ghost" onClick={logout} className="w-full justify-start gap-2">
            <LogOut className="h-4 w-4" /> {t('common.logout')}
          </Button>
        </div>
      </aside>

      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-border bg-card/80 backdrop-blur px-4 h-16">
        <div className="flex items-center gap-2">
          <div className="grid place-items-center h-9 w-9 rounded-xl brand-gradient text-white">
            <Hand className="h-5 w-5" />
          </div>
          <div className="font-extrabold text-base leading-none">KRD AI</div>
        </div>
        <div className="flex items-center gap-1.5">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>

      <main className="md:ps-64 pb-24 md:pb-8 min-h-screen">
        <div className="mx-auto max-w-5xl px-4 md:px-8 py-6 md:py-10">
          <Outlet />
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-border bg-card/90 backdrop-blur grid grid-cols-5">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => `flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
            <item.icon className="h-5 w-5" />
            <span className="truncate max-w-full px-1">{t(item.key)}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}