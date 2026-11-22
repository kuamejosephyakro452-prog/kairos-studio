import React, { useEffect } from 'react';

export const SmoothScrollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    if (reduced || coarse) return;

    let cancelled = false;
    let cleanup: (() => void) | null = null;

    // Charge Lenis + ScrollTrigger en différé (desktop uniquement) pour ne pas bloquer le premier rendu
    const init = async () => {
      const [{ default: Lenis }, { default: gsap }, { ScrollTrigger }] = await Promise.all([
        import('lenis'),
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);
      const lenis = new Lenis({
        duration: 1.05,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.5,
      });

      lenis.on('scroll', ScrollTrigger.update);

      const tick = (time: number) => {
        lenis.raf(time * 1000);
      };
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      cleanup = () => {
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
    };
  }, []);

  return <>{children}</>;
};
