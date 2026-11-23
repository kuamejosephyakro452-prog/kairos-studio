import React, { useEffect } from 'react';
import { registerLenis } from '@/lib/scrollControl';

export const SmoothScrollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Empêche le navigateur de forcer une restauration de scroll avant le montage des sections
    // paresseuses (HomeBelowFold / galerie horizontale) qui renvoyait l'utilisateur en bas de page.
    let prevScrollRestoration: History['scrollRestoration'] | null = null;
    if ('scrollRestoration' in window.history) {
      prevScrollRestoration = window.history.scrollRestoration;
      window.history.scrollRestoration = 'manual';
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const lowCores =
      typeof navigator !== 'undefined' &&
      typeof navigator.hardwareConcurrency === 'number' &&
      navigator.hardwareConcurrency <= 4;
    if (reduced || coarse || lowCores) {
      return () => {
        if (prevScrollRestoration && 'scrollRestoration' in window.history) {
          window.history.scrollRestoration = prevScrollRestoration;
        }
      };
    }

    let cancelled = false;
    let cleanup: (() => void) | null = null;

    // Charge Lenis + ScrollTrigger en différé (desktop puissant uniquement) avec inertie vive et réactive
    const init = async () => {
      const [{ default: Lenis }, { default: gsap }, { ScrollTrigger }] = await Promise.all([
        import('lenis'),
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);
      const lenis = new Lenis({
        duration: 0.65,
        easing: (t) => 1 - Math.pow(1 - t, 3),
        smoothWheel: true,
        wheelMultiplier: 1.08,
        touchMultiplier: 1.4,
      });

      registerLenis(lenis);
      lenis.on('scroll', ScrollTrigger.update);

      const tick = (time: number) => {
        lenis.raf(time * 1000);
      };
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      cleanup = () => {
        registerLenis(null);
        gsap.ticker.remove(tick);
        lenis.destroy();
      };
    };

    const timer = window.setTimeout(() => {
      void init();
    }, 120);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      cleanup?.();
      if (prevScrollRestoration && 'scrollRestoration' in window.history) {
        window.history.scrollRestoration = prevScrollRestoration;
      }
    };
  }, []);

  return <>{children}</>;
};
