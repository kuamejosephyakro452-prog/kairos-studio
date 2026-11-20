import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ArrowUpRight, Mail, MessageCircle, X } from 'lucide-react';
import { DICTIONARY } from '@/i18n/translations';
import type { Locale } from '@/types/portfolio';
import { MonogramJK } from './MonogramJK';
import { Magnetic } from './Magnetic';

interface FullscreenNavProps {
  locale: Locale;
  onSwitchLocale: (next: Locale) => void;
}

export const FullscreenNav: React.FC<FullscreenNavProps> = ({ locale, onSwitchLocale }) => {
  const t = DICTIONARY[locale];
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const overlayRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const homePath = `/${locale}`;
  const isHome = location.pathname === homePath || location.pathname === `${homePath}/`;

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 30);
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docH > 0 ? Math.min(100, Math.max(0, (y / docH) * 100)) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [location.pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);

    if (overlayRef.current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.fromTo(
        overlayRef.current.querySelectorAll('.menu-cascade'),
        { y: 42, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, stagger: 0.06, ease: 'power3.out' }
      );
    }

    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const navLinks = [
    { id: 'services', code: '01', label: t.nav.services },
    { id: 'works', code: '02', label: t.nav.works },
    { id: 'founder', code: '03', label: t.nav.founder },
    { id: 'contact', code: '04', label: t.nav.contact },
  ];

  const jumpTo = (sectionId: string) => {
    setMenuOpen(false);
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

      {/* Barre de progression de lecture ultra-fine */}
      <div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-[70] h-[2.5px] bg-transparent"
      >
        <div
          className="bg-accent-gradient h-full transition-[width] duration-75"
          style={{ width: `${progress}%` }}
        />
      </div>

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[padding] duration-300 ${
          scrolled
            ? 'border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/95 py-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          {/* Marque + Monogramme JK */}
          <Link
            to={homePath}
            aria-label={locale === 'fr' ? 'KAIROS STUDIO — Accueil' : 'KAIROS STUDIO — Home'}
            className="group flex items-center gap-3 text-[var(--text-primary)]"
          >
            <MonogramJK
              size={38}
              showFrame
              className="transition-transform duration-300 group-hover:scale-105"
            />
            <div className="leading-none">
              <span className="font-display block text-base font-bold tracking-[0.18em] uppercase sm:text-lg">
                KAIROS
              </span>
              <span className="font-mono-tech mt-0.5 block text-[9px] tracking-[0.34em] uppercase text-[var(--accent-text)]">
                STUDIO
              </span>
            </div>
          </Link>

          {/* Liens rapides desktop discrets */}
          <nav
            aria-label={locale === 'fr' ? 'Navigation principale' : 'Primary navigation'}
            className="hidden items-center gap-7 md:flex"
          >
            {navLinks.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => jumpTo(item.id)}
                className="font-mono-tech cursor-pointer text-[11px] font-medium tracking-[0.18em] uppercase text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
              >
                <span className="mr-1.5 text-[var(--accent-text)]">{item.code}</span>
                {item.label}
              </button>
            ))}
          </nav>

          {/* Contrôles : Sélecteur FR/EN + Bouton Menu Plein Écran */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div
              role="group"
              aria-label={locale === 'fr' ? 'Sélecteur de langue' : 'Language selector'}
              className="flex items-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] p-0.5 font-mono-tech text-[10px] font-semibold tracking-[0.16em]"
            >
              <button
                type="button"
                onClick={() => onSwitchLocale('fr')}
                aria-pressed={locale === 'fr'}
                className={`cursor-pointer rounded-full px-2.5 py-1 ${
                  locale === 'fr'
                    ? 'bg-accent-gradient text-[var(--accent-on-solid)]'
                    : 'text-[var(--text-primary)] opacity-75 hover:opacity-100'
                }`}
              >
                FR
              </button>
              <button
                type="button"
                onClick={() => onSwitchLocale('en')}
                aria-pressed={locale === 'en'}
                className={`cursor-pointer rounded-full px-2.5 py-1 ${
                  locale === 'en'
                    ? 'bg-accent-gradient text-[var(--accent-on-solid)]'
                    : 'text-[var(--text-primary)] opacity-75 hover:opacity-100'
                }`}
              >
                EN
              </button>
            </div>

            <Magnetic strength={0.18}>
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-expanded={menuOpen}
                aria-label={menuOpen ? t.nav.close : t.nav.menu}
                className="inline-flex cursor-pointer items-center gap-2.5 rounded-full border border-[var(--border-strong)] bg-[var(--bg-card)] px-4 py-2 font-mono-tech text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--text-primary)] hover:border-[var(--accent-1)] hover:text-[var(--accent-text)]"
              >
                <span>{menuOpen ? t.nav.close : t.nav.menu}</span>
                {menuOpen ? (
                  <X className="h-3.5 w-3.5" />
                ) : (
                  <span className="flex flex-col gap-1" aria-hidden="true">
                    <span className="block h-[1.5px] w-4 bg-current" />
                    <span className="block h-[1.5px] w-2.5 bg-[var(--accent-1)]" />
                  </span>
                )}
              </button>
            </Magnetic>
          </div>
        </div>
      </header>

      {/* MENU PLEIN ÉCRAN ARCHITECTURAL */}
      {menuOpen && (
        <div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-[55] flex flex-col justify-between overflow-y-auto bg-[var(--bg-primary)] px-5 pt-24 pb-10 text-[var(--text-primary)] sm:px-8 lg:px-14"
        >
          <div className="bg-mesh-ambient pointer-events-none absolute inset-0 opacity-75" />

          <div className="relative mx-auto grid w-full max-w-[1440px] flex-1 gap-10 py-6 lg:grid-cols-12 lg:items-center">
            {/* Typographie géante en cascade */}
            <nav className="flex flex-col gap-2 lg:col-span-8">
              {navLinks.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => jumpTo(item.id)}
                  className="menu-cascade group flex cursor-pointer items-baseline justify-between border-b border-[var(--border-subtle)] py-4 text-left transition-colors hover:border-[var(--accent-1)]"
                >
                  <div className="flex items-baseline gap-5">
                    <span className="font-mono-tech text-xs font-semibold tracking-[0.22em] text-[var(--accent-text)]">
                      {item.code}
                    </span>
                    <span className="font-display text-[clamp(2.2rem,6.5vw,5.4rem)] font-bold leading-[1.02] tracking-[-0.02em] transition-transform duration-300 group-hover:translate-x-3 group-hover:text-accent-gradient">
                      {item.label}
                    </span>
                  </div>
                  <ArrowUpRight className="h-6 w-6 text-[var(--text-muted)] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-[var(--accent-1)] sm:h-8 sm:w-8" />
                </button>
              ))}
            </nav>

            {/* Colonne droite : signature & contact direct */}
            <div className="menu-cascade flex flex-col justify-between gap-8 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)]/75 p-7 backdrop-blur-xl lg:col-span-4">
              <div>
                <p className="font-mono-tech text-[10px] tracking-[0.26em] uppercase text-[var(--accent-text)]">
                  {t.nav.directAccess}
                </p>
                <p className="font-display mt-3 text-2xl font-bold leading-snug">
                  Turning Ideas Into Experiences.
                </p>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  Joseph Kouamé — {t.founder.role}
                </p>
              </div>

              <div className="space-y-3 text-sm">
                <a
                  href="https://wa.me/2250789501705"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-2xl bg-accent-gradient px-5 py-3.5 font-semibold text-[var(--accent-on-solid)] transition-transform hover:scale-[1.01]"
                >
                  <span className="inline-flex items-center gap-2.5">
                    <MessageCircle className="h-4 w-4" />
                    +225 07 89 50 17 05
                  </span>
                  <ArrowUpRight className="h-4 w-4" />
                </a>
                <a
                  href="mailto:kuamejosephyakro452@gmail.com"
                  className="flex items-center justify-between rounded-2xl border border-[var(--border-subtle)] px-5 py-3.5 text-[var(--text-primary)] transition-colors hover:border-[var(--accent-1)]"
                >
                  <span className="inline-flex items-center gap-2.5 truncate">
                    <Mail className="h-4 w-4 shrink-0 text-[var(--accent-text)]" />
                    <span className="truncate">kuamejosephyakro452@gmail.com</span>
                  </span>
                </a>
              </div>
            </div>
          </div>

          <div className="relative mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-4 border-t border-[var(--border-subtle)] pt-5 font-mono-tech text-[11px] tracking-[0.18em] uppercase text-[var(--text-muted)]">
            <span>KAIROS STUDIO · JK</span>
            <div className="flex gap-5">
              <Link
                to={locale === 'fr' ? '/fr/mentions-legales' : '/en/legal-notice'}
                className="hover:text-[var(--text-primary)]"
              >
                {t.footer.legalNotice}
              </Link>
              <Link
                to={locale === 'fr' ? '/fr/confidentialite' : '/en/privacy'}
                className="hover:text-[var(--text-primary)]"
              >
                {t.footer.privacyPolicy}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
