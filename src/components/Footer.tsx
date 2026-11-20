import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, ArrowUpRight, Mail, MessageCircle } from 'lucide-react';
import { DICTIONARY } from '@/i18n/translations';
import type { Locale } from '@/types/portfolio';
import { MonogramJK } from './MonogramJK';
import { Magnetic } from './Magnetic';

const WORDMARK = 'KAIROS STUDIO';

/**
 * Pied de page spectaculaire :
 * Grand wordmark interactif dont chaque lettre réagit individuellement au curseur + appel au contact.
 */
export const Footer: React.FC<{ locale: Locale }> = ({ locale }) => {
  const t = DICTIONARY[locale];
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const legalPath = locale === 'fr' ? '/fr/mentions-legales' : '/en/legal-notice';
  const privacyPath = locale === 'fr' ? '/fr/confidentialite' : '/en/privacy';

  return (
    <footer className="relative overflow-hidden border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-primary)]">
      <div className="bg-mesh-ambient pointer-events-none absolute inset-0 opacity-50" />

      <div className="relative z-10 mx-auto max-w-[1440px] px-5 pt-20 pb-24 sm:px-8 sm:pb-16 lg:px-12">
        {/* Bandeau CTA final */}
        <div className="grid gap-8 border-b border-[var(--border-subtle)] pb-14 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="font-mono-tech text-[11px] font-semibold tracking-[0.26em] uppercase text-[var(--accent-text)]">
              {t.footer.ctaEyebrow}
            </p>
            <h2 className="font-display mt-3 text-[clamp(2rem,4.6vw,4rem)] font-bold leading-[1.02] tracking-[-0.025em]">
              {t.footer.ctaTitle}
            </h2>
          </div>
          <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
            <Magnetic>
              <a
                href="https://wa.me/2250789501705"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 rounded-full bg-accent-gradient px-6 py-3.5 font-mono-tech text-xs font-bold tracking-[0.16em] uppercase text-[var(--accent-on-solid)]"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{t.footer.ctaButton}</span>
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </Magnetic>
          </div>
        </div>

        {/* Colonnes infos */}
        <div className="grid gap-10 py-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3.5">
              <MonogramJK size={44} showFrame />
              <div>
                <p className="font-display text-xl font-bold tracking-[0.16em] uppercase">
                  KAIROS STUDIO
                </p>
                <p className="font-serif-accent text-sm italic text-[var(--accent-text)]">
                  {t.footer.signature}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-[var(--text-muted)]">
              {t.founder.name} — {t.founder.role}
            </p>
          </div>

          <div className="lg:col-span-3">
            <p className="font-mono-tech text-[10px] font-semibold tracking-[0.24em] uppercase text-[var(--accent-text)]">
              {t.footer.navigation}
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-[var(--text-muted)]">
              <li>
                <Link to={`/${locale}#services`} className="hover:text-[var(--text-primary)]">
                  {t.nav.services}
                </Link>
              </li>
              <li>
                <Link to={`/${locale}#works`} className="hover:text-[var(--text-primary)]">
                  {t.nav.works}
                </Link>
              </li>
              <li>
                <Link to={`/${locale}#founder`} className="hover:text-[var(--text-primary)]">
                  {t.nav.founder}
                </Link>
              </li>
              <li>
                <Link to={`/${locale}#contact`} className="hover:text-[var(--text-primary)]">
                  {t.nav.contact}
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-4">
            <p className="font-mono-tech text-[10px] font-semibold tracking-[0.24em] uppercase text-[var(--accent-text)]">
              {t.footer.directContact}
            </p>
            <div className="mt-4 space-y-3 text-sm">
              <a
                href="mailto:kuamejosephyakro452@gmail.com"
                className="flex items-center gap-3 text-[var(--text-primary)] hover:text-[var(--accent-text)]"
              >
                <Mail className="h-4 w-4 text-[var(--accent-1)]" />
                <span className="break-all">kuamejosephyakro452@gmail.com</span>
              </a>
              <a
                href="https://wa.me/2250789501705"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-[var(--text-primary)] hover:text-[var(--accent-text)]"
              >
                <MessageCircle className="h-4 w-4 text-[var(--accent-1)]" />
                <span>+225 07 89 50 17 05</span>
              </a>
            </div>
          </div>
        </div>

        {/* GRAND WORDMARK INTERACTIF QUI RÉAGIT LETTRE PAR LETTRE AU CURSEUR (groupé par mots, zéro coupure mid-word) */}
        <div
          onMouseLeave={() => setHoveredIdx(null)}
          className="select-none overflow-hidden border-y border-[var(--border-subtle)] py-6 text-center"
        >
          <p
            aria-label="KAIROS STUDIO"
            className="font-display flex flex-wrap items-center justify-center gap-x-[0.36em] gap-y-2 text-[clamp(2.5rem,10vw,9.2rem)] font-extrabold leading-[0.92] tracking-[-0.03em]"
          >
            {WORDMARK.split(' ').map((word, wIdx) => {
              const offset = wIdx === 0 ? 0 : WORDMARK.indexOf(' ') + 1;
              return (
                <span key={word} className="inline-flex whitespace-nowrap">
                  {word.split('').map((char, cIdx) => {
                    const idx = offset + cIdx;
                    const dist = hoveredIdx === null ? 99 : Math.abs(hoveredIdx - idx);
                    const lift = dist === 0 ? -14 : dist === 1 ? -7 : dist === 2 ? -2 : 0;
                    const isLit = dist <= 1;

                    return (
                      <span
                        key={`${word}-${cIdx}`}
                        onMouseEnter={() => setHoveredIdx(idx)}
                        className={`inline-block transition-all duration-300 ease-out will-change-transform ${
                          isLit ? 'text-accent-gradient' : 'text-[var(--text-primary)]/90'
                        }`}
                        style={{
                          transform: `translateY(${lift}px) scale(${dist === 0 ? 1.07 : 1})`,
                        }}
                      >
                        {char}
                      </span>
                    );
                  })}
                </span>
              );
            })}
          </p>
        </div>

        {/* Bas légal + retour haut */}
        <div className="mt-6 flex flex-col items-start justify-between gap-4 font-mono-tech text-[11px] text-[var(--text-muted)] sm:flex-row sm:items-center">
          <p>{t.footer.rights}</p>
          <div className="flex flex-wrap items-center gap-6">
            <Link to={legalPath} className="hover:text-[var(--text-primary)]">
              {t.footer.legalNotice}
            </Link>
            <Link to={privacyPath} className="hover:text-[var(--text-primary)]">
              {t.footer.privacyPolicy}
            </Link>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[var(--border-subtle)] px-3.5 py-1.5 uppercase tracking-[0.16em] text-[var(--text-primary)] hover:border-[var(--accent-1)]"
            >
              <ArrowUp className="h-3 w-3 text-[var(--accent-1)]" />
              <span>{t.footer.backToTop}</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
