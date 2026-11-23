import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight, Play } from 'lucide-react';
import { DICTIONARY } from '@/i18n/translations';
import { HERO_MEDIA } from '@/content/media';
import { resolveAssetUrl } from '@/lib/media';
import { scrollToElement } from '@/lib/scrollControl';
import type { Locale } from '@/types/portfolio';
import { InteractiveMonogramJK } from './InteractiveMonogramJK';
import { Magnetic } from './Magnetic';

const FluidWebGLHero = lazy(() =>
  import('./FluidWebGLHero').then((m) => ({ default: m.FluidWebGLHero }))
);

interface HeroSectionProps {
  locale: Locale;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ locale }) => {
  const t = DICTIONARY[locale];
  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mountDesktopWebGL, setMountDesktopWebGL] = useState(false);
  const [loadHeroVideo, setLoadHeroVideo] = useState(false);

  // Charge WebGL sur desktop performant après le premier rendu (la vidéo capsule 1 Mo ne se charge qu'au survol pour garder le chargement initial < 150 Ko)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isDesktop = window.innerWidth >= 1024;
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    if (reduced || !isDesktop || nav.connection?.saveData) return;

    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    let idleId = 0;
    const startDeferred = () => {
      setMountDesktopWebGL(true);
    };

    if (win.requestIdleCallback) {
      idleId = win.requestIdleCallback(startDeferred, { timeout: 1800 });
    } else {
      idleId = window.setTimeout(startDeferred, 1400);
    }

    return () => {
      if (win.cancelIdleCallback) win.cancelIdleCallback(idleId);
      else window.clearTimeout(idleId);
    };
  }, []);

  // Met automatiquement la vidéo capsule en pause hors écran pour préserver CPU/batterie
  useEffect(() => {
    if (!loadHeroVideo) return;
    const video = videoRef.current;
    const hero = heroRef.current;
    if (!video || !hero || typeof IntersectionObserver === 'undefined') return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.05 }
    );
    io.observe(hero);
    return () => io.disconnect();
  }, [loadHeroVideo]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) scrollToElement(el, { immediate: false });
  };

  let wordSeq = 0;
  const renderLine = (text: string, accent = false) =>
    text.split(' ').map((word, idx) => {
      const i = wordSeq++;
      return (
        <span
          key={`${word}-${idx}`}
          className="inline-block overflow-hidden align-top pb-[0.14em] pr-[0.06em] -mb-[0.12em] mr-[0.2em]"
        >
          <span
            className={`hero-word hero-word-anim inline-block ${accent ? 'text-accent-gradient' : ''}`}
            style={{ '--i': i } as React.CSSProperties}
          >
            {word}
          </span>
        </span>
      );
    });

  return (
    <section
      ref={heroRef}
      key={locale}
      className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden bg-[var(--bg-primary)] pt-28 pb-20 text-[var(--text-primary)] sm:pt-32 sm:pb-24"
    >
      {/* Repli CSS mesh gradient haute performance (mobile & avant WebGL) */}
      <div className="bg-mesh-ambient pointer-events-none absolute inset-0 opacity-95" />

      {/* Shader WebGL fluide GLSL chargé uniquement sur desktop après le premier rendu */}
      {mountDesktopWebGL && (
        <div className="pointer-events-none absolute inset-0 opacity-90">
          <Suspense fallback={null}>
            <FluidWebGLHero />
          </Suspense>
        </div>
      )}

      {/* Voile d'équilibre pour garantir un contraste AA constant */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(243,238,230,0.45) 0%, rgba(243,238,230,0.22) 55%, rgba(243,238,230,0.92) 100%)',
        }}
      />

      {/* Contenu principal asymétrique */}
      <div className="relative z-10 mx-auto my-auto grid w-full max-w-[1440px] gap-12 px-5 py-6 sm:px-8 lg:grid-cols-12 lg:items-center lg:px-12">
        {/* Colonne gauche : promesse client massive + CTA */}
        <div className="lg:col-span-7">
          <div
            className="hero-stagger hero-stagger-anim mb-6 inline-flex items-center gap-3 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)]/92 px-4 py-1.5"
            style={{ '--i': 0 } as React.CSSProperties}
          >
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-accent-gradient shadow-[0_0_12px_var(--accent-1)]"
            />
            <span className="font-mono-tech text-[10px] font-semibold tracking-[0.22em] uppercase text-[var(--text-primary)]">
              {t.hero.badge}
            </span>
          </div>

          <h1 className="font-display text-[clamp(2.65rem,7.2vw,6.6rem)] font-bold leading-[0.94] tracking-[-0.03em]">
            <span className="block">{renderLine(t.hero.headlineLine1)}</span>
            <span className="block">{renderLine(t.hero.headlineLine2)}</span>
            <span className="block">{renderLine(t.hero.headlineLine3, true)}</span>
          </h1>

          <p
            className="hero-stagger hero-stagger-anim font-serif-accent mt-6 text-xl italic tracking-wide text-[var(--accent-text)] sm:text-2xl"
            style={{ '--i': 1 } as React.CSSProperties}
          >
            {t.hero.signature}
          </p>

          <p
            className="hero-stagger hero-stagger-anim mt-4 max-w-xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-base"
            style={{ '--i': 2 } as React.CSSProperties}
          >
            {t.hero.clientPitch}
          </p>

          <div
            className="hero-stagger hero-stagger-anim mt-8 flex flex-wrap items-center gap-4"
            style={{ '--i': 3 } as React.CSSProperties}
          >
            <Magnetic>
              <button
                type="button"
                onClick={() => scrollTo('contact')}
                data-cursor={locale === 'fr' ? 'GO' : 'START'}
                className="group inline-flex cursor-pointer items-center gap-3 rounded-full bg-accent-gradient px-7 py-4 font-mono-tech text-xs font-bold tracking-[0.18em] uppercase text-[var(--accent-on-solid)] shadow-[0_14px_45px_var(--glow-primary)] transition-transform duration-300 hover:scale-[1.03]"
              >
                <span>{t.hero.ctaPrimary}</span>
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </Magnetic>

            <Magnetic>
              <button
                type="button"
                onClick={() => scrollTo('works')}
                data-cursor={locale === 'fr' ? 'VOIR' : 'VIEW'}
                className="inline-flex cursor-pointer items-center gap-3 rounded-full border border-[var(--border-strong)] bg-[var(--bg-card)]/92 px-7 py-4 font-mono-tech text-xs font-semibold tracking-[0.18em] uppercase text-[var(--text-primary)] transition-colors hover:border-[var(--accent-1)] hover:text-[var(--accent-text)]"
              >
                {t.hero.ctaSecondary}
              </button>
            </Magnetic>
          </div>
        </div>

        {/* Colonne droite : Objet signature JK interactif + capsule showreel muet */}
        <div
          className="hero-stagger hero-stagger-anim relative flex flex-col items-center gap-6 lg:col-span-5"
          style={{ '--i': 4 } as React.CSSProperties}
        >
          <InteractiveMonogramJK size="hero" caption={t.hero.monogramCaption} />

          {/* Capsule showreel : poster WebP ultra-léger (12 Ko) au chargement, vidéo chargée uniquement au survol desktop */}
          <button
            type="button"
            onClick={() => scrollTo('works')}
            onMouseEnter={() => {
              if (
                window.innerWidth >= 1024 &&
                !window.matchMedia('(prefers-reduced-motion: reduce)').matches
              ) {
                setLoadHeroVideo(true);
              }
            }}
            data-cursor={locale === 'fr' ? 'LIRE' : 'PLAY'}
            className="glass-panel group relative flex w-full max-w-sm cursor-pointer items-center gap-4 overflow-hidden rounded-2xl p-2.5 text-left transition-transform duration-300 hover:-translate-y-1 hover:border-[var(--accent-1)]"
          >
            <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-xl bg-black">
              {loadHeroVideo ? (
                <video
                  ref={videoRef}
                  className="h-full w-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="none"
                  poster={resolveAssetUrl(HERO_MEDIA.posterWebp)}
                  aria-hidden="true"
                >
                  <source src={resolveAssetUrl(HERO_MEDIA.videoWebm)} type="video/webm" />
                  <source src={resolveAssetUrl(HERO_MEDIA.videoMp4)} type="video/mp4" />
                </video>
              ) : (
                <img
                  src={resolveAssetUrl(HERO_MEDIA.posterWebp)}
                  alt=""
                  width={112}
                  height={64}
                  decoding="async"
                  className="h-full w-full object-cover"
                  aria-hidden="true"
                />
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-black/25 text-white">
                <Play className="h-4 w-4 fill-current" />
              </span>
            </div>
            <div className="min-w-0 flex-1 pr-2">
              <p className="font-mono-tech text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--accent-text)]">
                {t.hero.showreelLabel}
              </p>
              <p className="mt-1 truncate text-xs font-medium text-[var(--text-primary)]">
                Pub Nexora Tech · Reel 720p
              </p>
              <p className="font-mono-tech mt-0.5 text-[10px] text-[var(--text-muted)]">
                LOOP // 00:12
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Pied du Hero : centré et dégagé des pilules flottantes bas gauche/droite */}
      <div
        className="hero-stagger hero-stagger-anim relative z-10 mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-center gap-6 border-t border-[var(--border-subtle)] px-5 pt-5 font-mono-tech text-[10px] tracking-[0.22em] uppercase text-[var(--text-muted)] sm:justify-between sm:px-8 lg:px-12"
        style={{ '--i': 5 } as React.CSSProperties}
      >
        <span className="hidden md:inline">
          DESIGN · FILM · DIGITAL · TIC · WEB
        </span>
        <button
          type="button"
          onClick={() => scrollTo('manifesto')}
          className="inline-flex cursor-pointer items-center gap-2.5 text-[var(--text-primary)] transition-colors hover:text-[var(--accent-text)]"
        >
          <span>{t.hero.scrollHint}</span>
          <ArrowDown className="h-3.5 w-3.5 animate-bounce text-[var(--accent-1)]" />
        </button>
        <span className="hidden font-mono-tech text-[10px] tracking-[0.22em] text-[var(--accent-text)] md:inline">
          KAIROS // STUDIO
        </span>
      </div>
    </section>
  );
};
