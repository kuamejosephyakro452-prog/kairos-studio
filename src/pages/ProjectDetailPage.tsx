import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight, ExternalLink, Maximize2, X } from 'lucide-react';
import { DICTIONARY } from '@/i18n/translations';
import { resolveAssetUrl } from '@/lib/media';
import { ResponsivePicture } from '@/components/ResponsivePicture';
import { SeoHead } from '@/components/SeoHead';
import { Magnetic } from '@/components/Magnetic';
import { NotFoundPage } from '@/pages/NotFoundPage';
import type { Locale, Project } from '@/types/portfolio';

interface ProjectDetailPageProps {
  locale: Locale;
  projects: Project[];
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ locale, projects }) => {
  const { slug } = useParams<{ slug: string }>();
  const t = DICTIONARY[locale];
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const projectIndex = projects.findIndex((p) => p.slug === slug);
  const project = projectIndex >= 0 ? projects[projectIndex] : null;
  const projectPrefix = locale === 'fr' ? '/fr/projets' : '/en/projects';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    setLightboxIdx(null);
  }, [slug]);

  useEffect(() => {
    if (lightboxIdx === null || !project) return;
    const imgs = project.gallery.filter((g) => g.type === 'image');
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIdx(null);
      if (e.key === 'ArrowRight') setLightboxIdx((p) => (p === null ? null : (p + 1) % imgs.length));
      if (e.key === 'ArrowLeft')
        setLightboxIdx((p) => (p === null ? null : (p - 1 + imgs.length) % imgs.length));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIdx, project]);

  if (!project) {
    return <NotFoundPage locale={locale} />;
  }

  const title = locale === 'fr' ? project.title_fr : project.title_en;
  const subtitle = locale === 'fr' ? project.subtitle_fr : project.subtitle_en;
  const summary = locale === 'fr' ? project.summary_fr : project.summary_en;
  const description = locale === 'fr' ? project.description_fr : project.description_en;
  const role = locale === 'fr' ? project.role_fr : project.role_en;
  const deliverables = locale === 'fr' ? project.deliverables_fr : project.deliverables_en;
  const coverAlt =
    (locale === 'fr' ? project.cover_image_alt_fr : project.cover_image_alt_en) || title;

  const imageGallery = project.gallery.filter((item) => item.type === 'image');
  const nextProject =
    projects.length > 1 ? projects[(projectIndex + 1) % projects.length] : null;

  const metaRows = [
    { label: t.projectDetail.category, value: t.categories[project.category] },
    project.client_name ? { label: t.projectDetail.client, value: project.client_name } : null,
    project.project_year ? { label: t.projectDetail.year, value: project.project_year } : null,
    role ? { label: t.projectDetail.role, value: role } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: title,
    description: summary,
    creator: { '@type': 'Organization', name: 'KAIROS STUDIO' },
    inLanguage: locale === 'fr' ? 'fr-FR' : 'en-US',
  };

  return (
    <>
      <SeoHead
        title={`${title} — ${t.meta.projectTitleSuffix}`}
        description={summary || subtitle}
        locale={locale}
        canonicalPath={`${projectPrefix}/${project.slug}`}
        alternateFrPath={`/fr/projets/${project.slug}`}
        alternateEnPath={`/en/projects/${project.slug}`}
        jsonLd={jsonLd}
      />

      <main id="main-content" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">
        {/* En-tête cinématographique plein format */}
        <section className="relative overflow-hidden pt-28 pb-12 sm:pt-36 sm:pb-16">
          <div className="bg-mesh-ambient pointer-events-none absolute inset-0 opacity-70" />

          <div className="relative z-10 mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Link
                to={`/${locale}#works`}
                className="font-mono-tech inline-flex items-center gap-2.5 text-xs font-semibold tracking-[0.2em] uppercase text-[var(--accent-text)] transition-opacity hover:opacity-75"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{t.projectDetail.backToWorks}</span>
              </Link>

              <span className="font-mono-tech text-[11px] tracking-[0.22em] uppercase text-[var(--text-muted)]">
                {t.projectDetail.caseStudyLabel} · {String(projectIndex + 1).padStart(2, '0')}
              </span>
            </div>

            <h1 className="font-display mt-8 max-w-5xl break-words text-[clamp(2.3rem,6.5vw,5.8rem)] font-bold leading-[0.95] tracking-[-0.03em]">
              {title}
            </h1>

            {subtitle && (
              <p className="font-serif-accent mt-4 max-w-3xl text-xl italic text-[var(--accent-text)] sm:text-2xl">
                {subtitle}
              </p>
            )}

            {project.demo && (
              <p className="mt-6 inline-block rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-200">
                {t.projectDetail.demoNotice}
              </p>
            )}
          </div>
        </section>

        {/* Média principal plein écran */}
        <section className="mx-auto max-w-[1440px] px-5 pb-16 sm:px-8 lg:px-12">
          {project.video_url ? (
            <div className="overflow-hidden rounded-3xl border border-[var(--border-strong)] bg-black shadow-[var(--shadow-elevated)]">
              <video
                controls
                playsInline
                preload="metadata"
                poster={resolveAssetUrl(project.video_poster_url || project.cover_image_url)}
                className="aspect-video w-full bg-black object-contain"
              >
                {project.video_webm_url && (
                  <source src={resolveAssetUrl(project.video_webm_url)} type="video/webm" />
                )}
                <source src={resolveAssetUrl(project.video_url)} type="video/mp4" />
              </video>
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[#07070B] shadow-[var(--shadow-elevated)]">
              <ResponsivePicture
                assetId={project.cover_asset_id}
                fallbackUrl={project.cover_image_url}
                alt={coverAlt}
                priority
                sizes="(max-width: 1024px) 95vw, 1340px"
                imgClassName="mx-auto max-h-[82vh] w-full object-contain"
              />
            </div>
          )}
        </section>

        {/* Étude de cas : Informations STICKY à gauche + Narration & Galerie à droite */}
        <section className="border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)] py-20 sm:py-28">
          <div className="mx-auto grid max-w-[1440px] gap-14 px-5 sm:px-8 lg:grid-cols-12 lg:px-12">
            {/* Colonne d'infos STICKY (dégagée sous le header fixe) */}
            <aside className="relative z-10 lg:sticky lg:top-32 lg:col-span-4 lg:self-start">
              <div className="glass-panel space-y-6 rounded-3xl p-7">
                {metaRows.map((row) => (
                  <div key={row.label} className="border-b border-[var(--border-subtle)] pb-4">
                    <p className="font-mono-tech text-[10px] font-semibold tracking-[0.22em] uppercase text-[var(--accent-text)]">
                      {row.label}
                    </p>
                    <p className="mt-1.5 text-sm font-semibold">{row.value}</p>
                  </div>
                ))}

                {deliverables.length > 0 && (
                  <div>
                    <p className="font-mono-tech text-[10px] font-semibold tracking-[0.22em] uppercase text-[var(--accent-text)]">
                      {t.projectDetail.deliverables}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {deliverables.map((d) => (
                        <span
                          key={d}
                          className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-primary)]/70 px-3 py-1 font-mono-tech text-[10px] uppercase tracking-[0.1em]"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {project.external_url && (
                  <a
                    href={project.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[var(--border-strong)] px-5 py-3 font-mono-tech text-xs font-semibold tracking-[0.16em] uppercase text-[var(--accent-text)] hover:border-[var(--accent-1)]"
                  >
                    <span>{t.projectDetail.visitLink}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}

                <Magnetic className="block w-full">
                  <Link
                    to={`/${locale}#contact`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent-gradient px-6 py-3.5 font-mono-tech text-xs font-bold tracking-[0.16em] uppercase text-[var(--accent-on-solid)]"
                  >
                    <span>{t.projectDetail.discussSimilar}</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Magnetic>
              </div>
            </aside>

            {/* Contenu & planches visuelles */}
            <div className="space-y-14 lg:col-span-8">
              <div className="space-y-4">
                <p className="font-mono-tech text-[11px] font-semibold tracking-[0.24em] uppercase text-[var(--accent-text)]">
                  {t.projectDetail.contextHeading}
                </p>
                <p className="font-display text-2xl font-semibold leading-snug sm:text-3xl">
                  {summary}
                </p>
              </div>

              {description && (
                <div className="space-y-4 border-t border-[var(--border-subtle)] pt-10">
                  <p className="font-mono-tech text-[11px] font-semibold tracking-[0.24em] uppercase text-[var(--accent-text)]">
                    {t.projectDetail.executionHeading}
                  </p>
                  <div className="space-y-4 text-base leading-relaxed text-[var(--text-muted)]">
                    {description.split('\n\n').map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </div>
              )}

              {imageGallery.length > 0 && (
                <div className="space-y-6 border-t border-[var(--border-subtle)] pt-10">
                  <div className="flex items-end justify-between">
                    <p className="font-mono-tech text-[11px] font-semibold tracking-[0.24em] uppercase text-[var(--accent-text)]">
                      {t.projectDetail.galleryHeading}
                    </p>
                    <p className="font-mono-tech text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
                      {t.projectDetail.fullscreenHint}
                    </p>
                  </div>

                  <div className="space-y-8">
                    {imageGallery.map((item, idx) => {
                      const alt = locale === 'fr' ? item.alt_fr : item.alt_en;
                      const caption = locale === 'fr' ? item.caption_fr : item.caption_en;
                      const isTall =
                        item.aspect === '9/16' || item.aspect === '3/4' || item.aspect === '4/5';

                      return (
                        <figure
                          key={item.id}
                          className="group overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)]"
                        >
                          <button
                            type="button"
                            onClick={() => setLightboxIdx(idx)}
                            data-cursor="ZOOM"
                            aria-label={`${t.projectDetail.fullscreenHint}: ${alt}`}
                            className="relative block w-full cursor-pointer overflow-hidden bg-[#07070B]"
                          >
                            <ResponsivePicture
                              assetId={item.assetId}
                              fallbackUrl={item.url}
                              alt={alt}
                              sizes="(max-width: 1024px) 94vw, 62vw"
                              imgClassName={`w-full transition-transform duration-700 ease-out group-hover:scale-[1.02] ${
                                isTall ? 'max-h-[760px] object-contain p-4' : 'w-full object-cover'
                              }`}
                            />
                            <span className="absolute right-4 bottom-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/75 text-white">
                              <Maximize2 className="h-4 w-4" />
                            </span>
                          </button>
                          {caption && (
                            <figcaption className="px-6 py-4 font-mono-tech text-[11px] tracking-[0.12em] text-[var(--text-muted)]">
                              {caption}
                            </figcaption>
                          )}
                        </figure>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* BLOC « PROJET SUIVANT » SPECTACULAIRE PLEIN LARGEUR */}
        {nextProject && (
          <Link
            to={`${projectPrefix}/${nextProject.slug}`}
            data-cursor={locale === 'fr' ? 'SUIVANT' : 'NEXT'}
            className="group relative block overflow-hidden border-t border-[var(--border-subtle)] bg-[#07070B] py-24 text-white sm:py-32"
          >
            <div className="pointer-events-none absolute inset-0 opacity-35 transition-all duration-700 group-hover:scale-105 group-hover:opacity-55">
              <ResponsivePicture
                assetId={nextProject.cover_asset_id}
                fallbackUrl={nextProject.cover_image_url}
                alt=""
                sizes="100vw"
                className="h-full w-full"
                imgClassName="h-full w-full object-cover"
              />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/65 to-black/75" />

            <div className="relative z-10 mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-6 px-5 sm:flex-row sm:items-end sm:px-8 lg:px-12">
              <div>
                <p className="font-mono-tech text-xs font-semibold tracking-[0.26em] uppercase text-[var(--accent-text)]">
                  {t.projectDetail.nextProjectLabel} · {t.categories[nextProject.category]}
                </p>
                <p className="font-display mt-3 text-[clamp(2.2rem,6vw,5.4rem)] font-bold leading-[0.96] tracking-[-0.03em] transition-transform duration-500 group-hover:translate-x-2">
                  {locale === 'fr' ? nextProject.title_fr : nextProject.title_en}
                </p>
              </div>
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent-gradient text-[var(--accent-on-solid)] transition-transform duration-300 group-hover:scale-110">
                <ArrowRight className="h-6 w-6" />
              </span>
            </div>
          </Link>
        )}
      </main>

      {/* Lightbox plein écran */}
      {lightboxIdx !== null && imageGallery[lightboxIdx] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.projectDetail.galleryHeading}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 p-4 backdrop-blur-xl sm:p-8"
          onClick={() => setLightboxIdx(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxIdx(null)}
            aria-label={t.projectDetail.closeLightbox}
            className="absolute top-5 right-5 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-black text-white hover:border-[var(--accent-1)]"
          >
            <X className="h-5 w-5" />
          </button>

          <div
            className="relative flex max-h-[86vh] max-w-6xl flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <ResponsivePicture
              assetId={imageGallery[lightboxIdx].assetId}
              fallbackUrl={imageGallery[lightboxIdx].url}
              alt={
                locale === 'fr'
                  ? imageGallery[lightboxIdx].alt_fr
                  : imageGallery[lightboxIdx].alt_en
              }
              priority
              sizes="96vw"
              imgClassName="max-h-[78vh] w-auto rounded-xl object-contain"
            />

            {imageGallery.length > 1 && (
              <div className="mt-5 flex items-center gap-4 text-white">
                <button
                  type="button"
                  onClick={() =>
                    setLightboxIdx((lightboxIdx - 1 + imageGallery.length) % imageGallery.length)
                  }
                  aria-label="Image précédente"
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/25 hover:border-[var(--accent-1)]"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <span className="font-mono-tech text-xs tracking-[0.2em]">
                  {lightboxIdx + 1} / {imageGallery.length}
                </span>
                <button
                  type="button"
                  onClick={() => setLightboxIdx((lightboxIdx + 1) % imageGallery.length)}
                  aria-label="Image suivante"
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/25 hover:border-[var(--accent-1)]"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
