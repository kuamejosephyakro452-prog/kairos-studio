import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Compass,
  Film,
  LayoutGrid,
  List,
  RotateCcw,
} from 'lucide-react';
import { DICTIONARY } from '@/i18n/translations';
import {
  saveWorksReturnState,
  type WorksReturnState,
  type WorksViewMode,
} from '@/lib/scrollControl';
import {
  ALL_CATEGORIES,
  type Locale,
  type Project,
  type ProjectCategory,
} from '@/types/portfolio';
import { ResponsivePicture } from './ResponsivePicture';

gsap.registerPlugin(ScrollTrigger);

interface WorksShowcaseProps {
  locale: Locale;
  projects: Project[];
  activeCategory: ProjectCategory | 'all';
  onChangeCategory: (cat: ProjectCategory | 'all') => void;
  initialReturnState?: WorksReturnState | null;
  onReadyForRestore?: () => void;
}

type ViewMode = WorksViewMode;

/**
 * Coordonnées organiques façon table lumineuse pour la vue "Explorer" (canevas libre glissable).
 */
const EXPLORE_SLOTS = [
  { x: 40, y: 30, w: 340, r: -1.5 },
  { x: 430, y: 120, w: 300, r: 1.8 },
  { x: 780, y: 20, w: 320, r: -1.2 },
  { x: 1150, y: 150, w: 340, r: 1.4 },
  { x: 180, y: 420, w: 330, r: 1.6 },
  { x: 570, y: 470, w: 310, r: -1.8 },
  { x: 940, y: 410, w: 320, r: 1.1 },
  { x: 1320, y: 480, w: 310, r: -1.4 },
  { x: 90, y: 790, w: 340, r: -1.1 },
  { x: 490, y: 820, w: 330, r: 1.5 },
  { x: 900, y: 780, w: 340, r: -1.3 },
];

