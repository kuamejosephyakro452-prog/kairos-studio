import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowDownRight, Play } from 'lucide-react';
import { DICTIONARY } from '@/i18n/translations';
import { resolveAssetUrl } from '@/lib/media';
import type { Locale } from '@/types/portfolio';
import { Magnetic } from './Magnetic';
import { WebGLGoldShader } from './WebGLGoldShader';

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
      gsap.from('.hero-reveal-word', {
        yPercent: 115,
        opacity: 0,
        duration: 1.0,
        stagger: 0.08,
        ease: 'power4.out',
        delay: 0.15,
      });
      gsap.from('.hero-fade-up', {
        y: 26,
        opacity: 0,
        duration: 0.85,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.45,
      });
    }, heroRef);

    return () => ctx.revert();
  }, [locale]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const renderRevealLine = (line: string, goldGradient = false) =>
    line.split(' ').map((word, idx) => (
      <span
        key={`${word}-${idx}`}
        className="inline-block overflow-hidden align-top pb-[0.16em] pr-[0.08em] -mb-[0.12em] mr-[0.2em]"
      >
        <span
          className={`hero-reveal-word inline-block ${
            goldGradient ? 'text-gold-gradient' : ''
          }`}
        >
          {word}
        </span>
      </span>
    ));

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-[#0B0B0C] pt-28 pb-12 text-[#F4EEE3] sm:pb-16"
    >
      {/* Fond Showreel vidéo muet (créé à partir des créations locales) */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#0B0B0C]">
        <video
          className="h-full w-full scale-[1.03] object-cover opacity-50"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster={resolveAssetUrl('media/images/hero-showreel-poster-1600w.webp')}
          aria-hidden="true"
        >
          <source src={resolveAssetUrl('media/video/hero-showreel.webm')} type="video/webm" />
          <source src={resolveAssetUrl('media/video/hero-showreel.mp4')} type="video/mp4" />
        </video>

        {/* Voiles cinématographiques noir encre pour contraste AA irréprochable */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B0C]/85 via-[#0B0B0C]/55 to-[#0B0B0C]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0C]/92 via-[#0B0B0C]/58 to-[#0B0B0C]/30" />

        {/* Shader WebGL doré discret (chargé en différé, desktop uniquement) */}
        <WebGLGoldShader className="absolute inset-0 mix-blend-screen opacity-55" />
      </div>

      {/* Contenu éditorial asymétrique */}
      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="hero-fade-up mb-6 flex items-center gap-3">
          <span className="h-px w-10 shrink-0 bg-gradient-to-r from-[#B8913F] to-[#E8C877]" />
          <span className="text-[11px] font-semibold tracking-[0.26em] uppercase text-[#E8C877]">
            {t.hero.eyebrow}
          </span>
        </div>

        <h1 className="max-w-5xl font-display text-[clamp(2.55rem,8vw,7.4rem)] font-light leading-[0.96] tracking-[-0.015em] text-[#F4EEE3]">
          <span className="block">{renderRevealLine(t.hero.headlineLine1, false)}</span>
          <span className="block italic">{renderRevealLine(t.hero.headlineLine2, true)}</span>
        </h1>

        <div className="mt-10 grid gap-8 border-t border-[#F4EEE3]/14 pt-8 lg:grid-cols-12 lg:items-end">
          {/* Signature & note Kairos */}
          <div className="hero-fade-up lg:col-span-6">
            <p className="font-editorial text-2xl tracking-wide text-[#E8C877] sm:text-3xl">
              {t.hero.signature}
            </p>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#D8D0C3] sm:text-base">
              {t.hero.kairosNote}
            </p>
          </div>

          {/* Actions magnétiques */}
          <div className="hero-fade-up flex flex-wrap items-center gap-4 lg:col-span-6 lg:justify-end">
            <Magnetic>
              <button
                type="button"
                onClick={() => scrollToSection('works')}
                data-cursor={locale === 'fr' ? 'VOIR' : 'VIEW'}
                className="group inline-flex cursor-pointer items-center gap-3 rounded-full bg-gold-gradient px-7 py-3.5 text-xs font-semibold tracking-[0.2em] uppercase text-[#0B0B0C] shadow-[0_12px_40px_rgba(184,145,63,0.28)] transition-transform duration-300 hover:scale-[1.02]"
              >
                <span>{t.hero.ctaPrimary}</span>
                <ArrowDownRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
              </button>
            </Magnetic>

            <Magnetic>
              <button
                type="button"
                onClick={() => scrollToSection('contact')}
                className="inline-flex cursor-pointer items-center gap-3 rounded-full border border-[#F4EEE3]/30 bg-[#0B0B0C]/45 px-7 py-3.5 text-xs font-semibold tracking-[0.2em] uppercase text-[#F4EEE3] backdrop-blur-sm transition-colors hover:border-[#E8C877] hover:text-[#E8C877]"
              >
                {t.hero.ctaSecondary}
              </button>
            </Magnetic>
          </div>
        </div>

        {/* Barre inférieure de repère cinématographique */}
        <div className="hero-fade-up mt-10 flex items-center justify-between text-[11px] tracking-[0.22em] uppercase text-[#BDB5A8]">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#E8C877]/40 text-[#E8C877]">
              <Play className="h-2.5 w-2.5 fill-current" />
            </span>
            <span>{t.hero.showreelLabel}</span>
          </div>

          <button
            type="button"
            onClick={() => scrollToSection('manifesto')}
            className="flex cursor-pointer items-center gap-3 transition-colors hover:text-[#E8C877]"
          >
            <span>{t.hero.scrollHint}</span>
            <span className="h-px w-8 bg-[#E8C877]/70" />
          </button>
        </div>
      </div>
    </section>
  );
};
