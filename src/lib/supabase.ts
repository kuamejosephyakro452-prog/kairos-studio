import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const SUPABASE_REQUEST_TIMEOUT_MS = 15_000;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('votre-projet')
);

/**
 * Calcule l'URL exacte de redirection OAuth vers /admin, compatible GitHub Pages
 * (ex. https://kuamejosephyakro452-prog.github.io/kairos-studio/admin) et local.
 */
export function getAdminOAuthRedirectUrl(): string {
  if (typeof window === 'undefined') return '';
  const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
  return `${window.location.origin}${base}/admin`;
}

/**
 * Wrapper fetch appliquant un délai maximum raisonnable sur chaque requête Supabase
 * pour éviter les blocages infinis sur connexion mobile ou instable.
 */
function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  // Ne jamais remplacer un signal déjà fourni par l'appelant sans le relayer
  if (init?.signal) {
    return fetch(input, init);
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SUPABASE_REQUEST_TIMEOUT_MS);
  return fetch(input, { ...init, signal: controller.signal }).finally(() => {
    clearTimeout(timer);
  });
}

let clientInstance: SupabaseClient | null = null;
let warmupDone = false;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!clientInstance) {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        flowType: 'pkce',
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'kairos-studio-auth',
      },
      global: {
        fetch: fetchWithTimeout,
      },
    });
  }
  return clientInstance;
}

/**
 * Préchauffe discrètement la connexion DNS/TLS vers Supabase Auth dès l'ouverture
 * de /admin afin d'économiser 400 à 700 ms lors de la connexion.
 * Totalement non bloquant et sans exposition de secret.
 */
export function prewarmSupabaseAuth(): void {
  if (!isSupabaseConfigured || warmupDone || typeof window === 'undefined') return;
  warmupDone = true;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5_000);
  fetch(`${supabaseUrl}/auth/v1/health`, {
    method: 'GET',
    headers: { apikey: supabaseAnonKey },
    signal: controller.signal,
    cache: 'no-store',
  })
    .catch(() => {
      warmupDone = false;
    })
    .finally(() => clearTimeout(timer));
}
