import React, { useEffect, useRef } from 'react';

/**
 * Shader WebGL GLSL ultra-léger (< 3 Ko, sans Three.js) pour le Hero.
 * Crée une aura dorée et fluide discrète au-dessus du showreel.
 * Chargé en différé et désactivé sur mobile ou prefers-reduced-motion.
 */
export const WebGLGoldShader: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.innerWidth < 768) return; // Allégé sur mobile

    let rafId = 0;
    let disposed = false;
    let cleanupFn: (() => void) | null = null;

    const init = () => {
      if (disposed) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const gl = canvas.getContext('webgl', {
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        powerPreference: 'low-power',
      });
      if (!gl) return;

      const vert = `
        attribute vec2 a_pos;
        void main() {
          gl_Position = vec4(a_pos, 0.0, 1.0);
        }
      `;

      const frag = `
        precision mediump float;
        uniform vec2 u_res;
        uniform float u_time;
        uniform vec2 u_mouse;

        void main() {
          vec2 uv = gl_FragCoord.xy / u_res.xy;
          vec2 p = uv * 2.0 - 1.0;
          p.x *= u_res.x / max(u_res.y, 1.0);

          float t = u_time * 0.35;
          float wave = sin(p.x * 2.2 + t) * cos(p.y * 1.8 - t * 0.7);
          float ribbon = smoothstep(0.62, 0.98, 0.5 + 0.5 * wave);

          // Halo doux centré vers le coin supérieur droit + suivi discret du curseur
          float cornerGlow = exp(-length(uv - vec2(0.78, 0.72)) * 2.8) * 0.36;
          vec2 m = (u_mouse * 2.0 - 1.0);
          m.x *= u_res.x / max(u_res.y, 1.0);
          float mouseGlow = exp(-length(p - m) * 2.4) * 0.28;

          float alpha = clamp((ribbon * 0.12 + cornerGlow + mouseGlow) * 0.55, 0.0, 0.28);
          vec3 goldDeep = vec3(0.72, 0.57, 0.25);
          vec3 goldLight = vec3(0.91, 0.78, 0.47);
          vec3 col = mix(goldDeep, goldLight, clamp(uv.y, 0.0, 1.0));

          // Sortie prémultipliée pour éviter tout voile opaque sur fond noir encre
          gl_FragColor = vec4(col * alpha, alpha);
        }
      `;

      const compile = (type: number, src: string) => {
        const s = gl.createShader(type);
        if (!s) return null;
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
          gl.deleteShader(s);
          return null;
        }
        return s;
      };

      const vs = compile(gl.VERTEX_SHADER, vert);
      const fs = compile(gl.FRAGMENT_SHADER, frag);
      if (!vs || !fs) return;

      const prog = gl.createProgram();
      if (!prog) return;
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
      gl.useProgram(prog);

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        gl.STATIC_DRAW
      );
      const loc = gl.getAttribLocation(prog, 'a_pos');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

      const uRes = gl.getUniformLocation(prog, 'u_res');
      const uTime = gl.getUniformLocation(prog, 'u_time');
      const uMouse = gl.getUniformLocation(prog, 'u_mouse');

      const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };

      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
        canvas.width = Math.floor(canvas.clientWidth * dpr * 0.5);
        canvas.height = Math.floor(canvas.clientHeight * dpr * 0.5);
        gl.viewport(0, 0, canvas.width, canvas.height);
      };
      resize();

      const onMove = (e: MouseEvent) => {
        mouse.tx = e.clientX / window.innerWidth;
        mouse.ty = 1 - e.clientY / window.innerHeight;
      };
      window.addEventListener('resize', resize, { passive: true });
      window.addEventListener('mousemove', onMove, { passive: true });

      const start = performance.now();
      const render = (now: number) => {
        if (disposed) return;
        mouse.x += (mouse.tx - mouse.x) * 0.05;
        mouse.y += (mouse.ty - mouse.y) * 0.05;
        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform1f(uTime, (now - start) * 0.001);
        gl.uniform2f(uMouse, mouse.x, mouse.y);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        rafId = requestAnimationFrame(render);
      };
      rafId = requestAnimationFrame(render);

      cleanupFn = () => {
        cancelAnimationFrame(rafId);
        window.removeEventListener('resize', resize);
        window.removeEventListener('mousemove', onMove);
        gl.deleteProgram(prog);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        gl.deleteBuffer(buf);
      };
    };

    // Chargement différé pour préserver le temps d'interaction initial
    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    let idleId = 0;
    if (win.requestIdleCallback) {
      idleId = win.requestIdleCallback(init, { timeout: 1200 });
    } else {
      idleId = window.setTimeout(init, 400);
    }

    return () => {
      disposed = true;
      if (win.cancelIdleCallback) win.cancelIdleCallback(idleId);
      else window.clearTimeout(idleId);
      cleanupFn?.();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none h-full w-full ${className}`}
    />
  );
};
