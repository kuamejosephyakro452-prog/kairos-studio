import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { DICTIONARY } from '@/i18n/translations';
import { SeoHead } from '@/components/SeoHead';
import { MonogramJK } from '@/components/MonogramJK';
import { Magnetic } from '@/components/Magnetic';
import type { Locale } from '@/types/portfolio';

export const NotFoundPage: React.FC<{ locale: Locale }> = ({ locale }) => {
  const t = DICTIONARY[locale];

  return (
    <>
      <SeoHead
        title={t.meta.notFoundTitle}
        description={t.notFound.subtitle}
        locale={locale}
        canonicalPath={`/${locale}`}
        noindex
      />

      <main
        id="main-content"
        className="relative flex min-h-[88vh] flex-col items-center justify-center overflow-hidden bg-[var(--bg-primary)] px-5 pt-28 pb-20 text-center text-[var(--text-primary)]"
      >
        <div className="bg-mesh-ambient pointer-events-none absolute inset-0 opacity-80" />

        <div className="relative z-10 max-w-2xl">
          <div className="mb-6 flex justify-center">
            <MonogramJK size={64} showFrame />
          </div>
          <p className="font-mono-tech text-xs font-semibold tracking-[0.3em] uppercase text-[var(--accent-text)]">
            {t.notFound.code}
          </p>
          <p
            aria-hidden="true"
            className="font-mono-tech mt-3 text-[clamp(5.2rem,18vw,12.5rem)] font-bold leading-[0.9] tracking-[-0.06em] text-accent-gradient opacity-85"
          >
            404
          </p>
          <h1 className="font-display mt-3 text-[clamp(2rem,5vw,3.8rem)] font-bold">
            {t.notFound.title}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
            {t.notFound.subtitle}
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Magnetic>
              <Link
                to={`/${locale}`}
                className="inline-flex items-center gap-2.5 rounded-full bg-accent-gradient px-7 py-3.5 font-mono-tech text-xs font-bold tracking-[0.18em] uppercase text-[var(--accent-on-solid)]"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{t.notFound.backHome}</span>
              </Link>
            </Magnetic>
            <Magnetic>
              <Link
                to={`/${locale}#works`}
                className="inline-flex items-center gap-2.5 rounded-full border border-[var(--border-strong)] px-7 py-3.5 font-mono-tech text-xs font-semibold tracking-[0.18em] uppercase text-[var(--text-primary)] hover:border-[var(--accent-1)]"
              >
                <span>{t.notFound.viewWorks}</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Magnetic>
          </div>
        </div>
      </main>
    </>
  );
};
