import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { DICTIONARY } from '@/i18n/translations';
import type { Locale, Project, ProjectCategory } from '@/types/portfolio';
import { ResponsivePicture } from './ResponsivePicture';
import { Magnetic } from './Magnetic';

interface ServicesStageProps {
  locale: Locale;
  projects: Project[];
  onSelectCategory: (cat: ProjectCategory) => void;
}

/**
 * Scène 3 — Index interactif plein écran des 5 domaines.
 * Les visuels affichés dans chaque scène proviennent EXCLUSIVEMENT des créations publiées
 * dans l'espace d'administration (Supabase), afin qu'aucune création supprimée ou dépubliée
 * ne puisse jamais apparaître.
 */
export const ServicesStage: React.FC<ServicesStageProps> = ({
  locale,
  projects,
  onSelectCategory,
}) => {
  const t = DICTIONARY[locale];
  const [activeIndex, setActiveIndex] = useState(0);
  const [slideTick, setSlideTick] = useState(0);
  const activeService = t.services.items[activeIndex];

  // Associe à chaque discipline uniquement les projets réellement publiés (jamais de visuel supprimé en dur)
  const slidesByCategory = useMemo(() => {
    const published = projects.filter(
      (p) => p.status === 'published' && Boolean(p.cover_image_url || p.cover_asset_id)
    );
    const map = new Map<ProjectCategory, Project[]>();

    t.services.items.forEach((srv, idx) => {
      const matching = published.filter((p) => p.category === srv.id);
      if (matching.length > 0) {
        map.set(srv.id, matching);
      } else if (published.length > 0) {
        // Si une discipline n'a pas encore de projet publié, afficher uniquement un autre projet publié de l'admin
        map.set(srv.id, [published[idx % published.length]]);
      } else {
        map.set(srv.id, []);
      }
    });

    return map;
  }, [projects, t.services.items]);

  const activeSlides = slidesByCategory.get(activeService.id) ?? [];

  // Remet le carrousel interne à 0 lors du changement de discipline
  useEffect(() => {
    setSlideTick(0);
  }, [activeIndex]);

  // Fait défiler en douceur les créations publiées de la discipline active (si > 1 création)
  useEffect(() => {
    if (activeSlides.length <= 1) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    const timer = window.setInterval(() => {
      setSlideTick((prev) => (prev + 1) % activeSlides.length);
    }, 4_500);
    return () => window.clearInterval(timer);
  }, [activeSlides.length]);

  const currentProject =
    activeSlides.length > 0 ? activeSlides[slideTick % activeSlides.length] : null;
  const currentProjectTitle = currentProject
    ? locale === 'fr'
      ? currentProject.title_fr
      : currentProject.title_en
    : null;

  const handleFilterAndScroll = (cat: ProjectCategory) => {
    onSelectCategory(cat);
    document.getElementById('works')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section
      id="services"
      className="relative overflow-hidden border-t border-[var(--border-subtle)] bg-[var(--bg-primary)] py-24 text-[var(--text-primary)] sm:py-36"
    >
      {/* Halo ambiant qui change de couleur selon le domaine survolé */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-0 h-[36rem] w-[36rem] rounded-full opacity-25 blur-[130px] transition-colors duration-700"
        style={{ backgroundColor: activeService.ambientColor }}
      />

      <div className="relative z-10 mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        {/* En-tête */}
        <div className="grid gap-8 pb-14 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="font-mono-tech text-[11px] font-semibold tracking-[0.26em] uppercase text-[var(--accent-text)]">
              {t.services.label}
            </p>
            <h2 className="font-display mt-4 text-[clamp(2.4rem,5.5vw,4.8rem)] font-bold leading-[0.98] tracking-[-0.025em]">
              {t.services.title}
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
              {t.services.subtitle}
            </p>
            <p className="font-mono-tech mt-3 text-[10px] tracking-[0.2em] uppercase text-[var(--accent-text)]">
              {t.services.hoverHint}
            </p>
          </div>
        </div>

        {/* Scène split : Index interactif géant à gauche + Aperçu visuel cinétique à droite */}
        <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
          {/* Index interactif des 5 domaines */}
          <div className="border-t border-[var(--border-subtle)] lg:col-span-7">
            {t.services.items.map((service, idx) => {
              const isActive = idx === activeIndex;
              return (
                <article
                  key={service.id}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className="border-b border-[var(--border-subtle)] transition-colors duration-300"
                  style={{
                    borderBottomColor: isActive ? service.ambientColor : undefined,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    onFocus={() => setActiveIndex(idx)}
                    aria-expanded={isActive}
                    className="group flex w-full cursor-pointer items-baseline justify-between gap-4 py-6 text-left sm:py-7"
                  >
                    <div className="flex items-baseline gap-4 sm:gap-6">
                      <span
                        className="font-mono-tech text-xs font-bold tracking-[0.2em] transition-colors"
                        style={{ color: isActive ? service.ambientColor : 'var(--text-muted)' }}
                      >
                        {service.index}
                      </span>
                      <h3
                        className={`font-display text-[clamp(1.65rem,3.4vw,3rem)] font-bold leading-tight tracking-[-0.02em] transition-all duration-300 ${
                          isActive
                            ? 'translate-x-2 text-[var(--text-primary)]'
                            : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {service.title}
                      </h3>
                    </div>

                    <ArrowUpRight
                      className={`h-5 w-5 shrink-0 transition-transform duration-300 ${
                        isActive ? 'rotate-45' : 'text-[var(--text-muted)]'
                      }`}
                      style={{ color: isActive ? service.ambientColor : undefined }}
                    />
                  </button>

                  {/* Tiroir fluide détaillé */}
                  <div
                    className={`grid transition-all duration-500 ease-out ${
                      isActive ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="space-y-4 pb-7 pl-8 sm:pl-12">
                        <p className="font-serif-accent text-lg italic text-[var(--accent-text)]">
                          {service.tagline}
                        </p>
                        <p className="max-w-xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
                          {service.description}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {service.deliverables.map((d) => (
                            <span
                              key={d}
                              className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-1 font-mono-tech text-[10px] tracking-[0.12em] uppercase text-[var(--text-primary)]"
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                        <div className="pt-2">
                          <Magnetic strength={0.14}>
                            <button
                              type="button"
                              onClick={() => handleFilterAndScroll(service.id)}
                              className="inline-flex cursor-pointer items-center gap-2 font-mono-tech text-[11px] font-bold tracking-[0.2em] uppercase transition-opacity hover:opacity-80"
                              style={{ color: service.ambientColor }}
                            >
                              <span>{t.services.exploreCategory}</span>
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </button>
                          </Magnetic>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Scène visuelle dynamique sticky qui réagit au domaine actif */}
          <div className="lg:sticky lg:top-28 lg:col-span-5">
            <div className="relative overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-elevated)]">
              <div className="mb-3 flex items-center justify-between px-1 font-mono-tech text-[10px] tracking-[0.2em] uppercase text-[var(--text-muted)]">
                <span>SCENE // {activeService.index}</span>
                <span style={{ color: activeService.ambientColor }}>{activeService.title}</span>
              </div>

              <div className="relative aspect-[4/4.3] overflow-hidden rounded-2xl bg-[#07070B]">
                {t.services.items.map((srv, idx) => {
                  const srvSlides = slidesByCategory.get(srv.id) ?? [];
                  const srvProject =
                    srvSlides.length > 0
                      ? srvSlides[(idx === activeIndex ? slideTick : 0) % srvSlides.length]
                      : null;

                  return (
                    <div
                      key={srv.id}
                      aria-hidden={idx !== activeIndex}
                      className={`absolute inset-0 transition-all duration-700 ease-out ${
                        idx === activeIndex
                          ? 'scale-100 opacity-100'
                          : 'pointer-events-none scale-105 opacity-0'
                      }`}
                      style={{
                        clipPath:
                          idx === activeIndex ? 'inset(0% 0% 0% 0%)' : 'inset(8% 0% 8% 0%)',
                      }}
                    >
                      {srvProject ? (
                        <ResponsivePicture
                          key={srvProject.id}
                          assetId={srvProject.cover_asset_id}
                          fallbackUrl={srvProject.cover_image_url}
                          alt={
                            (locale === 'fr'
                              ? srvProject.cover_image_alt_fr || srvProject.title_fr
                              : srvProject.cover_image_alt_en || srvProject.title_en) || srv.title
                          }
                          sizes="(max-width: 1024px) 92vw, 40vw"
                          className="h-full w-full"
                          imgClassName="h-full w-full object-cover object-top transition-opacity duration-500"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[var(--bg-elevated)] font-mono-tech text-xs tracking-[0.2em] uppercase text-[var(--text-muted)]">
                          KAIROS STUDIO
                        </div>
                      )}
                      <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                          background: `linear-gradient(180deg, transparent 48%, rgba(7,7,11,0.85) 100%)`,
                        }}
                      />
                    </div>
                  );
                })}

                {activeSlides.length > 1 && (
                  <div className="absolute top-4 right-4 left-4 z-10 flex items-center gap-1.5">
                    {activeSlides.map((slide, sIdx) => {
                      const isCurrent = sIdx === slideTick % activeSlides.length;
                      return (
                        <button
                          key={slide.id}
                          type="button"
                          onClick={() => setSlideTick(sIdx)}
                          aria-label={locale === 'fr' ? slide.title_fr : slide.title_en}
                          className="h-1 flex-1 cursor-pointer rounded-full transition-opacity"
                          style={{
                            backgroundColor: isCurrent ? activeService.ambientColor : '#FFFFFF',
                            opacity: isCurrent ? 1 : 0.35,
                          }}
                        />
                      );
                    })}
                  </div>
                )}

                <div className="absolute right-5 bottom-5 left-5 z-10 flex items-end justify-between gap-4 text-white">
                  <div className="min-w-0">
                    <p className="font-display text-2xl font-bold leading-tight">
                      {activeService.title}
                    </p>
                    <p className="mt-1 truncate text-xs text-white/85">
                      {currentProjectTitle ?? activeService.tagline}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFilterAndScroll(activeService.id)}
                    aria-label={t.services.exploreCategory}
                    className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105"
                    style={{ backgroundColor: activeService.ambientColor }}
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
