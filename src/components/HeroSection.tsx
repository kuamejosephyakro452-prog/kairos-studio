import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowDown, ArrowUpRight, Play } from 'lucide-react';
import { DICTIONARY } from '@/i18n/translations';
import { HERO_MEDIA } from '@/content/media';
import { resolveAssetUrl } from '@/lib/media';
import type { Locale } from '@/types/portfolio';
import { FluidWebGLHero } from './FluidWebGLHero';
import { InteractiveMonogramJK } from './InteractiveMonogramJK';
import { Magnetic } from './Magnetic';

interface HeroSectionProps {
  locale: Locale;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ locale }) => {
  const t = DICTIONARY[locale];
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.from('.hero-word', {
        yPercent: 115,
        opacity: 0,
        duration: 0.95,
        stagger: 0.065,
        ease: 'power4.out',
        delay: 0.12,
      });
      gsap.from('.hero-stagger', {
        y: 26,
        opacity: 0,
        duration: 0.8,
        stagger: 0.09,
        ease: 'power3.out',
        delay: 0.35,
      });
    }, heroRef);

    return () => ctx.revert();
  }, [locale]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const renderLine = (text: string, accent = false) =>
    text.split(' ').map((word, idx) => (
      <span
        key={`${word}-${idx}`}
        className="inline-block overflow-hidden align-top pb-[0.14em] pr-[0.06em] -mb-[0.12em] mr-[0.2em]"
      >
        <span className={`hero-word inline-block ${accent ? 'text-accent-gradient' : ''}`}>
          {word}
        </span>
      </span>
    ));

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden bg-[var(--bg-primary)] pt-28 pb-20 text-[var(--text-primary)] sm:pt-32 sm:pb-24"
    >
      {/* Repli CSS mesh gradient haute performance (mobile & avant WebGL) */}
      <div className="bg-mesh-ambient pointer-events-none absolute inset-0 opacity-95" />

      {/* Shader WebGL fluide GLSL chargé en différé (desktop) */}
      <div className="pointer-events-none absolute inset-0 opacity-90">
        <FluidWebGLHero />
      </div>

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
          <div className="hero-stagger mb-6 inline-flex items-center gap-3 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)]/70 px-4 py-1.5 backdrop-blur-md">
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

          <p className="hero-stagger font-serif-accent mt-6 text-xl italic tracking-wide text-[var(--accent-text)] sm:text-2xl">
            {t.hero.signature}
          </p>

          <p className="hero-stagger mt-4 max-w-xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
            {t.hero.clientPitch}
          </p>

          <div className="hero-stagger mt-8 flex flex-wrap items-center gap-4">
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
                className="inline-flex cursor-pointer items-center gap-3 rounded-full border border-[var(--border-strong)] bg-[var(--bg-card)]/65 px-7 py-4 font-mono-tech text-xs font-semibold tracking-[0.18em] uppercase text-[var(--text-primary)] backdrop-blur-md transition-colors hover:border-[var(--accent-1)] hover:text-[var(--accent-text)]"
              >
                {t.hero.ctaSecondary}
              </button>
            </Magnetic>
          </div>
        </div>

        {/* Colonne droite : Objet signature JK interactif + capsule showreel muet */}
        <div className="hero-stagger relative flex flex-col items-center gap-6 lg:col-span-5">
          <InteractiveMonogramJK size="hero" caption={t.hero.monogramCaption} />

          {/* Capsule showreel muet flottante */}
          <button
            type="button"
            onClick={() => scrollTo('works')}
            data-cursor={locale === 'fr' ? 'LIRE' : 'PLAY'}
            className="glass-panel group relative flex w-full max-w-sm cursor-pointer items-center gap-4 overflow-hidden rounded-2xl p-2.5 text-left transition-transform duration-300 hover:-translate-y-1 hover:border-[var(--accent-1)]"
          >
            <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-xl bg-black">
              <video
                className="h-full w-full object-cover"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                poster={resolveAssetUrl(HERO_MEDIA.posterWebp)}
                aria-hidden="true"
              >
                <source src={resolveAssetUrl(HERO_MEDIA.videoWebm)} type="video/webm" />
                <source src={resolveAssetUrl(HERO_MEDIA.videoMp4)} type="video/mp4" />
              </video>
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
      <div className="hero-stagger relative z-10 mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-center gap-6 border-t border-[var(--border-subtle)] px-5 pt-5 font-mono-tech text-[10px] tracking-[0.22em] uppercase text-[var(--text-muted)] sm:justify-between sm:px-8 lg:px-12">
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