export const WorksShowcase: React.FC<WorksShowcaseProps> = ({
  locale,
  projects,
  activeCategory,
  onChangeCategory,
  initialReturnState,
  onReadyForRestore,
}) => {
  const t = DICTIONARY[locale];
  const [viewMode, setViewMode] = useState<ViewMode>(
    () => initialReturnState?.viewMode ?? 'gallery'
  );

  // Refs pour Sticky Horizontal ScrollTrigger (desktop, sans pin:true pour compatibilité React 19 totale)
  const runwayRef = useRef<HTMLDivElement>(null);
  const stickyViewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [runwayHeight, setRunwayHeight] = useState<number | null>(null);
  const restoreFiredRef = useRef(false);
  const skipInitialFlipRef = useRef(Boolean(initialReturnState));

  // État pour la traînée d'images au survol en mode Index (desktop)
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // État pour le canevas glissable en mode Explorer
  const [canvasOffset, setCanvasOffset] = useState(
    () => initialReturnState?.canvasOffset ?? { x: -30, y: -10 }
  );
  const dragStateRef = useRef({ active: false, startX: 0, startY: 0, origX: 0, origY: 0, moved: false });

  const filtered =
    activeCategory === 'all'
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  const projectPrefix = locale === 'fr' ? '/fr/projets' : '/en/projects';

  // Mémorise l'état exact (scrollY, filtre, mode d'affichage, position Explorer) avant d'ouvrir une fiche projet
  const handleRememberState = (slug: string) => {
    saveWorksReturnState({
      scrollY: window.scrollY,
      activeCategory,
      viewMode,
      canvasOffset,
      slug,
    });
  };

  // Défilement horizontal fluide sur desktop en mode Galerie via CSS position:sticky + GSAP ScrollTrigger scrub
  useLayoutEffect(() => {
    if (viewMode !== 'gallery') {
      setRunwayHeight(null);
      return;
    }
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRunwayHeight(null);
      return;
    }

    const mm = gsap.matchMedia();

    mm.add('(min-width: 1024px)', () => {
      const runway = runwayRef.current;
      const viewport = stickyViewportRef.current;
      const track = trackRef.current;
      if (!runway || !viewport || !track || filtered.length <= 2) {
        setRunwayHeight(null);
        return;
      }

      gsap.set(track, { x: 0 });

      const getScrollAmount = () => {
        const diff = track.scrollWidth - viewport.clientWidth + 48;
        return Math.max(0, diff);
      };

      const dist = getScrollAmount();
      if (dist <= 60) {
        setRunwayHeight(null);
        return;
      }

      const travelPx = Math.min(dist, 2400);
      const viewportH = Math.max(viewport.offsetHeight, 560);
      setRunwayHeight(viewportH + travelPx);

      const tween = gsap.to(track, {
        x: () => -getScrollAmount(),
        ease: 'none',
        scrollTrigger: {
          trigger: runway,
          start: 'top top+=96',
          end: 'bottom bottom',
          scrub: 0.55,
          invalidateOnRefresh: true,
        },
      });

      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => ScrollTrigger.refresh());
      });

      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
        tween.scrollTrigger?.kill();
        tween.kill();
        gsap.set(track, { clearProps: 'transform' });
      };
    });

    mm.add('(max-width: 1023px)', () => {
      setRunwayHeight(null);
    });

    return () => mm.revert();
  }, [viewMode, filtered.length, activeCategory, projects.length]);

  // Restaure la position exacte de scroll dès que la hauteur du mode courant (notamment runwayHeight en Galerie desktop) est stabilisée
  useEffect(() => {
    if (!initialReturnState || !onReadyForRestore || restoreFiredRef.current) return;

    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const expectsRunway =
      viewMode === 'gallery' && isDesktop && !reduced && filtered.length > 2;

    if (expectsRunway && runwayHeight === null) return;

    restoreFiredRef.current = true;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        onReadyForRestore();
        ScrollTrigger.update();
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [initialReturnState, onReadyForRestore, runwayHeight, viewMode, filtered.length]);

  // Animation FLIP-like d'entrée fluide lors du changement de filtre ou de mode
  useEffect(() => {
    if (skipInitialFlipRef.current) {
      skipInitialFlipRef.current = false;
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cards = document.querySelectorAll('.work-flip-item');
    if (cards.length === 0) return;
    gsap.fromTo(
      cards,
      { opacity: 0, y: 18 },
      {
        opacity: 1,
        y: 0,
        duration: 0.45,
        stagger: 0.035,
        ease: 'power3.out',
        clearProps: 'opacity,transform',
      }
    );
  }, [activeCategory, viewMode]);

  // Suivi fluide de l'image flottante en mode Index Liste
  const positionPreview = (clientX: number, clientY: number, immediate = false) => {
    if (!previewRef.current) return;
    const targetX = Math.min(window.innerWidth - 344, Math.max(16, clientX + 28));
    const targetY = Math.min(window.innerHeight - 240, Math.max(96, clientY - 110));
    if (immediate) {
      gsap.set(previewRef.current, { x: targetX, y: targetY });
    } else {
      gsap.to(previewRef.current, {
        x: targetX,
        y: targetY,
        duration: 0.28,
        ease: 'power3.out',
      });
    }
  };

  const handleListMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    positionPreview(e.clientX, e.clientY, false);
  };

  // Interactions drag-to-pan pour le canevas Explorer (souris & tactile)
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragStateRef.current.moved = false;
    if ((e.target as HTMLElement).closest('a, button')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStateRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      origX: canvasOffset.x,
      origY: canvasOffset.y,
      moved: false,
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current.active) return;
    const dx = e.clientX - dragStateRef.current.startX;
    const dy = e.clientY - dragStateRef.current.startY;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) dragStateRef.current.moved = true;
    setCanvasOffset({
      x: Math.max(-1150, Math.min(180, dragStateRef.current.origX + dx)),
      y: Math.max(-720, Math.min(120, dragStateRef.current.origY + dy)),
    });
  };

  const onPointerUp = () => {
    dragStateRef.current.active = false;
    window.setTimeout(() => {
      dragStateRef.current.moved = false;
    }, 0);
  };

  const nudgeTrack = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    if (window.innerWidth >= 1024) {
      window.scrollBy({ top: dir * 480, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: dir * 320, behavior: 'smooth' });
    }
  };

  return (
    <section
      id="works"
      className="relative border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)] py-24 text-[var(--text-primary)] sm:py-32"
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        {/* En-tête + Sélecteur de mode (Galerie / Index / Explorer) */}
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-6">
            <p className="font-mono-tech text-[11px] font-semibold tracking-[0.26em] uppercase text-[var(--accent-text)]">
              {t.works.label}
            </p>
            <h2 className="font-display mt-3 text-[clamp(2.6rem,6vw,5.4rem)] font-bold leading-[0.95] tracking-[-0.03em]">
              {t.works.title}
            </h2>
          </div>

          <div className="flex flex-col gap-5 lg:col-span-6 lg:items-end">
            <p className="max-w-md text-sm leading-relaxed text-[var(--text-muted)] lg:text-right">
              {t.works.subtitle}
            </p>

            {/* Commutateur de vue : Galerie / Index / Explorer */}
            <div
              role="group"
              aria-label={locale === 'fr' ? 'Mode d’affichage des réalisations' : 'Works display mode'}
              className="inline-flex items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] p-1 font-mono-tech text-[11px] font-semibold tracking-[0.14em] uppercase"
            >
              <button
                type="button"
                onClick={() => setViewMode('gallery')}
                aria-pressed={viewMode === 'gallery'}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 transition-all ${
                  viewMode === 'gallery'
                    ? 'bg-accent-gradient text-[var(--accent-on-solid)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>{t.works.modeGallery}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                aria-pressed={viewMode === 'list'}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 transition-all ${
                  viewMode === 'list'
                    ? 'bg-accent-gradient text-[var(--accent-on-solid)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <List className="h-3.5 w-3.5" />
                <span>{t.works.modeList}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('explore')}
                aria-pressed={viewMode === 'explore'}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 transition-all ${
                  viewMode === 'explore'
                    ? 'bg-accent-gradient text-[var(--accent-on-solid)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Compass className="h-3.5 w-3.5" />
                <span>{t.works.modeExplore}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Barre de filtres par catégorie */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-y border-[var(--border-subtle)] py-5">
          <div role="tablist" aria-label={t.works.title} className="flex flex-wrap gap-2">
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
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 font-mono-tech text-[11px] font-semibold tracking-[0.12em] uppercase transition-all ${
                    active
                      ? 'border-transparent bg-accent-gradient text-[var(--accent-on-solid)] shadow-[0_6px_22px_var(--glow-primary)]'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-card)]/60 text-[var(--text-muted)] hover:border-[var(--accent-1)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <span>{t.categories[cat]}</span>
                  <span className="opacity-70">{count}</span>
                </button>
              );
            })}
          </div>

          <span className="font-mono-tech text-[11px] tracking-[0.18em] uppercase text-[var(--text-muted)]">
            {filtered.length} / {projects.length} {t.works.publishedCount}
          </span>
        </div>
      </div>

      {/* ÉTAT VIDE */}
      {filtered.length === 0 ? (
        <div className="mx-auto mt-14 max-w-2xl px-5 text-center">
          <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-12">
            <h3 className="font-display text-3xl font-bold">{t.works.emptyCategoryTitle}</h3>
            <p className="mt-3 text-sm text-[var(--text-muted)]">{t.works.emptyCategoryText}</p>
            <button
              type="button"
              onClick={() => onChangeCategory('all')}
              className="mt-6 cursor-pointer rounded-full bg-accent-gradient px-6 py-3 font-mono-tech text-xs font-bold tracking-[0.18em] uppercase text-[var(--accent-on-solid)]"
            >
              {t.works.viewAll}
            </button>
          </div>
        </div>
      ) : viewMode === 'gallery' ? (
        /* === MODE 1 : GALERIE STICKY HORIZONTALE (DESKTOP) / GRILLE FLUIDE (MOBILE) === */
        <div
          ref={runwayRef}
          className="relative mt-10"
          style={runwayHeight ? { height: `${runwayHeight}px` } : undefined}
        >
          <div
            ref={stickyViewportRef}
            className="overflow-hidden lg:sticky lg:top-24"
          >
            <div className="mx-auto mb-6 flex max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
              <p className="font-mono-tech text-[10px] tracking-[0.22em] uppercase text-[var(--text-muted)]">
                {t.works.pinnedHint}
              </p>
              <div className="hidden items-center gap-2 lg:flex">
                <button
                  type="button"
                  onClick={() => nudgeTrack(-1)}
                  aria-label={locale === 'fr' ? 'Précédent' : 'Previous'}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-[var(--accent-1)]"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => nudgeTrack(1)}
                  aria-label={locale === 'fr' ? 'Suivant' : 'Next'}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-[var(--accent-1)]"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div
              ref={trackRef}
              className="grid grid-cols-1 gap-8 px-5 py-3 sm:px-8 md:grid-cols-2 lg:flex lg:w-max lg:flex-nowrap lg:gap-10 lg:px-12"
            >
              {filtered.map((project, idx) => {
                const title = locale === 'fr' ? project.title_fr : project.title_en;
                const subtitle = locale === 'fr' ? project.subtitle_fr : project.subtitle_en;
                const alt =
                  (locale === 'fr' ? project.cover_image_alt_fr : project.cover_image_alt_en) ||
                  title;
                const isVideo = Boolean(project.video_url);

                return (
                  <article
                    key={project.id}
                    className="work-flip-item group flex flex-col lg:w-[min(520px,42vw)] lg:shrink-0"
                  >
                    <Link
                      to={`${projectPrefix}/${project.slug}`}
                      onClick={() => handleRememberState(project.slug)}
                      data-cursor={
                        isVideo
                          ? locale === 'fr'
                            ? 'LIRE'
                            : 'PLAY'
                          : locale === 'fr'
                            ? 'VOIR'
                            : 'VIEW'
                      }
                      className="flex h-full flex-col overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] transition-all duration-500 hover:-translate-y-1.5 hover:border-[var(--accent-1)] hover:shadow-[var(--shadow-elevated)]"
                    >
                      <div className="relative aspect-[16/11] overflow-hidden bg-[#07070B]">
                        <ResponsivePicture
                          assetId={project.cover_asset_id}
                          fallbackUrl={project.cover_image_url}
                          alt={alt}
                          sizes="(max-width: 768px) 92vw, (max-width: 1200px) 46vw, 520px"
                          className="h-full w-full"
                          imgClassName="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

                        <div className="absolute right-4 bottom-4 flex items-center gap-2">
                          {project.demo && (
                            <span className="rounded-full bg-amber-400/95 px-2.5 py-1 font-mono-tech text-[10px] font-bold tracking-[0.14em] uppercase text-black">
                              {t.works.demoBadge}
                            </span>
                          )}
                          {isVideo && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/75 px-3 py-1 font-mono-tech text-[10px] font-semibold tracking-[0.14em] uppercase text-white backdrop-blur-md">
                              <Film className="h-3 w-3 text-[var(--accent-1)]" />
                              {t.works.videoBadge}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col justify-between p-6">
                        <div>
                          <div className="mb-3 flex items-center justify-between font-mono-tech text-[10px] font-semibold tracking-[0.2em] uppercase">
                            <span className="text-[var(--accent-text)]">
                              {String(idx + 1).padStart(2, '0')} · {t.categories[project.category]}
                            </span>
                            <ArrowUpRight className="h-4 w-4 text-[var(--text-muted)] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--accent-1)]" />
                          </div>
                          <h3 className="font-display text-2xl font-bold leading-snug tracking-[-0.015em] transition-colors group-hover:text-accent-gradient sm:text-3xl">
                            {title}
                          </h3>
                          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[var(--text-muted)] sm:text-sm">
                            {subtitle}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      ) : viewMode === 'list' ? (
        /* === MODE 2 : INDEX LISTE AVEC TRAÎNÉE D'IMAGE FLOTTANTE AU SURVOL (DESKTOP) === */
        <div
          onMouseMove={handleListMouseMove}
          onMouseLeave={() => setHoveredProject(null)}
          className="relative mx-auto mt-10 max-w-[1440px] px-5 sm:px-8 lg:px-12"
        >
          {/* Image flottante qui suit le curseur sur desktop */}
          <div
            ref={previewRef}
            aria-hidden="true"
            className={`pointer-events-none fixed top-0 left-0 z-50 hidden h-56 w-80 overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-[#07070B] shadow-[var(--shadow-elevated)] transition-opacity duration-200 lg:block ${
              hoveredProject ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {hoveredProject && (
              <ResponsivePicture
                assetId={hoveredProject.cover_asset_id}
                fallbackUrl={hoveredProject.cover_image_url}
                alt={hoveredProject.title_fr}
                sizes="320px"
                className="h-full w-full"
                imgClassName="h-full w-full object-cover object-top"
              />
            )}
          </div>

          <div className="border-t border-[var(--border-subtle)]">
            {filtered.map((project, idx) => {
              const title = locale === 'fr' ? project.title_fr : project.title_en;
              const subtitle = locale === 'fr' ? project.subtitle_fr : project.subtitle_en;
              return (
                <Link
                  key={project.id}
                  to={`${projectPrefix}/${project.slug}`}
                  onClick={() => handleRememberState(project.slug)}
                  onMouseEnter={(e) => {
                    setHoveredProject(project);
                    positionPreview(e.clientX, e.clientY, true);
                  }}
                  data-cursor={locale === 'fr' ? 'VOIR' : 'VIEW'}
                  className="work-flip-item group grid grid-cols-12 items-center gap-4 border-b border-[var(--border-subtle)] py-6 transition-colors hover:border-[var(--accent-1)]"
                >
                  <span className="col-span-2 font-mono-tech text-xs font-bold tracking-[0.2em] text-[var(--accent-text)] sm:col-span-1">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div className="col-span-10 sm:col-span-6">
                    <h3 className="font-display text-2xl font-bold transition-transform duration-300 group-hover:translate-x-2 group-hover:text-accent-gradient sm:text-4xl">
                      {title}
                    </h3>
                    <p className="mt-1 text-xs text-[var(--text-muted)] sm:hidden">{subtitle}</p>
                  </div>
                  <span className="hidden font-mono-tech text-[11px] tracking-[0.16em] uppercase text-[var(--text-muted)] sm:col-span-3 sm:block">
                    {t.categories[project.category]}
                    {project.demo ? ` · ${t.works.demoBadge}` : ''}
                  </span>
                  <span className="hidden justify-end sm:col-span-2 sm:flex">
                    <span className="inline-flex items-center gap-2 font-mono-tech text-[11px] font-semibold tracking-[0.16em] uppercase text-[var(--accent-text)]">
                      <span>{t.works.viewProject}</span>
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        /* === MODE 3 : VUE "EXPLORER" — CANEVAS LIBRE À GLISSER (DRAG-TO-PAN) === */
        <div className="mx-auto mt-10 max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono-tech text-[11px] tracking-[0.18em] uppercase text-[var(--text-muted)]">
              {t.works.dragHint}
            </p>
            <div className="flex items-center gap-3">
              <span className="font-mono-tech rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-1 text-[10px] tracking-[0.18em] text-[var(--accent-text)]">
                X:{Math.round(canvasOffset.x)} Y:{Math.round(canvasOffset.y)}
              </span>
              <button
                type="button"
                onClick={() => setCanvasOffset({ x: -30, y: -10 })}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3.5 py-1.5 font-mono-tech text-[10px] font-semibold tracking-[0.14em] uppercase text-[var(--text-primary)] hover:border-[var(--accent-1)]"
              >
                <RotateCcw className="h-3 w-3" />
                <span>{t.works.resetCanvas}</span>
              </button>
            </div>
          </div>

          <div
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            data-cursor={locale === 'fr' ? 'GLISSER' : 'DRAG'}
            className="relative h-[580px] touch-none select-none overflow-hidden rounded-3xl border border-[var(--border-strong)] bg-[var(--bg-primary)] shadow-[var(--shadow-elevated)] sm:h-[680px]"
            style={{
              backgroundImage:
                'radial-gradient(color-mix(in srgb, var(--text-primary) 16%, transparent) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
              backgroundPosition: `${canvasOffset.x}px ${canvasOffset.y}px`,
            }}
          >
            <div
              className="absolute top-0 left-0 will-change-transform"
              style={{
                transform: `translate3d(${canvasOffset.x}px, ${canvasOffset.y}px, 0)`,
              }}
            >
              {filtered.map((project, idx) => {
                const slot = EXPLORE_SLOTS[idx % EXPLORE_SLOTS.length];
                const title = locale === 'fr' ? project.title_fr : project.title_en;
                const alt =
                  (locale === 'fr' ? project.cover_image_alt_fr : project.cover_image_alt_en) ||
                  title;

                return (
                  <Link
                    key={project.id}
                    to={`${projectPrefix}/${project.slug}`}
                    onClick={(e) => {
                      if (dragStateRef.current.moved) {
                        e.preventDefault();
                        return;
                      }
                      handleRememberState(project.slug);
                    }}
                    data-cursor={locale === 'fr' ? 'VOIR' : 'VIEW'}
                    className="group absolute block overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-2.5 shadow-[var(--shadow-elevated)] transition-transform duration-300 hover:z-30 hover:scale-[1.04] hover:border-[var(--accent-1)]"
                    style={{
                      left: `${slot.x}px`,
                      top: `${slot.y}px`,
                      width: `${slot.w}px`,
                      transform: `rotate(${slot.r}deg)`,
                    }}
                  >
                    <div className="aspect-[16/10] overflow-hidden rounded-xl bg-black">
                      <ResponsivePicture
                        assetId={project.cover_asset_id}
                        fallbackUrl={project.cover_image_url}
                        alt={alt}
                        sizes="340px"
                        className="h-full w-full"
                        imgClassName="h-full w-full object-cover object-top"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2 px-1 pt-2.5 pb-1">
                      <div className="min-w-0">
                        <p className="font-mono-tech text-[9px] tracking-[0.16em] uppercase text-[var(--accent-text)]">
                          {t.categories[project.category]}
                          {project.demo ? ` · ${t.works.demoBadge}` : ''}
                        </p>
                        <p className="font-display truncate text-base font-bold text-[var(--text-primary)]">
                          {title}
                        </p>
                      </div>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-[var(--accent-1)]" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
