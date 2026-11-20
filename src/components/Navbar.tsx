import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { DICTIONARY } from '@/i18n/translations';
import type { Locale, ThemeMode } from '@/types/portfolio';
import { MonogramJK } from './MonogramJK';

interface NavbarProps {
  locale: Locale;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onSwitchLocale: (next: Locale) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  locale,
  theme,
  onToggleTheme,
  onSwitchLocale,
}) => {
  const t = DICTIONARY[locale];
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 36);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.hash]);

  const homePath = `/${locale}`;
  const isHome = location.pathname === homePath || location.pathname === `${homePath}/`;

  const navItems = [
    { id: 'services', label: t.nav.services },
    { id: 'works', label: t.nav.works },
    { id: 'founder', label: t.nav.founder },
    { id: 'skills', label: t.nav.skills },
    { id: 'contact', label: t.nav.contact },
  ];

  const handleAnchorClick = (sectionId: string) => {
    setMobileOpen(false);
    if (isHome) {
      const target = document.getElementById(sectionId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    navigate(`${homePath}#${sectionId}`);
  };

  return (
    <>
      <a href="#main-content" className="skip-to-content">
        {t.nav.skipToContent}
      </a>

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'border-b border-[#E8C877]/15 bg-[#0B0B0C]/88 py-3 backdrop-blur-md'
            : 'bg-gradient-to-b from-[#0B0B0C]/75 via-[#0B0B0C]/35 to-transparent py-5'
        }`}
      >
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          {/* Identité & Monogramme JK */}
          <Link
            to={homePath}
            className="group flex items-center gap-3 text-[#F4EEE3]"
            aria-label={locale === 'fr' ? 'KAIROS STUDIO — Accueil' : 'KAIROS STUDIO — Home'}
          >
            <MonogramJK
              size={38}
              showFrame
              className="transition-transform duration-500 group-hover:scale-105"
            />
            <div className="leading-none">
              <span className="block font-display text-lg font-medium tracking-[0.22em] uppercase text-[#F4EEE3] sm:text-xl">
                KAIROS
              </span>
              <span className="mt-0.5 block text-[9px] font-medium tracking-[0.34em] uppercase text-[#E8C877]">
                STUDIO
              </span>
            </div>
          </Link>

          {/* Navigation desktop */}
          <nav
            aria-label={locale === 'fr' ? 'Navigation principale' : 'Primary navigation'}
            className="hidden items-center gap-8 lg:flex"
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleAnchorClick(item.id)}
                className="relative cursor-pointer py-1 text-xs font-medium tracking-[0.2em] uppercase text-[#F4EEE3]/85 transition-colors hover:text-[#E8C877]"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Contrôles : Langue FR/EN + Thème + Menu mobile */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Sélecteur de langue */}
            <div
              role="group"
              aria-label="Language selector"
              className="flex items-center rounded-full border border-[#F4EEE3]/18 bg-[#0B0B0C]/60 p-0.5 text-[11px] font-semibold tracking-[0.16em]"
            >
              <button
                type="button"
                onClick={() => onSwitchLocale('fr')}
                aria-pressed={locale === 'fr'}
                className={`cursor-pointer rounded-full px-2.5 py-1 transition-colors ${
                  locale === 'fr'
                    ? 'bg-[#E8C877] text-[#0B0B0C]'
                    : 'text-[#F4EEE3]/75 hover:text-[#F4EEE3]'
                }`}
              >
                FR
              </button>
              <button
                type="button"
                onClick={() => onSwitchLocale('en')}
                aria-pressed={locale === 'en'}
                className={`cursor-pointer rounded-full px-2.5 py-1 transition-colors ${
                  locale === 'en'
                    ? 'bg-[#E8C877] text-[#0B0B0C]'
                    : 'text-[#F4EEE3]/75 hover:text-[#F4EEE3]'
                }`}
              >
                EN
              </button>
            </div>

            {/* Sélecteur de thème clair / sombre */}
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={
                locale === 'fr'
                  ? theme === 'editorial'
                    ? `Passer en mode ${t.nav.themeNocturne}`
                    : `Passer en mode ${t.nav.themeEditorial}`
                  : theme === 'editorial'
                    ? `Switch to ${t.nav.themeNocturne} theme`
                    : `Switch to ${t.nav.themeEditorial} theme`
              }
              title={theme === 'editorial' ? t.nav.themeNocturne : t.nav.themeEditorial}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#F4EEE3]/18 bg-[#0B0B0C]/60 text-[#E8C877] transition-colors hover:border-[#E8C877]/60 hover:bg-[#17171A]"
            >
              {theme === 'editorial' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            {/* Bouton menu mobile */}
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? t.nav.closeMenu : t.nav.openMenu}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#F4EEE3]/18 bg-[#0B0B0C]/60 text-[#F4EEE3] lg:hidden"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Menu mobile plein écran */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 flex flex-col justify-between bg-[#0B0B0C]/98 px-6 pt-28 pb-10 text-[#F4EEE3] backdrop-blur-xl lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <nav className="flex flex-col gap-5">
            {navItems.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleAnchorClick(item.id)}
                className="flex items-baseline gap-4 border-b border-[#F4EEE3]/10 pb-4 text-left"
              >
                <span className="text-xs font-medium tracking-[0.2em] text-[#E8C877]">
                  0{idx + 1}
                </span>
                <span className="font-display text-4xl font-light tracking-wide text-[#F4EEE3]">
                  {item.label}
                </span>
              </button>
            ))}
          </nav>

          <div className="space-y-3 border-t border-[#F4EEE3]/12 pt-6 text-xs text-[#BDB5A8]">
            <p className="tracking-[0.2em] uppercase text-[#E8C877]">
              Turning Ideas Into Experiences.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://wa.me/2250789501705"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-[#E8C877]/50 underline-offset-4 hover:text-[#F4EEE3]"
              >
                WhatsApp +225 07 89 50 17 05
              </a>
              <a
                href="mailto:kuamejosephyakro452@gmail.com"
                className="underline decoration-[#E8C877]/50 underline-offset-4 hover:text-[#F4EEE3]"
              >
                kuamejosephyakro452@gmail.com
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
