import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { MonogramJK } from './MonogramJK';

interface PreloaderProps {
  caption: string;
}

const SESSION_KEY = 'kairos-preloader-seen';

export const Preloader: React.FC<PreloaderProps> = ({ caption }) => {
  const [visible, setVisible] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    try {
      return !sessionStorage.getItem(SESSION_KEY);
    } catch {
      return false;
    }
  });

  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible || !overlayRef.current) return;

    const ctx = gsap.context(() => {
      const paths = overlayRef.current!.querySelectorAll<SVGGeometryElement>('.jk-stroke');
      paths.forEach((p) => {
        const len = p.getTotalLength();
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      });

      const tl = gsap.timeline({
        onComplete: () => {
          try {
            sessionStorage.setItem(SESSION_KEY, '1');
          } catch {
            // ignore
          }
          setVisible(false);
        },
      });

      tl.to(paths, {
        strokeDashoffset: 0,
        duration: 0.95,
        stagger: 0.08,
        ease: 'power3.inOut',
      })
        .fromTo(
          '.preloader-wordmark',
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out' },
          '-=0.35'
        )
        .to(
          '.preloader-line',
          { scaleX: 1, duration: 0.45, ease: 'power2.inOut' },
          '-=0.3'
        )
        .to(overlayRef.current, {
          clipPath: 'inset(0 0 100% 0)',
          duration: 0.65,
          delay: 0.12,
          ease: 'power4.inOut',
        });
    }, overlayRef);

    // Sécurité absolue : ne jamais bloquer le site plus de 2,4 s
    const failsafe = window.setTimeout(() => {
      try {
        sessionStorage.setItem(SESSION_KEY, '1');
      } catch {
        // ignore
      }
      setVisible(false);
    }, 2400);

    return () => {
      window.clearTimeout(failsafe);
      ctx.revert();
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      className="fixed inset-0 z-[95] flex flex-col items-center justify-center bg-[#0B0B0C] text-[#F4EEE3]"
      style={{ clipPath: 'inset(0 0 0% 0)' }}
    >
      <div className="gold-aura absolute inset-0 opacity-70" />
      <div className="relative flex flex-col items-center gap-6 px-6 text-center">
        <MonogramJK size={96} animated showFrame />
        <div className="preloader-wordmark opacity-0">
          <p className="font-display text-2xl tracking-[0.28em] uppercase text-[#F4EEE3] sm:text-3xl">
            KAIROS STUDIO
          </p>
          <p className="mt-1.5 text-[11px] tracking-[0.26em] uppercase text-[#E8C877]/80">
            {caption}
          </p>
        </div>
        <div className="preloader-line h-px w-40 origin-left scale-x-0 bg-gradient-to-r from-transparent via-[#E8C877] to-transparent" />
      </div>
    </div>
  );
};
