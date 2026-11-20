import React, { useEffect, useRef, useState } from 'react';
import { MonogramJK } from './MonogramJK';

interface InteractiveMonogramJKProps {
  caption?: string;
  size?: 'hero' | 'founder';
}

/**
 * Objet signature JK réactif au curseur :
 * Parallaxe 3D multicouche, anneaux orbitaux, coordonnées live et halo lumineux adaptatif.
 */
export const InteractiveMonogramJK: React.FC<InteractiveMonogramJKProps> = ({
  caption,
  size = 'hero',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, gx: 50, gy: 50 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let rafId = 0;
    const target = { rx: 0, ry: 0, gx: 50, gy: 50 };
    const current = { rx: 0, ry: 0, gx: 50, gy: 50 };

    const onMove = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = Math.max(-1, Math.min(1, (e.clientX - cx) / (window.innerWidth * 0.45)));
      const dy = Math.max(-1, Math.min(1, (e.clientY - cy) / (window.innerHeight * 0.45)));
      target.ry = dx * 18;
      target.rx = -dy * 16;
      target.gx = 50 + dx * 35;
      target.gy = 50 + dy * 35;
    };

    const tick = () => {
      current.rx += (target.rx - current.rx) * 0.08;
      current.ry += (target.ry - current.ry) * 0.08;
      current.gx += (target.gx - current.gx) * 0.08;
      current.gy += (target.gy - current.gy) * 0.08;
      setTilt({
        rx: Number(current.rx.toFixed(2)),
        ry: Number(current.ry.toFixed(2)),
        gx: Number(current.gx.toFixed(1)),
        gy: Number(current.gy.toFixed(1)),
      });
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const dimClass =
    size === 'hero'
      ? 'h-[260px] w-[260px] sm:h-[320px] sm:w-[320px] lg:h-[380px] lg:w-[380px]'
      : 'h-[290px] w-[290px] sm:h-[360px] sm:w-[360px]';

  return (
    <div ref={containerRef} className="relative flex flex-col items-center justify-center select-none">
      <div
        className={`relative flex items-center justify-center ${dimClass}`}
        style={{ perspective: '1000px' }}
      >
        {/* Halo chromatique qui suit le curseur */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-6 rounded-full opacity-75 blur-3xl transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, var(--glow-primary), var(--glow-secondary) 45%, transparent 72%)`,
          }}
        />

        {/* Scène 3D inclinable */}
        <div
          className="relative flex h-full w-full items-center justify-center will-change-transform"
          style={{
            transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Anneau orbital extérieur */}
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-full border border-dashed"
            style={{
              borderColor: 'var(--border-strong)',
              transform: 'translateZ(-24px)',
            }}
          />

          {/* Anneau intérieur avec repères cardinaux */}
          <div
            aria-hidden="true"
            className="absolute inset-6 rounded-full border"
            style={{
              borderColor: 'var(--border-subtle)',
              transform: 'translateZ(12px)',
            }}
          >
            <span
              className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full"
              style={{ background: 'var(--accent-1)' }}
            />
            <span
              className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full"
              style={{ background: 'var(--accent-2)' }}
            />
          </div>

          {/* Monolithe central en verre avec monogramme JK */}
          <div
            className="glass-panel relative flex h-[62%] w-[62%] flex-col items-center justify-center rounded-3xl shadow-[var(--shadow-elevated)]"
            style={{ transform: 'translateZ(42px)' }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-3xl opacity-40"
              style={{
                background: `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, var(--accent-1), transparent 65%)`,
              }}
            />
            <MonogramJK
              size={size === 'hero' ? 116 : 124}
              showFrame={false}
              className="relative z-10 drop-shadow-[0_10px_28px_rgba(0,0,0,0.45)]"
            />
            <span className="font-mono-tech relative z-10 mt-2 text-[9px] tracking-[0.34em] uppercase text-[var(--text-muted)]">
              JK // STUDIO
            </span>
          </div>

          {/* Étiquettes techniques flottantes */}
          <span
            aria-hidden="true"
            className="font-mono-tech absolute top-4 right-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)]/85 px-2.5 py-1 text-[9px] tracking-[0.2em] text-[var(--accent-text)] backdrop-blur-md"
            style={{ transform: 'translateZ(64px)' }}
          >
            X:{tilt.ry.toFixed(0).padStart(2, '0')} Y:{tilt.rx.toFixed(0).padStart(2, '0')}
          </span>
        </div>
      </div>

      {caption && (
        <p className="font-mono-tech mt-4 text-[10px] tracking-[0.22em] uppercase text-[var(--text-muted)]">
          {caption}
        </p>
      )}
    </div>
  );
};
