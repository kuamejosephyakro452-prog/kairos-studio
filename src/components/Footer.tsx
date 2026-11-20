import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, Mail, MessageCircle } from 'lucide-react';
import { DICTIONARY } from '@/i18n/translations';
import type { Locale } from '@/types/portfolio';
import { MonogramJK } from './MonogramJK';
import { Magnetic } from './Magnetic';

interface FooterProps {
  locale: Locale;
}

export const Footer: React.FC<FooterProps> = ({ locale }) => {
  const t = DICTIONARY[locale];
  const legalPath = locale === 'fr' ? '/fr/mentions-legales' : '/en/legal-notice';
  const privacyPath = locale === 'fr' ? '/fr/confidentialite' : '/en/privacy';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative overflow-hidden border-t border-[#E8C877]/15 bg-[#0B0B0C] text-[#F4EEE3]">
      <div className="gold-aura absolute -top-24 left-1/2 h-64 w-[42rem] -translate-x-1/2 opacity-50" />

      <div className="relative mx-auto max-w-[1440px] px-5 pt-20 pb-12 sm:px-8 lg:px-12">
        <div className="grid gap-12 border-b border-[#F4EEE3]/12 pb-16 lg:grid-cols-12">
          {/* Marque */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3.5">
              <MonogramJK size={46} showFrame />
              <div>
                <p className="font-display text-2xl tracking-[0.22em] uppercase text-[#F4EEE3]">
                  KAIROS STUDIO
                </p>
                <p className="mt-1 text-xs tracking-[0.18em] uppercase text-[#E8C877]">
                  {t.footer.signature}
                </p>
              </div>
            </div>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-[#BDB5A8]">
              {t.founder.name} — {t.founder.role}.
            </p>
          </div>

          {/* Navigation */}
          <div className="lg:col-span-3">
            <p className="text-[11px] font-semibold tracking-[0.26em] uppercase text-[#E8C877]">
              {t.footer.navigation}
            </p>
            <ul className="mt-5 space-y-3 text-sm text-[#BDB5A8]">
              <li>
                <Link to={`/${locale}#services`} className="transition-colors hover:text-[#F4EEE3]">
                  {t.nav.services}
                </Link>
              </li>
              <li>
                <Link to={`/${locale}#works`} className="transition-colors hover:text-[#F4EEE3]">
                  {t.nav.works}
                </Link>
              </li>
              <li>
                <Link to={`/${locale}#founder`} className="transition-colors hover:text-[#F4EEE3]">
                  {t.nav.founder}
                </Link>
              </li>
              <li>
                <Link to={`/${locale}#skills`} className="transition-colors hover:text-[#F4EEE3]">
                  {t.nav.skills}
                </Link>
              </li>
              <li>
                <Link to={`/${locale}#contact`} className="transition-colors hover:text-[#F4EEE3]">
                  {t.nav.contact}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact direct (aucun lien de réseau social) */}
          <div className="lg:col-span-4">
            <p className="text-[11px] font-semibold tracking-[0.26em] uppercase text-[#E8C877]">
              {t.footer.directContact}
            </p>
            <div className="mt-5 space-y-3.5 text-sm">
              <a
                href="mailto:kuamejosephyakro452@gmail.com"
                className="flex items-center gap-3 text-[#F4EEE3]/90 transition-colors hover:text-[#E8C877]"
              >
                <Mail className="h-4 w-4 text-[#E8C877]" />
                <span className="break-all">kuamejosephyakro452@gmail.com</span>
              </a>
              <a
                href="https://wa.me/2250789501705"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-[#F4EEE3]/90 transition-colors hover:text-[#E8C877]"
              >
                <MessageCircle className="h-4 w-4 text-[#E8C877]" />
                <span>+225 07 89 50 17 05</span>
              </a>
            </div>

            <div className="mt-8">
              <Magnetic>
                <button
                  type="button"
                  onClick={scrollToTop}
                  className="inline-flex cursor-pointer items-center gap-2.5 rounded-full border border-[#E8C877]/35 px-5 py-2.5 text-xs font-medium tracking-[0.18em] uppercase text-[#E8C877] transition-colors hover:border-[#E8C877] hover:bg-[#E8C877] hover:text-[#0B0B0C]"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                  {t.footer.backToTop}
                </button>
              </Magnetic>
            </div>
          </div>
        </div>

        {/* Wordmark éditorial monumental */}
        <div
          aria-hidden="true"
          className="pointer-events-none select-none overflow-hidden py-8 text-center"
        >
          <span className="font-display text-[clamp(3.2rem,13vw,11.5rem)] font-light leading-none tracking-[0.16em] uppercase text-[#F4EEE3]/[0.055]">
            KAIROS STUDIO
          </span>
        </div>

        {/* Bas de page légal */}
        <div className="flex flex-col items-start justify-between gap-4 border-t border-[#F4EEE3]/10 pt-6 text-xs text-[#BDB5A8] sm:flex-row sm:items-center">
          <p>{t.footer.rights}</p>
          <div className="flex flex-wrap items-center gap-6">
            <Link to={legalPath} className="transition-colors hover:text-[#E8C877]">
              {t.footer.legalNotice}
            </Link>
            <Link to={privacyPath} className="transition-colors hover:text-[#E8C877]">
              {t.footer.privacyPolicy}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
