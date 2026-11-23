import React, { useEffect, useRef } from 'react';

interface FluidWebGLHeroProps {
  className?: string;
}

const SHADER_COLORS: {
  bg: [number, number, number];
  c1: [number, number, number];
  c2: [number, number, number];
  c3: [number, number, number];
  intensity: number;
} = {
  bg: [0.953, 0.933, 0.902], // #F3EEE6
  c1: [0.91, 0.224, 0.169], // #E8392B
  c2: [0.059, 0.298, 0.29], // #0F4C4A
  c3: [0.85, 0.78, 0.7], // Papier chaud accentué
  intensity: 0.34,
};

/**
 * Shader WebGL GLSL fluide multi-couches (distorsion liquide réactive au curseur).
 * Chargé en différé (requestIdleCallback) pour préserver le LCP mobile ; repli CSS mesh gradient sur appareils modestes.
 */
export const FluidWebGLHero: React.FC<FluidWebGLHeroProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Sur mobile, mode économie de données ou CPU modeste, le mesh CSS suffit et reste 60 fps
    if (window.innerWidth < 1024) return;
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    if (nav.connection?.saveData) return;
    if (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4) return;

    let rafId = 0;
    let disposed = false;
    let cleanup: (() => void) | null = null;

    const init = () => {
      if (disposed) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const gl = canvas.getContext('webgl', {
        alpha: false,
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
        uniform vec3 u_bg;
        uniform vec3 u_c1;
        uniform vec3 u_c2;
        uniform vec3 u_c3;
        uniform float u_intensity;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
            mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
            u.y
          );
        }

        float fbm(vec2 p) {
          float v = 0.0;
          float a = 0.55;
          for (int i = 0; i < 3; i++) {
            v += a * noise(p);
            p = p * 2.02 + vec2(1.7, 9.2);
            a *= 0.5;
          }
          return v;
        }

        void main() {
          vec2 uv = gl_FragCoord.xy / u_res.xy;
          vec2 p = uv * 2.0 - 1.0;
          p.x *= u_res.x / max(u_res.y, 1.0);

          vec2 m = u_mouse * 2.0 - 1.0;
          m.x *= u_res.x / max(u_res.y, 1.0);

          float t = u_time * 0.24;
          float distMouse = length(p - m);
          vec2 warp = vec2(
            fbm(p * 1.15 + vec2(t, -t * 0.6)),
            fbm(p * 1.15 + vec2(-t * 0.7, t * 0.9) + vec2(4.2, 1.3))
          );

          // Distorsion fluide attirée par le curseur
          vec2 flow = p + (warp - 0.5) * 1.35 + (m - p) * exp(-distMouse * 1.65) * 0.35;

          float f1 = smoothstep(0.22, 0.88, fbm(flow * 1.2 + vec2(t * 0.4, 0.0)));
          float f2 = smoothstep(0.28, 0.92, fbm(flow * 1.5 - vec2(0.0, t * 0.35) + warp));
          float cursorLight = exp(-distMouse * 1.95) * 0.62;

          vec3 col = u_bg;
          col = mix(col, u_c3, f1 * 0.58 * u_intensity);
          col = mix(col, u_c2, f2 * 0.52 * u_intensity);
          col = mix(col, u_c1, clamp((f1 * f2 * 1.15 + cursorLight * 0.72) * u_intensity, 0.0, 0.85));

          // Vignette douce sur les bords pour garantir une lisibilité parfaite du texte
          float edge = smoothstep(1.55, 0.35, length(uv - vec2(0.55, 0.48)));
          col = mix(u_bg, col, mix(0.45, 1.0, edge));

          gl_FragColor = vec4(col, 1.0);
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
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, 'a_pos');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

      const uRes = gl.getUniformLocation(prog, 'u_res');
      const uTime = gl.getUniformLocation(prog, 'u_time');
      const uMouse = gl.getUniformLocation(prog, 'u_mouse');
      const uBg = gl.getUniformLocation(prog, 'u_bg');
      const uC1 = gl.getUniformLocation(prog, 'u_c1');
      const uC2 = gl.getUniformLocation(prog, 'u_c2');
      const uC3 = gl.getUniformLocation(prog, 'u_c3');
      const uIntensity = gl.getUniformLocation(prog, 'u_intensity');

      const mouse = { x: 0.65, y: 0.52, tx: 0.65, ty: 0.52 };
      const resize = () => {
        const scale = 0.26; // Résolution douce upscalée — divise la charge GPU par ~3
        canvas.width = Math.max(240, Math.floor(canvas.clientWidth * scale));
        canvas.height = Math.max(150, Math.floor(canvas.clientHeight * scale));
        gl.viewport(0, 0, canvas.width, canvas.height);
      };
      resize();

      const onMove = (e: MouseEvent) => {
        mouse.tx = e.clientX / window.innerWidth;
        mouse.ty = 1 - e.clientY / window.innerHeight;
      };
      window.addEventListener('resize', resize, { passive: true });
      window.addEventListener('mousemove', onMove, { passive: true });

      const cfg = SHADER_COLORS;
      gl.uniform3fv(uBg, cfg.bg);
      gl.uniform3fv(uC1, cfg.c1);
      gl.uniform3fv(uC2, cfg.c2);
      gl.uniform3fv(uC3, cfg.c3);
      gl.uniform1f(uIntensity, cfg.intensity);

      let isVisible = true;
      let isTabVisible = !document.hidden;
      const io =
        typeof IntersectionObserver !== 'undefined'
          ? new IntersectionObserver(
              ([entry]) => {
                isVisible = entry.isIntersecting;
                if (isVisible && isTabVisible && !rafId && !disposed) {
                  rafId = requestAnimationFrame(render);
                }
              },
              { threshold: 0.01 }
            )
          : null;
      io?.observe(canvas);

      const onVisibilityChange = () => {
        isTabVisible = !document.hidden;
        if (isVisible && isTabVisible && !rafId && !disposed) {
          rafId = requestAnimationFrame(render);
        }
      };
      document.addEventListener('visibilitychange', onVisibilityChange);

      const start = performance.now();
      let lastDraw = 0;
      const FRAME_MS = 1000 / 30; // 30 fps fluides pour un mouvement lent, divise par 2 la charge GPU

      const render = (now: number) => {
        rafId = 0;
        if (disposed || !isVisible || !isTabVisible) return;
        if (now - lastDraw >= FRAME_MS) {
          lastDraw = now;
          mouse.x += (mouse.tx - mouse.x) * 0.08;
          mouse.y += (mouse.ty - mouse.y) * 0.08;

          gl.uniform2f(uRes, canvas.width, canvas.height);
          gl.uniform1f(uTime, (now - start) * 0.001);
          gl.uniform2f(uMouse, mouse.x, mouse.y);

          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
        rafId = requestAnimationFrame(render);
      };
      rafId = requestAnimationFrame(render);

      cleanup = () => {
        cancelAnimationFrame(rafId);
        io?.disconnect();
        document.removeEventListener('visibilitychange', onVisibilityChange);
        window.removeEventListener('resize', resize);
        window.removeEventListener('mousemove', onMove);
        gl.deleteProgram(prog);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        gl.deleteBuffer(buf);
      };
    };

    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    let idleId = 0;
    if (win.requestIdleCallback) {
      idleId = win.requestIdleCallback(init, { timeout: 900 });
    } else {
      idleId = window.setTimeout(init, 250);
    }

    return () => {
      disposed = true;
      if (win.cancelIdleCallback) win.cancelIdleCallback(idleId);
      else window.clearTimeout(idleId);
      cleanup?.();
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
