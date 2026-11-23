import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { DICTIONARY } from '@/i18n/translations';
import { SeoHead } from '@/components/SeoHead';
import { scrollToY } from '@/lib/scrollControl';
import type { Locale } from '@/types/portfolio';

interface LegalPageProps {
  locale: Locale;
  kind: 'legal' | 'privacy';
}

export const LegalPage: React.FC<LegalPageProps> = ({ locale, kind }) => {
  const t = DICTIONARY[locale];

  useEffect(() => {
    scrollToY(0, { immediate: true });
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

      <main
        id="main-content"
        className="min-h-[82vh] bg-[var(--bg-primary)] pt-32 pb-24 text-[var(--text-primary)] sm:pt-40"
      >
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <Link
            to={`/${locale}`}
            className="font-mono-tech inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-[var(--accent-text)] hover:opacity-75"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t.legal.backHome}</span>
          </Link>

          <h1 className="font-display mt-8 text-[clamp(2.4rem,5.5vw,4.4rem)] font-bold leading-tight">
            {title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[var(--text-muted)]">{intro}</p>

          <div className="mt-12 space-y-10 border-t border-[var(--border-subtle)] pt-10">
            {sections.map((section) => (
              <section key={section.heading} className="space-y-3">
                <h2 className="font-display text-2xl font-bold">{section.heading}</h2>
                {section.paragraphs.map((p, idx) => (
                  <p key={idx} className="text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
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
