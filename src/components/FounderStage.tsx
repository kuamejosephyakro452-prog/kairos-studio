import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { DICTIONARY } from '@/i18n/translations';
import type { Locale } from '@/types/portfolio';
import { InteractiveMonogramJK } from './InteractiveMonogramJK';
import { Magnetic } from './Magnetic';

export const FounderStage: React.FC<{ locale: Locale }> = ({ locale }) => {
  const t = DICTIONARY[locale];

  return (
    <section
      id="founder"
      className="relative overflow-hidden border-t border-[var(--border-subtle)] bg-[var(--bg-primary)] py-24 text-[var(--text-primary)] sm:py-36"
    >
      <div className="bg-mesh-ambient pointer-events-none absolute inset-0 opacity-45" />

      <div className="relative z-10 mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        {/* Bloc Fondateur : Joseph Kouamé + Monogramme JK sculptural */}
        <div className="grid gap-14 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <div className="flex flex-col items-center rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)]/75 px-6 py-10 backdrop-blur-xl sm:p-12">
              <InteractiveMonogramJK size="founder" />
              <div className="mt-6 text-center">
                <p className="font-display text-3xl font-bold">{t.founder.name}</p>
                <p className="font-mono-tech mt-1 text-[11px] font-semibold tracking-[0.22em] uppercase text-[var(--accent-text)]">
                  {t.founder.role}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <p className="font-mono-tech text-[11px] font-semibold tracking-[0.26em] uppercase text-[var(--accent-text)]">
              {t.founder.label}
            </p>
            <h2 className="font-display mt-4 text-[clamp(2.2rem,4.8vw,4.3rem)] font-bold leading-[1.02] tracking-[-0.025em]">
              {t.founder.headline}
            </h2>

            <div className="mt-8 space-y-4 text-base leading-relaxed text-[var(--text-muted)] sm:text-lg">
              <p>{t.founder.bio1}</p>
              <p>{t.founder.bio2}</p>
            </div>

            <div className="mt-10 grid gap-5 border-y border-[var(--border-subtle)] py-7 sm:grid-cols-3">
              {t.founder.pillars.map((p) => (
                <div key={p.code}>
                  <span className="font-mono-tech text-[10px] font-semibold tracking-[0.2em] text-[var(--accent-text)]">
                    {p.code}
                  </span>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    {p.label}
                  </p>
                  <p className="mt-1.5 text-sm font-semibold text-[var(--text-primary)]">
                    {p.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Magnetic>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-3 rounded-full bg-accent-gradient px-7 py-4 font-mono-tech text-xs font-bold tracking-[0.18em] uppercase text-[var(--accent-on-solid)] shadow-[0_12px_36px_var(--glow-primary)] transition-transform hover:scale-[1.02]"
                >
                  <span>{t.founder.contactCta}</span>
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </Magnetic>
            </div>
          </div>
        </div>

        {/* Chaîne de savoir-faire (layout éditorial en bandes décalées, jamais 3 cartes génériques) */}
        <div id="skills" className="mt-24 border-t border-[var(--border-subtle)] pt-16">
          <p className="font-mono-tech text-[11px] font-semibold tracking-[0.26em] uppercase text-[var(--accent-text)]">
            {t.founder.skillsTitle}
          </p>

          <div className="mt-8 divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)]">
            {t.founder.skillsGroups.map((group) => (
              <div
                key={group.index}
                className="grid gap-6 py-8 lg:grid-cols-12 lg:items-start"
              >
                <span className="font-mono-tech text-xs font-bold tracking-[0.22em] text-[var(--accent-text)] lg:col-span-1">
                  {group.index}
                </span>
                <h3 className="font-display text-2xl font-bold lg:col-span-4 sm:text-3xl">
                  {group.title}
                </h3>
                <ul className="grid gap-3 sm:grid-cols-2 lg:col-span-7">
                  {group.items.map((skill) => (
                    <li
                      key={skill}
                      className="flex items-start gap-3 text-sm leading-relaxed text-[var(--text-muted)]"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-gradient"
                      />
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
