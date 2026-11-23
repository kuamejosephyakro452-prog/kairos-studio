import React, { useEffect, useRef, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const [enabled, setEnabled] = useState(false);

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
    let lastHover = false;
    let lastLabel: string | null = null;

    const animate = () => {
      rafId = 0;
      rx += (mx - rx) * 0.22;
      ry += (my - ry) * 0.22;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      }
      if (Math.abs(mx - rx) > 0.3 || Math.abs(my - ry) > 0.3) {
        rafId = requestAnimationFrame(animate);
      }
    };

    const startLoop = () => {
      if (!rafId) rafId = requestAnimationFrame(animate);
    };

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      }
      startLoop();
    };

    const applyHoverState = (hovering: boolean, label: string | null) => {
      if (hovering === lastHover && label === lastLabel) return;
      lastHover = hovering;
      lastLabel = label;

      if (dotRef.current) {
        dotRef.current.style.opacity = label ? '0' : '1';
      }
      if (ringRef.current) {
        ringRef.current.classList.toggle('is-hover', hovering);
        ringRef.current.classList.toggle('has-label', Boolean(label));
      }
      if (labelRef.current) {
        labelRef.current.textContent = label ?? '';
      }
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const labeled = target.closest<HTMLElement>('[data-cursor]');
      if (labeled) {
        applyHoverState(true, labeled.getAttribute('data-cursor'));
        return;
      }
      const interactive = target.closest<HTMLElement>(
        'a, button, [role="button"], input, textarea, select'
      );
      applyHoverState(Boolean(interactive), null);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div ref={dotRef} className="custom-cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="custom-cursor-ring" aria-hidden="true">
        <span ref={labelRef} />
      </div>
    </>
  );
};
