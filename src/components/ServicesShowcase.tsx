import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { DICTIONARY } from '@/i18n/translations';
import type { Locale, ProjectCategory } from '@/types/portfolio';

interface ServicesShowcaseProps {
  locale: Locale;
  onSelectCategory: (cat: ProjectCategory) => void;
}

export const ServicesShowcase: React.FC<ServicesShowcaseProps> = ({
  locale,
  onSelectCategory,
}) => {
  const t = DICTIONARY[locale];
  const [activeId, setActiveId] = useState<ProjectCategory>('graphic-design');

  const marqueeItems = [...t.services.items, ...t.services.items];

  const handleExplore = (cat: ProjectCategory) => {
    onSelectCategory(cat);
    document.getElementById('works')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      {/* Bandeau défilant continu des 5 services */}
      <div
        aria-label={t.services.title}
        className="overflow-hidden border-y border-[#E8C877]/20 bg-[#0B0B0C] py-5 text-[#F4EEE3]"
      >
        <div className="marquee-track items-center gap-10">
          {marqueeItems.map((srv, idx) => (
            <div key={`${srv.id}-${idx}`} className="flex items-center gap-10 whitespace-nowrap">
              <span className="font-display text-2xl font-light tracking-[0.06em] text-[#F4EEE3] sm:text-3xl">
                {srv.title}
              </span>
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rotate-45 bg-[#E8C877]"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Manifeste Kairos — Section Ivoire clair */}
      <section id="manifesto" className="section-light relative py-24 sm:py-32">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="text-[11px] font-semibold tracking-[0.28em] uppercase text-[var(--gold-accessible-on-light)]">
                {t.manifesto.label}
              </p>
            </div>
            <div className="lg:col-span-8">
              <blockquote className="font-display text-[clamp(2rem,4.2vw,3.65rem)] font-normal leading-[1.12] tracking-[-0.01em]">
                « {t.manifesto.quote} »
              </blockquote>
              <p className="mt-7 max-w-2xl text-base leading-relaxed text-[var(--text-on-light-muted)] sm:text-lg">
                {t.manifesto.body}
              </p>

              <div className="mt-14 grid gap-8 border-t border-[var(--border-on-light)] pt-10 sm:grid-cols-3">
                {t.manifesto.pillars.map((pillar, i) => (
                  <div key={pillar.title} className="space-y-2.5">
                    <span className="font-display text-lg italic text-[var(--gold-accessible-on-light)]">
                      0{i + 1}.
                    </span>
                    <h3 className="text-sm font-semibold tracking-[0.14em] uppercase">
                      {pillar.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-[var(--text-on-light-muted)]">
                      {pillar.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mise en scène éditoriale des 5 domaines — Section Sable */}
      <section id="services" className="section-sand relative py-24 sm:py-32">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="grid gap-8 pb-14 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="text-[11px] font-semibold tracking-[0.28em] uppercase text-[var(--gold-accessible-on-light)]">
                {t.services.label}
              </p>
              <h2 className="mt-4 font-display text-[clamp(2.5rem,5.5vw,4.8rem)] font-light leading-[1.02]">
                {t.services.title}
              </h2>
            </div>
            <div className="lg:col-span-5">
              <p className="text-sm leading-relaxed text-[var(--text-on-light-muted)] sm:text-base">
                {t.services.subtitle}
              </p>
            </div>
          </div>

          {/* Tableau architectural interactif (pas de simples cartes) */}
          <div className="border-t border-[var(--border-on-light)]">
            {t.services.items.map((service) => {
              const isOpen = activeId === service.id;
              return (
                <article
                  key={service.id}
                  onMouseEnter={() => setActiveId(service.id)}
                  className={`group border-b border-[var(--border-on-light)] transition-colors duration-500 ${
                    isOpen ? 'bg-[var(--surface-light-card)]/75' : 'hover:bg-[var(--surface-light-card)]/40'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveId(service.id)}
                    aria-expanded={isOpen}
                    className="grid w-full cursor-pointer grid-cols-12 items-baseline gap-4 px-3 py-7 text-left sm:px-6 sm:py-9"
                  >
                    <span className="col-span-2 font-display text-xl italic text-[var(--gold-accessible-on-light)] sm:col-span-1 sm:text-2xl">
                      {service.index}
                    </span>
                    <div className="col-span-10 sm:col-span-6">
                      <h3 className="font-display text-[clamp(1.75rem,3.4vw,3.1rem)] font-normal leading-tight transition-transform duration-300 group-hover:translate-x-1">
                        {service.title}
                      </h3>
                    </div>
                    <p className="col-span-10 col-start-3 font-editorial text-lg italic text-[var(--text-on-light-muted)] sm:col-span-4 sm:col-start-auto sm:text-xl">
                      {service.tagline}
                    </p>
                    <span className="hidden justify-end sm:col-span-1 sm:flex">
                      <ArrowUpRight
                        className={`h-5 w-5 transition-transform duration-300 ${
                          isOpen
                            ? 'rotate-45 text-[var(--gold-accessible-on-light)]'
                            : 'text-[var(--text-on-light-muted)]'
                        }`}
                      />
                    </span>
                  </button>

                  {/* Panneau déployé */}
                  <div
                    className={`grid transition-all duration-500 ease-out ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="grid gap-8 px-3 pt-1 pb-9 sm:grid-cols-12 sm:px-6">
                        <div className="sm:col-span-6 sm:col-start-2">
                          <p className="max-w-xl text-sm leading-relaxed text-[var(--text-on-light-muted)] sm:text-base">
                            {service.description}
                          </p>
                          <div className="mt-5 flex flex-wrap gap-2">
                            {service.disciplines.map((item) => (
                              <span
                                key={item}
                                className="rounded-full border border-[var(--border-on-light)] px-3.5 py-1 text-xs font-medium tracking-wide"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-end sm:col-span-4 sm:justify-end">
                          <button
                            type="button"
                            onClick={() => handleExplore(service.id)}
                            className="inline-flex cursor-pointer items-center gap-2 border-b border-[var(--gold-accessible-on-light)] pb-1 text-xs font-semibold tracking-[0.2em] uppercase text-[var(--gold-accessible-on-light)] transition-opacity hover:opacity-75"
                          >
                            <span>{t.services.exploreCategory}</span>
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
};
