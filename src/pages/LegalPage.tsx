import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { DICTIONARY } from '@/i18n/translations';
import { SeoHead } from '@/components/SeoHead';
import type { Locale } from '@/types/portfolio';

interface LegalPageProps {
  locale: Locale;
  kind: 'legal' | 'privacy';
}

export const LegalPage: React.FC<LegalPageProps> = ({ locale, kind }) => {
  const t = DICTIONARY[locale];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [kind, locale]);

  const title = kind === 'legal' ? t.legal.legalNoticeTitle : t.legal.privacyTitle;
  const intro = kind === 'legal' ? t.legal.legalNoticeIntro : t.legal.privacyIntro;
  const sections = kind === 'legal' ? t.legal.legalSections : t.legal.privacySections;

  const canonicalPath =
    kind === 'legal'
      ? locale === 'fr'
        ? '/fr/mentions-legales'
        : '/en/legal-notice'
      : locale === 'fr'
        ? '/fr/confidentialite'
        : '/en/privacy';

  return (
    <>
      <SeoHead
        title={kind === 'legal' ? t.meta.legalTitle : t.meta.privacyTitle}
        description={intro}
        locale={locale}
        canonicalPath={canonicalPath}
        alternateFrPath={kind === 'legal' ? '/fr/mentions-legales' : '/fr/confidentialite'}
        alternateEnPath={kind === 'legal' ? '/en/legal-notice' : '/en/privacy'}
      />

      <main id="main-content" className="section-light min-h-[82vh] pt-36 pb-24">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <Link
            to={`/${locale}`}
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.22em] uppercase text-[var(--gold-accessible-on-light)] hover:opacity-75"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t.legal.backHome}</span>
          </Link>

          <h1 className="mt-8 font-display text-[clamp(2.6rem,5.5vw,4.5rem)] font-light leading-tight">
            {title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[var(--text-on-light-muted)]">
            {intro}
          </p>

          <div className="mt-12 space-y-10 border-t border-[var(--border-on-light)] pt-10">
            {sections.map((section) => (
              <section key={section.heading} className="space-y-3">
                <h2 className="font-display text-2xl font-medium">{section.heading}</h2>
                {section.paragraphs.map((p, idx) => (
                  <p
                    key={idx}
                    className="text-sm leading-relaxed text-[var(--text-on-light-muted)] sm:text-base"
                  >
                    {p}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </div>
      </main>
    </>
  );
};
