import React, { useEffect, useRef } from 'react';
import { MonogramJK } from './MonogramJK';

interface InteractiveMonogramJKProps {
  caption?: string;
  size?: 'hero' | 'founder';
}

/**
 * Objet signature JK réactif au curseur (zéro re-render React par frame) :
 * Parallaxe 3D pilotée directement par refs DOM + mise en veille automatique hors écran ou à l'arrêt.
 */
export const InteractiveMonogramJK: React.FC<InteractiveMonogramJKProps> = ({
  caption,
  size = 'hero',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const coordRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const container = containerRef.current;
    if (!container) return;

    let rafId = 0;
    let isVisible = true;
    const target = { rx: 0, ry: 0, gx: 0, gy: 0 };
    const current = { rx: 0, ry: 0, gx: 0, gy: 0 };

    const applyDom = () => {
      if (sceneRef.current) {
        sceneRef.current.style.transform = `rotateX(${current.rx.toFixed(2)}deg) rotateY(${current.ry.toFixed(2)}deg)`;
      }
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${current.gx.toFixed(1)}px, ${current.gy.toFixed(1)}px, 0)`;
      }
      if (coordRef.current) {
        coordRef.current.textContent = `X:${Math.round(current.ry).toString().padStart(2, '0')} Y:${Math.round(current.rx).toString().padStart(2, '0')}`;
      }
    };

    const tick = () => {
      rafId = 0;
      if (!isVisible) return;

      current.rx += (target.rx - current.rx) * 0.1;
      current.ry += (target.ry - current.ry) * 0.1;
      current.gx += (target.gx - current.gx) * 0.1;
      current.gy += (target.gy - current.gy) * 0.1;

      applyDom();

      const stillMoving =
        Math.abs(target.rx - current.rx) > 0.04 ||
        Math.abs(target.ry - current.ry) > 0.04 ||
        Math.abs(target.gx - current.gx) > 0.2 ||
        Math.abs(target.gy - current.gy) > 0.2;

      if (stillMoving) {
        rafId = requestAnimationFrame(tick);
      }
    };

    const wake = () => {
      if (!rafId && isVisible) {
        rafId = requestAnimationFrame(tick);
      }
    };

    const onMove = (e: MouseEvent) => {
      if (!isVisible) return;
      const rect = container.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = Math.max(-1, Math.min(1, (e.clientX - cx) / (window.innerWidth * 0.45)));
      const dy = Math.max(-1, Math.min(1, (e.clientY - cy) / (window.innerHeight * 0.45)));
      target.ry = dx * 16;
      target.rx = -dy * 14;
      target.gx = dx * 26;
      target.gy = dy * 26;
      wake();
    };

    const io =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            ([entry]) => {
              isVisible = entry.isIntersecting;
              if (!isVisible && rafId) {
                cancelAnimationFrame(rafId);
                rafId = 0;
              }
            },
            { threshold: 0.01 }
          )
        : null;
    io?.observe(container);

    window.addEventListener('mousemove', onMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMove);
      io?.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
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
        {/* Halo chromatique léger déplacé par GPU transform (sans blur-3xl coûteux) */}
        <div
          ref={glowRef}
          aria-hidden="true"
          className="pointer-events-none absolute -inset-8 rounded-full opacity-75 will-change-transform"
          style={{
            background:
              'radial-gradient(circle, var(--glow-primary) 0%, var(--glow-secondary) 40%, transparent 70%)',
          }}
        />

        {/* Scène 3D inclinable */}
        <div
          ref={sceneRef}
          className="relative flex h-full w-full items-center justify-center will-change-transform"
          style={{ transformStyle: 'preserve-3d' }}
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

          {/* Monolithe central avec monogramme JK */}
          <div
            className="glass-panel relative flex h-[62%] w-[62%] flex-col items-center justify-center rounded-3xl shadow-[var(--shadow-elevated)]"
            style={{ transform: 'translateZ(42px)' }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-3xl opacity-35"
              style={{
                background:
                  'radial-gradient(circle at 35% 30%, var(--accent-1), transparent 65%)',
              }}
            />
            <MonogramJK
              size={size === 'hero' ? 116 : 124}
              showFrame={false}
              className="relative z-10"
            />
            <span className="font-mono-tech relative z-10 mt-2 text-[9px] tracking-[0.34em] uppercase text-[var(--text-muted)]">
              JK // STUDIO
            </span>
          </div>

          {/* Étiquettes techniques flottantes */}
          <span
            ref={coordRef}
            aria-hidden="true"
            className="font-mono-tech absolute top-4 right-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] px-2.5 py-1 text-[9px] tracking-[0.2em] text-[var(--accent-text)]"
            style={{ transform: 'translateZ(64px)' }}
          >
            X:00 Y:00
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
