import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { MonogramJK } from './MonogramJK';

interface PreloaderProps {
  caption: string;
}

const SESSION_KEY = 'kairos-v2-preloader-seen';

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

  const [count, setCount] = useState(0);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible || !overlayRef.current) return;

    const counterObj = { val: 0 };
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
        duration: 0.9,
        stagger: 0.08,
        ease: 'power3.inOut',
      })
        .to(
          counterObj,
          {
            val: 100,
            duration: 1.05,
            ease: 'power2.inOut',
            onUpdate: () => setCount(Math.round(counterObj.val)),
          },
          0
        )
        .fromTo(
          '.preloader-caption',
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out' },
          0.35
        )
        .to(overlayRef.current, {
          clipPath: 'inset(0 0 100% 0)',
          duration: 0.65,
          delay: 0.1,
          ease: 'power4.inOut',
        });
    }, overlayRef);

    const failsafe = window.setTimeout(() => {
      try {
        sessionStorage.setItem(SESSION_KEY, '1');
      } catch {
        // ignore
      }
      setVisible(false);
    }, 2200);

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
      className="fixed inset-0 z-[95] flex flex-col justify-between bg-[var(--bg-primary)] p-6 text-[var(--text-primary)] sm:p-10"
      style={{ clipPath: 'inset(0 0 0% 0)' }}
    >
      <div className="bg-mesh-ambient pointer-events-none absolute inset-0 opacity-75" />

      <div className="relative flex items-center justify-between font-mono-tech text-[11px] tracking-[0.26em] uppercase text-[var(--text-muted)]">
        <span>KAIROS STUDIO</span>
        <span>JK // PORTFOLIO</span>
      </div>

      <div className="relative flex flex-col items-center gap-6 text-center">
        <MonogramJK size={108} animated showFrame />
        <p className="preloader-caption font-display text-xl font-semibold tracking-[0.14em] uppercase opacity-0 sm:text-2xl">
          {caption}
        </p>
      </div>

      <div className="relative flex items-end justify-between border-t border-[var(--border-subtle)] pt-5">
        <div className="h-1 w-44 overflow-hidden rounded-full bg-[var(--border-subtle)] sm:w-64">
          <div
            className="bg-accent-gradient h-full transition-all duration-75"
            style={{ width: `${count}%` }}
          />
        </div>
        <span className="font-mono-tech text-3xl font-semibold tracking-tight text-accent-gradient sm:text-5xl">
          {String(count).padStart(3, '0')}
        </span>
      </div>
    </div>
  );
};
