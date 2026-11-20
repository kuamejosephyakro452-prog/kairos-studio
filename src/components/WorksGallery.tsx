import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, ArrowRight, ArrowUpRight, Film, Layers } from 'lucide-react';
import { DICTIONARY } from '@/i18n/translations';
import { ALL_CATEGORIES, type Locale, type Project, type ProjectCategory } from '@/types/portfolio';
import { ResponsivePicture } from './ResponsivePicture';
import { Magnetic } from './Magnetic';

gsap.registerPlugin(ScrollTrigger);

interface WorksGalleryProps {
  locale: Locale;
  projects: Project[];
  activeCategory: ProjectCategory | 'all';
  onChangeCategory: (category: ProjectCategory | 'all') => void;
}

export const WorksGallery: React.FC<WorksGalleryProps> = ({
  locale,
  projects,
  activeCategory,
  onChangeCategory,
}) => {
  const t = DICTIONARY[locale];
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const filtered =
    activeCategory === 'all'
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  const projectRoutePrefix = locale === 'fr' ? '/fr/projets' : '/en/projects';

  useEffect(() => {
    if (!sectionRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.work-card-reveal',
        { clipPath: 'inset(10% 0% 10% 0%)', opacity: 0, y: 24 },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 78%',
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [activeCategory, filtered.length]);

  const scrollHorizontal = (direction: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    const distance = Math.min(el.clientWidth * 0.72, 640);
    el.scrollBy({ left: direction * distance, behavior: 'smooth' });
  };

  // Convertit la molette horizontale / shift+scroll et permet aussi un glissement fluide desktop
  const handleWheelOnTrack = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = trackRef.current;
    if (!el || window.innerWidth < 1024) return;
    const canScrollX = el.scrollWidth > el.clientWidth + 12;
    if (!canScrollX) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

    const atStart = el.scrollLeft <= 2 && e.deltaY < 0;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 && e.deltaY > 0;
    if (!atStart && !atEnd) {
      el.scrollLeft += e.deltaY * 1.1;
    }
  };

  return (
    <section
      id="works"
      ref={sectionRef}
      className="section-dark relative overflow-hidden py-24 sm:py-32"
    >
      <div className="gold-aura absolute top-0 right-0 h-[28rem] w-[28rem] opacity-40" />

      <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        {/* En-tête asymétrique */}
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="text-[11px] font-semibold tracking-[0.28em] uppercase text-[#E8C877]">
              {t.works.label}
            </p>
            <h2 className="mt-4 font-display text-[clamp(2.8rem,6vw,5.4rem)] font-light leading-[0.98] text-[#F4EEE3]">
              {t.works.title}
            </h2>
          </div>

          <div className="lg:col-span-5 lg:text-right">
            <p className="text-sm leading-relaxed text-[#BDB5A8] sm:text-base lg:ml-auto lg:max-w-md">
              {t.works.subtitle}
            </p>
            <p className="mt-3 text-xs tracking-[0.22em] uppercase text-[#E8C877]">
              {projects.length} {t.works.allProjectsCount}
            </p>
          </div>
        </div>

        {/* Barre de filtres par catégorie + flèches horizontales desktop */}
        <div className="mt-12 flex flex-col justify-between gap-6 border-y border-[#F4EEE3]/12 py-5 lg:flex-row lg:items-center">
          <div
            role="tablist"
            aria-label={t.works.title}
            className="flex flex-wrap items-center gap-2"
          >
            {(['all', ...ALL_CATEGORIES] as const).map((cat) => {
              const active = activeCategory === cat;
              const count =
                cat === 'all'
                  ? projects.length
                  : projects.filter((p) => p.category === cat).length;

              return (
                <button
                  key={cat}
                  role="tab"
                  type="button"
                  aria-selected={active}
                  onClick={() => onChangeCategory(cat)}
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium tracking-[0.12em] uppercase transition-all ${
                    active
                      ? 'border-[#E8C877] bg-[#E8C877] text-[#0B0B0C]'
                      : 'border-[#F4EEE3]/18 bg-transparent text-[#F4EEE3]/80 hover:border-[#E8C877]/60 hover:text-[#E8C877]'
                  }`}
                >
                  <span>{t.categories[cat]}</span>
                  <span
                    className={`text-[10px] ${
                      active ? 'text-[#0B0B0C]/75' : 'text-[#BDB5A8]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Contrôles de défilement horizontal (desktop) */}
          {filtered.length > 1 && (
            <div className="hidden items-center gap-3 lg:flex">
              <span className="text-[11px] tracking-[0.16em] uppercase text-[#BDB5A8]">
                {t.works.horizontalHint}
              </span>
              <button
                type="button"
                onClick={() => scrollHorizontal(-1)}
                aria-label={locale === 'fr' ? 'Défiler vers la gauche' : 'Scroll left'}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[#F4EEE3]/20 text-[#F4EEE3] transition-colors hover:border-[#E8C877] hover:text-[#E8C877]"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollHorizontal(1)}
                aria-label={locale === 'fr' ? 'Défiler vers la droite' : 'Scroll right'}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[#F4EEE3]/20 text-[#F4EEE3] transition-colors hover:border-[#E8C877] hover:text-[#E8C877]"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Galerie horizontale desktop / grille fluide mobile */}
        {filtered.length === 0 ? (
          <div className="mt-14 rounded-2xl border border-[#F4EEE3]/12 bg-[#131316] px-8 py-16 text-center">
            <p className="font-display text-3xl font-light text-[#F4EEE3]">
              {t.works.emptyCategoryTitle}
            </p>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-[#BDB5A8]">
              {t.works.emptyCategoryText}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button
                type="button"
                onClick={() => onChangeCategory('all')}
                className="cursor-pointer rounded-full bg-gold-gradient px-6 py-2.5 text-xs font-semibold tracking-[0.18em] uppercase text-[#0B0B0C]"
              >
                {t.works.viewAll}
              </button>
              <a
                href={`#contact`}
                className="rounded-full border border-[#F4EEE3]/25 px-6 py-2.5 text-xs font-semibold tracking-[0.18em] uppercase text-[#F4EEE3] transition-colors hover:border-[#E8C877] hover:text-[#E8C877]"
              >
                {t.hero.ctaSecondary}
              </a>
            </div>
          </div>
        ) : (
          <div
            ref={trackRef}
            onWheel={handleWheelOnTrack}
            className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-2 lg:flex lg:snap-x lg:snap-mandatory lg:gap-10 lg:overflow-x-auto lg:pb-8"
          >
            {filtered.map((project, idx) => {
              const title = locale === 'fr' ? project.title_fr : project.title_en;
              const subtitle = locale === 'fr' ? project.subtitle_fr : project.subtitle_en;
              const summary = locale === 'fr' ? project.summary_fr : project.summary_en;
              const alt =
                (locale === 'fr' ? project.cover_image_alt_fr : project.cover_image_alt_en) ||
                title;
              const isVideo = Boolean(project.video_url);

              return (
                <article
                  key={project.id}
                  className="work-card-reveal group flex flex-col lg:w-[min(560px,72vw)] lg:shrink-0 lg:snap-start"
                >
                  <Link
                    to={`${projectRoutePrefix}/${project.slug}`}
                    data-cursor={locale === 'fr' ? 'OUVRIR' : 'OPEN'}
                    className="block overflow-hidden rounded-2xl border border-[#F4EEE3]/12 bg-[#141418] transition-colors duration-500 group-hover:border-[#E8C877]/55"
                  >
                    {/* Cadre média dégagé (sans recouvrir la composition graphique) */}
                    <div className="relative aspect-[16/11] overflow-hidden bg-[#0E0E11]">
                      <ResponsivePicture
                        assetId={project.cover_asset_id}
                        fallbackUrl={project.cover_image_url}
                        alt={alt}
                        sizes="(max-width: 768px) 92vw, (max-width: 1200px) 48vw, 560px"
                        className="h-full w-full"
                        imgClassName="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B0B0C]/65 via-transparent to-transparent" />

                      {isVideo && (
                        <span className="absolute right-4 bottom-4 inline-flex items-center gap-1.5 rounded-full border border-[#E8C877]/35 bg-[#0B0B0C]/85 px-3 py-1 text-[10px] font-medium tracking-[0.14em] uppercase text-[#F4EEE3] backdrop-blur-md">
                          <Film className="h-3 w-3 text-[#E8C877]" />
                          {t.works.videoBadge}
                        </span>
                      )}
                    </div>

                    {/* Informations éditoriales */}
                    <div className="flex flex-1 flex-col justify-between p-6 sm:p-7">
                      <div>
                        <div className="mb-3 flex items-center justify-between gap-2 text-[10px] font-semibold tracking-[0.22em] uppercase">
                          <span className="text-[#E8C877]">
                            0{idx + 1} · {t.categories[project.category]}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-[#BDB5A8]">
                            {isVideo ? (
                              <Film className="h-3 w-3 text-[#E8C877]" />
                            ) : (
                              <Layers className="h-3 w-3 text-[#E8C877]" />
                            )}
                            {isVideo ? t.works.videoBadge : t.works.visualBadge}
                          </span>
                        </div>
                        <h3 className="font-display text-3xl font-normal leading-tight text-[#F4EEE3] transition-colors group-hover:text-[#E8C877] sm:text-4xl">
                          {title}
                        </h3>
                        <p className="mt-1.5 font-editorial text-lg italic text-[#E8C877]/90">
                          {subtitle}
                        </p>
                        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-[#BDB5A8]">
                          {summary}
                        </p>
                      </div>

                      <div className="mt-6 flex items-center justify-between border-t border-[#F4EEE3]/10 pt-5">
                        <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#F4EEE3] transition-colors group-hover:text-[#E8C877]">
                          {t.works.viewProject}
                        </span>
                        <Magnetic strength={0.18}>
                          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#F4EEE3]/20 text-[#E8C877] transition-all duration-300 group-hover:border-[#E8C877] group-hover:bg-[#E8C877] group-hover:text-[#0B0B0C]">
                            <ArrowUpRight className="h-4 w-4" />
                          </span>
                        </Magnetic>
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
