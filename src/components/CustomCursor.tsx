import React, { useEffect, useRef, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [hoverLabel, setHoverLabel] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduced) return;
    setEnabled(true);

    let mx = -100;
    let my = -100;
    let rx = -100;
    let ry = -100;
    let rafId = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      }
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const labeled = target.closest<HTMLElement>('[data-cursor]');
      if (labeled) {
        setIsHovering(true);
        setHoverLabel(labeled.getAttribute('data-cursor'));
        return;
      }
      const interactive = target.closest<HTMLElement>(
        'a, button, [role="button"], input, textarea, select'
      );
      if (interactive) {
        setIsHovering(true);
        setHoverLabel(null);
      } else {
        setIsHovering(false);
        setHoverLabel(null);
      }
    };

    const animate = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      }
      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver, { passive: true });
    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={dotRef}
        className={`custom-cursor-dot ${hoverLabel ? 'opacity-0' : 'opacity-100'}`}
        aria-hidden="true"
      />
      <div
        ref={ringRef}
        className={`custom-cursor-ring ${isHovering ? 'is-hover' : ''} ${
          hoverLabel ? 'has-label' : ''
        }`}
        aria-hidden="true"
      >
        {hoverLabel && <span>{hoverLabel}</span>}
      </div>
    </>
  );
};
