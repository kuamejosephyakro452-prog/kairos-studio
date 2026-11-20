import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ExternalLink, Maximize2, X } from 'lucide-react';
import { DICTIONARY } from '@/i18n/translations';
import { resolveAssetUrl } from '@/lib/media';
import { ResponsivePicture } from '@/components/ResponsivePicture';
import { SeoHead } from '@/components/SeoHead';
import { Magnetic } from '@/components/Magnetic';
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
  const projectRoutePrefix = locale === 'fr' ? '/fr/projets' : '/en/projects';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    setLightboxIdx(null);
  }, [slug]);

  useEffect(() => {
    if (lightboxIdx === null || !project) return;
    const imageItems = project.gallery.filter((g) => g.type === 'image');
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIdx(null);
      if (e.key === 'ArrowRight') {
        setLightboxIdx((prev) => (prev === null ? null : (prev + 1) % imageItems.length));
      }
      if (e.key === 'ArrowLeft') {
        setLightboxIdx((prev) =>
          prev === null ? null : (prev - 1 + imageItems.length) % imageItems.length
        );
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIdx, project]);

  if (!project) {
    return (
      <main id="main-content" className="section-dark min-h-[80vh] pt-36 pb-24">
        <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
          <p className="text-xs font-semibold tracking-[0.28em] uppercase text-[#E8C877]">404</p>
          <h1 className="mt-4 font-display text-5xl font-light text-[#F4EEE3]">
            {t.projectDetail.notFoundTitle}
          </h1>
          <p className="mt-4 text-sm text-[#BDB5A8]">{t.projectDetail.notFoundText}</p>
          <Link
            to={`/${locale}#works`}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gold-gradient px-7 py-3 text-xs font-semibold tracking-[0.2em] uppercase text-[#0B0B0C]"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.projectDetail.backToWorks}
          </Link>
        </div>
      </main>
    );
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
  const prevProject =
    projects.length > 1
      ? projects[(projectIndex - 1 + projects.length) % projects.length]
      : null;
  const nextProject =
    projects.length > 1 ? projects[(projectIndex + 1) % projects.length] : null;

  // Métadonnées uniquement si réellement renseignées (aucun champ vide affiché)
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
    creator: {
      '@type': 'Organization',
      name: 'KAIROS STUDIO',
    },
    inLanguage: locale === 'fr' ? 'fr-FR' : 'en-US',
  };

  return (
    <>
      <SeoHead
        title={`${title} — ${t.meta.projectTitleSuffix}`}
        description={summary || subtitle}
        locale={locale}
        canonicalPath={`${projectRoutePrefix}/${project.slug}`}
        alternateFrPath={`/fr/projets/${project.slug}`}
        alternateEnPath={`/en/projects/${project.slug}`}
        jsonLd={jsonLd}
      />

      <main id="main-content">
        {/* En-tête cinématographique sombre */}
        <section className="section-dark relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-24">
          <div className="gold-aura absolute top-16 right-1/4 h-80 w-80 opacity-45" />

          <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
            <Link
              to={`/${locale}#works`}
              className="inline-flex items-center gap-2.5 text-xs font-semibold tracking-[0.22em] uppercase text-[#E8C877] transition-opacity hover:opacity-80"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t.projectDetail.backToWorks}</span>
            </Link>

            <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-8">
                <p className="text-[11px] font-semibold tracking-[0.28em] uppercase text-[#BDB5A8]">
                  {t.categories[project.category]}
                </p>
                <h1 className="mt-4 break-words font-display text-[clamp(2.25rem,6.2vw,5.4rem)] font-light leading-[0.98] text-[#F4EEE3]">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-4 font-editorial text-2xl italic text-[#E8C877] sm:text-3xl">
                    {subtitle}
                  </p>
                )}
              </div>

              <div className="lg:col-span-4">
                <p className="text-sm leading-relaxed text-[#D0C8BC] sm:text-base">{summary}</p>
                {project.external_url && (
                  <a
                    href={project.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#E8C877]/55 px-5 py-2.5 text-xs font-semibold tracking-[0.18em] uppercase text-[#E8C877] transition-colors hover:bg-[#E8C877] hover:text-[#0B0B0C]"
                  >
                    <span>{t.projectDetail.visitLink}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Barre de métadonnées réelles uniquement */}
            <div className="mt-14 grid gap-6 border-t border-[#F4EEE3]/14 pt-8 sm:grid-cols-2 lg:grid-cols-4">
              {metaRows.map((row) => (
                <div key={row.label}>
                  <p className="text-[10px] font-semibold tracking-[0.24em] uppercase text-[#E8C877]">
                    {row.label}
                  </p>
                  <p className="mt-2 text-sm text-[#F4EEE3]">{row.value}</p>
                </div>
              ))}
              {deliverables.length > 0 && (
                <div className="sm:col-span-2">
                  <p className="text-[10px] font-semibold tracking-[0.24em] uppercase text-[#E8C877]">
                    {t.projectDetail.deliverables}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {deliverables.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-[#F4EEE3]/18 px-3 py-1 text-xs text-[#F4EEE3]/90"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Média principal : Film vidéo ou Visuel plein cadre */}
        <section className="section-dark-alt pb-24">
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
            {project.video_url ? (
              <div className="space-y-4">
                <p className="text-[11px] font-semibold tracking-[0.28em] uppercase text-[#E8C877]">
                  {t.projectDetail.videoHeading}
                </p>
                <div className="overflow-hidden rounded-2xl border border-[#E8C877]/22 bg-black shadow-[0_30px_90px_rgba(0,0,0,0.65)]">
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
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-[#F4EEE3]/14 bg-[#121215]">
                <ResponsivePicture
                  assetId={project.cover_asset_id}
                  fallbackUrl={project.cover_image_url}
                  alt={coverAlt}
                  priority
                  sizes="(max-width: 1024px) 95vw, 1280px"
                  imgClassName="mx-auto max-h-[82vh] w-full object-contain bg-[#0B0B0C]"
                />
              </div>
            )}
          </div>
        </section>

        {/* Récit éditorial + Galerie plein écran */}
        <section className="section-light py-20 sm:py-28">
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
            {description && (
              <div className="grid gap-10 pb-20 lg:grid-cols-12">
                <div className="lg:col-span-4">
                  <p className="text-[11px] font-semibold tracking-[0.28em] uppercase text-[var(--gold-accessible-on-light)]">
                    {locale === 'fr' ? 'Approche & réalisation' : 'Creative Approach'}
                  </p>
                </div>
                <div className="space-y-5 text-base leading-relaxed text-[var(--text-on-light-muted)] sm:text-lg lg:col-span-8">
                  {description.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>
            )}

            {imageGallery.length > 0 && (
              <div className="border-t border-[var(--border-on-light)] pt-16">
                <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold tracking-[0.28em] uppercase text-[var(--gold-accessible-on-light)]">
                      {t.projectDetail.galleryHeading}
                    </p>
                    <p className="mt-1 text-xs text-[var(--text-on-light-muted)]">
                      {t.projectDetail.fullscreenHint}
                    </p>
                  </div>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                  {imageGallery.map((item, idx) => {
                    const alt = locale === 'fr' ? item.alt_fr : item.alt_en;
                    const caption = locale === 'fr' ? item.caption_fr : item.caption_en;
                    const isTall = item.aspect === '9/16' || item.aspect === '3/4' || item.aspect === '4/5';

                    return (
                      <figure
                        key={item.id}
                        className="group overflow-hidden rounded-2xl border border-[var(--border-on-light)] bg-[var(--surface-light-card)]"
                      >
                        <button
                          type="button"
                          onClick={() => setLightboxIdx(idx)}
                          data-cursor="ZOOM"
                          aria-label={`${t.projectDetail.fullscreenHint}: ${alt}`}
                          className="relative block w-full cursor-pointer overflow-hidden bg-[#0E0E11] text-left"
                        >
                          <ResponsivePicture
                            assetId={item.assetId}
                            fallbackUrl={item.url}
                            alt={alt}
                            sizes="(max-width: 768px) 94vw, 48vw"
                            imgClassName={`w-full transition-transform duration-700 ease-out group-hover:scale-[1.03] ${
                              isTall ? 'max-h-[700px] object-contain p-4' : 'aspect-video object-cover'
                            }`}
                          />
                          <span className="absolute right-4 bottom-4 flex h-9 w-9 items-center justify-center rounded-full border border-[#F4EEE3]/25 bg-[#0B0B0C]/80 text-[#E8C877] opacity-90 transition-transform group-hover:scale-105">
                            <Maximize2 className="h-4 w-4" />
                          </span>
                        </button>
                        {caption && (
                          <figcaption className="px-5 py-4 text-xs font-medium tracking-wide text-[var(--text-on-light-muted)]">
                            {caption}
                          </figcaption>
                        )}
                      </figure>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Appel à l'action & Navigation Précédent / Suivant */}
            <div className="mt-20 flex flex-col items-center justify-between gap-8 border-t border-[var(--border-on-light)] pt-14 sm:flex-row">
              {prevProject ? (
                <Link
                  to={`${projectRoutePrefix}/${prevProject.slug}`}
                  className="group flex items-center gap-3 text-left"
                >
                  <ArrowLeft className="h-4 w-4 text-[var(--gold-accessible-on-light)] transition-transform group-hover:-translate-x-1" />
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-[var(--text-on-light-muted)]">
                      {t.projectDetail.prevProject}
                    </p>
                    <p className="font-display text-2xl">
                      {locale === 'fr' ? prevProject.title_fr : prevProject.title_en}
                    </p>
                  </div>
                </Link>
              ) : (
                <div />
              )}

              <Magnetic>
                <Link
                  to={`/${locale}#contact`}
                  className="inline-flex items-center rounded-full bg-[#0B0B0C] px-7 py-3.5 text-xs font-semibold tracking-[0.2em] uppercase text-[#F4EEE3] transition-colors hover:bg-[#B8913F] hover:text-[#0B0B0C]"
                >
                  {t.projectDetail.discussSimilar}
                </Link>
              </Magnetic>

              {nextProject ? (
                <Link
                  to={`${projectRoutePrefix}/${nextProject.slug}`}
                  className="group flex items-center gap-3 text-right"
                >
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-[var(--text-on-light-muted)]">
                      {t.projectDetail.nextProject}
                    </p>
                    <p className="font-display text-2xl">
                      {locale === 'fr' ? nextProject.title_fr : nextProject.title_en}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-[var(--gold-accessible-on-light)] transition-transform group-hover:translate-x-1" />
                </Link>
              ) : (
                <div />
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Lightbox plein écran */}
      {lightboxIdx !== null && imageGallery[lightboxIdx] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.projectDetail.galleryHeading}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0B0B0C]/96 p-4 backdrop-blur-lg sm:p-8"
          onClick={() => setLightboxIdx(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxIdx(null)}
            aria-label={t.projectDetail.closeLightbox}
            className="absolute top-5 right-5 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-[#F4EEE3]/25 bg-[#0B0B0C] text-[#F4EEE3] hover:border-[#E8C877] hover:text-[#E8C877]"
          >
            <X className="h-5 w-5" />
          </button>

          <div
            className="relative flex max-h-[85vh] max-w-6xl flex-col items-center"
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
              imgClassName="max-h-[78vh] w-auto rounded-lg object-contain"
            />
            {(locale === 'fr'
              ? imageGallery[lightboxIdx].caption_fr
              : imageGallery[lightboxIdx].caption_en) && (
              <p className="mt-4 text-center text-sm text-[#D0C8BC]">
                {locale === 'fr'
                  ? imageGallery[lightboxIdx].caption_fr
                  : imageGallery[lightboxIdx].caption_en}
              </p>
            )}

            {imageGallery.length > 1 && (
              <div className="mt-5 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setLightboxIdx((lightboxIdx - 1 + imageGallery.length) % imageGallery.length)
                  }
                  aria-label="Image précédente"
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[#F4EEE3]/25 text-[#F4EEE3] hover:border-[#E8C877] hover:text-[#E8C877]"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <span className="text-xs tracking-[0.2em] text-[#BDB5A8]">
                  {lightboxIdx + 1} / {imageGallery.length}
                </span>
                <button
                  type="button"
                  onClick={() => setLightboxIdx((lightboxIdx + 1) % imageGallery.length)}
                  aria-label="Image suivante"
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[#F4EEE3]/25 text-[#F4EEE3] hover:border-[#E8C877] hover:text-[#E8C877]"
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
