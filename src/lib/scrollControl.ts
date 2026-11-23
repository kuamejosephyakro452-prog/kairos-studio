import type { ProjectCategory } from '@/types/portfolio';

export type WorksViewMode = 'gallery' | 'list' | 'explore';

export interface WorksReturnState {
  scrollY: number;
  activeCategory: ProjectCategory | 'all';
  viewMode: WorksViewMode;
  canvasOffset: { x: number; y: number };
  slug: string;
  savedAt: number;
}

interface LenisLike {
  scrollTo: (
    target: number | HTMLElement | string,
    options?: { immediate?: boolean; force?: boolean; offset?: number }
  ) => void;
  resize?: () => void;
}

const STORAGE_KEY = 'kairos-works-return-state';
const MAX_AGE_MS = 30 * 60 * 1000; // 30 min

let activeLenis: LenisLike | null = null;

export function registerLenis(instance: LenisLike | null): void {
  activeLenis = instance;
}

/**
 * Déplace simultanément Lenis (si actif) et window.scrollTo pour éviter tout conflit
 * ou rebond vers le bas lors des changements de route / restaurations de position.
 */
export function scrollToY(y: number, options?: { immediate?: boolean }): void {
  if (typeof window === 'undefined') return;
  const target = Math.max(0, Math.round(y));
  const immediate = options?.immediate ?? true;

  if (activeLenis) {
    activeLenis.resize?.();
    activeLenis.scrollTo(target, { immediate, force: true });
  }
  window.scrollTo({
    top: target,
    left: 0,
    behavior: immediate ? 'auto' : 'smooth',
  });
}

export function scrollToElement(el: HTMLElement, options?: { immediate?: boolean }): void {
  if (typeof window === 'undefined') return;
  const immediate = options?.immediate ?? false;
  if (activeLenis) {
    activeLenis.resize?.();
    activeLenis.scrollTo(el, { immediate, force: true });
    return;
  }
  el.scrollIntoView({ behavior: immediate ? 'auto' : 'smooth', block: 'start' });
}

export function saveWorksReturnState(state: Omit<WorksReturnState, 'savedAt'>): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: WorksReturnState = {
      ...state,
      scrollY: Math.max(0, Math.round(state.scrollY)),
      savedAt: Date.now(),
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore storage quota / private mode
  }
}

export function peekWorksReturnState(): WorksReturnState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WorksReturnState;
    if (
      typeof parsed?.scrollY !== 'number' ||
      typeof parsed?.savedAt !== 'number' ||
      Date.now() - parsed.savedAt > MAX_AGE_MS
    ) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearWorksReturnState(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
