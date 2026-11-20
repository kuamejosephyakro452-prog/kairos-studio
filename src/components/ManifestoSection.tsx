import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DICTIONARY } from '@/i18n/translations';
import type { Locale } from '@/types/portfolio';

gsap.registerPlugin(ScrollTrigger);

interface ManifestoSectionProps {
  locale: Locale;
}

/**
 * Scène 2 — Manifeste monumental dont les mots s'illuminent progressivement au défilement.
 * Centré sur la transformation d'une idée brute en expérience concrète (zéro lien avec le sens du nom de marque).
 */
export const ManifestoSection: React.FC<ManifestoSectionProps> = ({ locale }) => {
  const t = DICTIONARY[locale];
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      const words = sectionRef.current!.querySelectorAll('.manifesto-word');
      gsap.fromTo(
        words,
        { opacity: 0.22 },
        {
          opacity: 1,
          stagger: 0.08,
          ease: 'none',
          scrollTrigger: {
            trigger: '.manifesto-text-wrap',
            start: 'top 78%',
            end: 'bottom 45%',
            scrub: 0.6,
          },
        }
      );

      gsap.from('.manifesto-step', {
        y: 36,
        opacity: 0,
        duration: 0.85,
        stagger: 0.14,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.manifesto-steps-wrap',
          start: 'top 82%',
          once: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [locale]);

  const words = t.manifesto.statement.split(' ');

  return (
    <section
      id="manifesto"
      ref={sectionRef}
      className="relative overflow-hidden border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)] py-24 text-[var(--text-primary)] sm:py-36"
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="mb-10 flex items-center gap-4">
          <span className="h-px w-12 bg-accent-gradient" />
          <p className="font-mono-tech text-[11px] font-semibold tracking-[0.26em] uppercase text-[var(--accent-text)]">
            {t.manifesto.label}
          </p>
        </div>

        {/* Texte monumental à illumination mot-par-mot au scroll */}
        <div className="manifesto-text-wrap max-w-6xl">
          <p className="font-display text-[clamp(2rem,4.7vw,4.35rem)] font-bold leading-[1.08] tracking-[-0.025em]">
            {words.map((word, idx) => (
              <span key={`${word}-${idx}`} className="manifesto-word mr-[0.24em] inline-block">
                {word}
              </span>
            ))}
          </p>
        </div>

        {/* Séquence asymétrique Signal → Forme → Expérience (pas de grille plate identique) */}
        <div className="manifesto-steps-wrap mt-20 grid gap-10 border-t border-[var(--border-subtle)] pt-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="text-base leading-relaxed text-[var(--text-muted)]">
              {t.manifesto.subtext}
            </p>
          </div>

          <div className="space-y-8 lg:col-span-8">
            {t.manifesto.steps.map((step, idx) => (
              <div
                key={step.code}
                className="manifesto-step grid gap-4 border-b border-[var(--border-subtle)] pb-8 sm:grid-cols-12 sm:items-baseline"
                style={{ paddingLeft: idx === 1 ? 'min(2.5rem, 4vw)' : idx === 2 ? 'min(5rem, 8vw)' : '0' }}
              >
                <span className="font-mono-tech text-xs font-semibold tracking-[0.2em] text-[var(--accent-text)] sm:col-span-3">
                  {step.code}
                </span>
                <h3 className="font-display text-2xl font-bold sm:col-span-4 sm:text-3xl">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-[var(--text-muted)] sm:col-span-5">
                  {step.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
