import React from 'react';
import { DICTIONARY } from '@/i18n/translations';
import type { Locale } from '@/types/portfolio';

export const KineticMarquee: React.FC<{ locale: Locale }> = ({ locale }) => {
  const t = DICTIONARY[locale];
  const r1 = [...t.marquee.row1, ...t.marquee.row1];
  const r2 = [...t.marquee.row2, ...t.marquee.row2];

  return (
    <section
      aria-label="KAIROS STUDIO"
      className="cv-auto overflow-hidden border-y border-[var(--border-subtle)] bg-[var(--bg-elevated)] py-10 text-[var(--text-primary)] sm:py-14"
    >
      <div className="marquee-left items-center gap-10">
        {r1.map((item, idx) => (
          <div key={`r1-${idx}`} className="flex items-center gap-10 whitespace-nowrap">
            <span className="font-display text-[clamp(2rem,5vw,4.5rem)] font-bold leading-none tracking-[-0.02em]">
              {item}
            </span>
            <span
              aria-hidden="true"
              className="h-3 w-3 rounded-full bg-accent-gradient"
            />
          </div>
        ))}
      </div>

      <div className="marquee-right mt-4 items-center gap-10">
        {r2.map((item, idx) => (
          <div key={`r2-${idx}`} className="flex items-center gap-10 whitespace-nowrap">
            <span className="font-display text-stroke-outline text-[clamp(1.8rem,4.6vw,4.1rem)] font-bold leading-none tracking-[-0.02em]">
              {item}
            </span>
            <span
              aria-hidden="true"
              className="font-mono-tech text-xs text-[var(--accent-text)]"
            >
              //
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};
