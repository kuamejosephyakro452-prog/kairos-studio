import React from 'react';
import { ArrowDownRight } from 'lucide-react';
import { DICTIONARY } from '@/i18n/translations';
import type { Locale } from '@/types/portfolio';
import { MonogramJK } from './MonogramJK';
import { Magnetic } from './Magnetic';

interface FounderAndSkillsSectionProps {
  locale: Locale;
}

export const FounderAndSkillsSection: React.FC<FounderAndSkillsSectionProps> = ({ locale }) => {
  const t = DICTIONARY[locale];

  return (
    <>
      {/* Présentation du fondateur — Noir encre profond + Monogramme sculptural JK */}
      <section
        id="founder"
        className="section-dark-alt relative overflow-hidden border-t border-[#F4EEE3]/10 py-24 sm:py-32"
      >
        <div className="gold-aura absolute top-1/2 left-1/4 h-[26rem] w-[26rem] -translate-y-1/2 opacity-45" />

        <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="grid gap-14 lg:grid-cols-12 lg:items-center">
            {/* Emblème sculptural JK */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto flex aspect-[4/5] max-w-md flex-col items-center justify-between overflow-hidden rounded-2xl border border-[#E8C877]/28 bg-[#0B0B0C] p-8 sm:p-10">
                <div className="gold-aura absolute inset-0 opacity-65" />

                <div className="relative flex w-full items-center justify-between text-[10px] tracking-[0.26em] uppercase text-[#BDB5A8]">
                  <span>KAIROS STUDIO</span>
                  <span className="text-[#E8C877]">JK</span>
                </div>

                <div className="relative my-auto flex flex-col items-center py-8">
                  <div className="rounded-3xl border border-[#E8C877]/20 bg-[#121215]/90 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.65)]">
                    <MonogramJK size={148} showFrame />
                  </div>
                  <p className="mt-7 font-display text-3xl font-light tracking-[0.06em] text-[#F4EEE3]">
                    {t.founder.name}
                  </p>
                  <p className="mt-1.5 text-xs tracking-[0.22em] uppercase text-[#E8C877]">
                    {t.founder.role}
                  </p>
                </div>

                <div className="relative flex w-full items-center justify-between border-t border-[#F4EEE3]/10 pt-5 text-[11px] tracking-[0.18em] uppercase text-[#BDB5A8]">
                  <span>Turning Ideas</span>
                  <span className="text-[#E8C877]">Into Experiences</span>
                </div>
              </div>
            </div>

            {/* Récit fondateur */}
            <div className="lg:col-span-7">
              <p className="text-[11px] font-semibold tracking-[0.28em] uppercase text-[#E8C877]">
                {t.founder.label}
              </p>
              <h2 className="mt-4 font-display text-[clamp(2.4rem,5vw,4.5rem)] font-light leading-[1.04] text-[#F4EEE3]">
                {t.founder.headline}
              </h2>

              <div className="mt-8 space-y-5 text-base leading-relaxed text-[#D0C8BC] sm:text-lg">
                <p>{t.founder.bio1}</p>
                <p>{t.founder.bio2}</p>
              </div>

              <div className="mt-10 grid gap-6 border-y border-[#F4EEE3]/12 py-7 sm:grid-cols-3">
                {t.founder.principles.map((item) => (
                  <div key={item.label}>
                    <p className="text-[10px] font-semibold tracking-[0.24em] uppercase text-[#E8C877]">
                      {item.label}
                    </p>
                    <p className="mt-2 text-sm leading-snug text-[#F4EEE3]">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-9">
                <Magnetic>
                  <a
                    href="#contact"
                    className="inline-flex items-center gap-3 rounded-full border border-[#E8C877]/60 px-7 py-3.5 text-xs font-semibold tracking-[0.2em] uppercase text-[#E8C877] transition-colors hover:bg-[#E8C877] hover:text-[#0B0B0C]"
                  >
                    <span>{t.founder.contactFounder}</span>
                    <ArrowDownRight className="h-4 w-4" />
                  </a>
                </Magnetic>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compétences — Section Ivoire clair pour rythme alterné */}
      <section id="skills" className="section-light relative py-24 sm:py-32">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="grid gap-8 pb-16 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="text-[11px] font-semibold tracking-[0.28em] uppercase text-[var(--gold-accessible-on-light)]">
                {t.skills.label}
              </p>
              <h2 className="mt-4 font-display text-[clamp(2.5rem,5.2vw,4.6rem)] font-light leading-[1.03]">
                {t.skills.title}
              </h2>
            </div>
            <div className="lg:col-span-5">
              <p className="text-sm leading-relaxed text-[var(--text-on-light-muted)] sm:text-base">
                {t.skills.subtitle}
              </p>
            </div>
          </div>

          <div className="grid gap-10 lg:grid-cols-3">
            {t.skills.groups.map((group) => (
              <div
                key={group.index}
                className="flex flex-col justify-between rounded-2xl border border-[var(--border-on-light)] bg-[var(--surface-light-card)] p-8 sm:p-9"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-[var(--border-on-light)] pb-5">
                    <span className="font-display text-3xl italic text-[var(--gold-accessible-on-light)]">
                      {group.index}
                    </span>
                    <span className="h-px w-12 bg-[var(--gold-accessible-on-light)]/50" />
                  </div>
                  <h3 className="mt-6 font-display text-3xl font-normal leading-snug">
                    {group.title}
                  </h3>
                  <ul className="mt-6 space-y-3.5">
                    {group.items.map((skill) => (
                      <li
                        key={skill}
                        className="flex items-start gap-3 text-sm leading-relaxed text-[var(--text-on-light-muted)]"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-[var(--gold-accessible-on-light)]"
                        />
                        <span>{skill}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
