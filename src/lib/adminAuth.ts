import type { AuthError, Session, SupabaseClient } from '@supabase/supabase-js';

export type AdminAuthErrorKind =
  | 'invalid_credentials'
  | 'unauthorized_account'
  | 'oauth_provider_disabled'
  | 'oauth_cancelled'
  | 'rate_limited'
  | 'timeout'
  | 'network_or_server'
  | 'unconfigured'
  | 'unknown';

export interface ClassifiedAuthError {
  kind: AdminAuthErrorKind;
  message: string;
  retryable: boolean;
}

export interface AuthTimingMetrics {
  signInMs: number;
  attempts: number;
}

const DEFAULT_TIMEOUT_MS = 15_000;
const NETWORK_RETRY_DELAY_MS = 900;

function extractStatus(err: unknown): number | undefined {
  if (!err || typeof err !== 'object') return undefined;
  const candidate = err as { status?: unknown; statusCode?: unknown };
  if (typeof candidate.status === 'number') return candidate.status;
  if (typeof candidate.statusCode === 'number') return candidate.statusCode;
  return undefined;
}

function extractCode(err: unknown): string {
  if (!err || typeof err !== 'object') return '';
  const candidate = err as { code?: unknown; error_code?: unknown; name?: unknown };
  const parts = [candidate.code, candidate.error_code, candidate.name]
    .filter((v): v is string => typeof v === 'string' && v.length > 0)
    .map((v) => v.toLowerCase());
  return parts.join(' ');
}

function extractMessage(err: unknown): string {
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
    return err.message;
  }
  return '';
}

/**
 * Classifie rigoureusement toute erreur d'authentification (GitHub OAuth, e-mail/mot de passe
 * ou réseau) afin de ne JAMAIS confondre une erreur réseau, un timeout ou un rate-limit
 * avec un refus d'identifiants.
 */
export function classifyAuthError(
  err: unknown,
  options?: { isOnline?: boolean }
): ClassifiedAuthError {
  const status = extractStatus(err);
  const code = extractCode(err);
  const msg = extractMessage(err).toLowerCase();
  const isOffline =
    options?.isOnline === false ||
    (options?.isOnline === undefined &&
      typeof navigator !== 'undefined' &&
      navigator.onLine === false);

  // 1. Délai dépassé (AbortError / TimeoutError / HTTP 408 / 504)
  if (
    code.includes('aborterror') ||
    code.includes('timeouterror') ||
    status === 408 ||
    status === 504 ||
    /timeout|timed out|délai dépassé|signal is aborted|aborted/.test(msg)
  ) {
    return {
      kind: 'timeout',
      message:
        'Délai dépassé : le serveur ne répond pas dans les temps. Vérifiez votre connexion puis réessayez.',
      retryable: true,
    };
  }

  // 2. Limitation de tentatives (HTTP 429 ou code rate_limit Supabase)
  if (
    status === 429 ||
    code.includes('over_request_rate_limit') ||
    code.includes('over_email_send_rate_limit') ||
    /rate limit|too many requests|trop de tentatives|for security purposes/.test(msg)
  ) {
    return {
      kind: 'rate_limited',
      message: 'Trop de tentatives, réessayez dans quelques minutes.',
      retryable: false,
    };
  }

  // 3. Fournisseur GitHub non activé côté Supabase Dashboard
  if (
    code.includes('validation_failed') && /provider is not enabled|unsupported provider/.test(msg) ||
    /provider is not enabled|unsupported provider|oauth_provider_not_supported/.test(msg)
  ) {
    return {
      kind: 'oauth_provider_disabled',
      message:
        'La connexion GitHub n’est pas encore activée dans Supabase Auth. Activez le fournisseur GitHub dans votre tableau de bord Supabase ou utilisez la connexion de secours.',
      retryable: false,
    };
  }

  // 4. Compte non autorisé / inscriptions publiques désactivées (autre compte GitHub)
  if (
    code.includes('signup_disabled') ||
    code.includes('user_banned') ||
    /signups not allowed|signup_disabled|not allowed for this instance|user is banned/.test(msg)
  ) {
    return {
      kind: 'unauthorized_account',
      message:
        'Accès refusé : seul le compte GitHub administrateur autorisé peut se connecter (les inscriptions publiques sont désactivées).',
      retryable: false,
    };
  }

  // 5. Annulation explicite par l'utilisateur sur l'écran OAuth GitHub
  if (/user denied|access_denied.*denied|cancelled|canceled/.test(msg)) {
    return {
      kind: 'oauth_cancelled',
      message: 'Connexion GitHub annulée. Vous pouvez réessayer à tout moment.',
      retryable: false,
    };
  }

  // 6. Erreur réseau / serveur indisponible (offline, fetch error, 5xx, status 0)
  if (
    isOffline ||
    code.includes('authretryablefetcherror') ||
    (typeof status === 'number' && (status === 0 || status >= 500)) ||
    /failed to fetch|networkerror|network request failed|load failed|fetch failed|econnrefused|enotfound|bad gateway|service unavailable|temporarily_unavailable|internal server error|server_error|cors/.test(
      msg
    )
  ) {
    return {
      kind: 'network_or_server',
      message: 'Serveur indisponible ou réseau instable, réessayez dans un instant.',
      retryable: true,
    };
  }

  // 7. Identifiants incorrects (connexion de secours e-mail + mot de passe)
  if (
    code.includes('invalid_credentials') ||
    code.includes('invalid_grant') ||
    code.includes('email_not_confirmed') ||
    /invalid login credentials|invalid email or password|email not confirmed|invalid_credentials/.test(
      msg
    )
  ) {
    return {
      kind: 'invalid_credentials',
      message: 'Identifiants incorrects. Vérifiez votre adresse e-mail et votre mot de passe.',
      retryable: false,
    };
  }

  // 8. Autre erreur HTTP 4xx
  if (typeof status === 'number' && status >= 400 && status < 500) {
    return {
      kind: 'invalid_credentials',
      message: 'Échec de la connexion ou accès refusé par le serveur d’authentification.',
      retryable: false,
    };
  }

  return {
    kind: 'unknown',
    message: 'Une erreur inattendue est survenue lors de la connexion. Réessayez.',
    retryable: false,
  };
}

/**
 * Analyse les paramètres de retour OAuth (query ?error=... ou hash #error=...)
 * envoyés par Supabase/GitHub lors d'un refus ou échec de connexion.
 */
export function parseOAuthCallbackError(search: string, hash: string): ClassifiedAuthError | null {
  const queryParams = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const hashClean = hash.startsWith('#') ? hash.slice(1) : hash;
  const hashParams = new URLSearchParams(hashClean);

  const errorCode =
    queryParams.get('error_code') ||
    hashParams.get('error_code') ||
    queryParams.get('error') ||
    hashParams.get('error');

  const errorDescription =
    queryParams.get('error_description') || hashParams.get('error_description') || '';

  if (!errorCode && !errorDescription) return null;

  const combinedDesc = decodeURIComponent(errorDescription.replace(/\+/g, ' '));
  const normCode = (errorCode || '').toLowerCase();

  // Cas spécifique : GitHub/Supabase retourne access_denied avec "Signups not allowed"
  if (
    normCode === 'signup_disabled' ||
    /signups not allowed|signup_disabled/i.test(combinedDesc)
  ) {
    return {
      kind: 'unauthorized_account',
      message:
        'Accès refusé : seul le compte GitHub administrateur autorisé peut se connecter (les inscriptions publiques sont désactivées).',
      retryable: false,
    };
  }

  if (normCode === 'access_denied' && /denied|cancel/i.test(combinedDesc)) {
    return {
      kind: 'oauth_cancelled',
      message: 'Connexion GitHub annulée. Vous pouvez réessayer à tout moment.',
      retryable: false,
    };
  }

  if (normCode === 'access_denied') {
    return {
      kind: 'unauthorized_account',
      message:
        'Accès refusé par le fournisseur d’authentification. Seul le compte administrateur autorisé peut accéder à cet espace.',
      retryable: false,
    };
  }

  return classifyAuthError({
    code: errorCode || undefined,
    message: combinedDesc || errorCode || 'Échec de connexion GitHub',
  });
}

/**
 * Détecte un retour de callback OAuth PKCE (?code=...) ou implicite (#access_token=...)
 * afin d'afficher un état de chargement clair pendant l'échange de session.
 */
export function hasOAuthCallbackParams(search: string, hash: string): boolean {
  const queryParams = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  if (queryParams.has('code')) return true;
  return /access_token=|refresh_token=/.test(hash);
}

/**
 * Exécute une promesse avec un délai maximum strict (sans jamais bloquer indéfiniment l'UI).
 */
export async function withTimeout<T>(
  factory: () => Promise<T>,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<T> {
  let timerId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timerId = setTimeout(() => {
      const err = new Error('Request timeout exceeded');
      err.name = 'TimeoutError';
      reject(err);
    }, timeoutMs);
  });

  try {
    return await Promise.race([factory(), timeoutPromise]);
  } finally {
    if (timerId !== undefined) clearTimeout(timerId);
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface OAuthStartResult {
  url: string | null;
  error: ClassifiedAuthError | null;
}

/**
 * Initie la connexion OAuth GitHub (flux PKCE) avec timeout et classification stricte des erreurs.
 */
export async function signInWithGitHubAdmin(
  client: Pick<SupabaseClient, 'auth'>,
  redirectTo: string,
  options?: {
    timeoutMs?: number;
    isOnline?: boolean;
  }
): Promise<OAuthStartResult> {
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  try {
    const { data, error } = await withTimeout(
      () =>
        client.auth.signInWithOAuth({
          provider: 'github',
          options: {
            redirectTo,
            scopes: 'read:user user:email',
          },
        }),
      timeoutMs
    );

    if (error) {
      return {
        url: null,
        error: classifyAuthError(error, { isOnline: options?.isOnline }),
      };
    }

    return {
      url: data?.url ?? null,
      error: null,
    };
  } catch (caught) {
    return {
      url: null,
      error: classifyAuthError(caught, { isOnline: options?.isOnline }),
    };
  }
}

export interface SignInResult {
  session: Session | null;
  error: ClassifiedAuthError | null;
  metrics: AuthTimingMetrics;
}

/**
 * Connexion de secours par e-mail/mot de passe avec :
 * - Délai d'attente raisonnable (timeout)
 * - Nouvelles tentatives automatiques UNIQUEMENT en cas d'erreur réseau/serveur/timeout transitoire
 * - JAMAIS de retry sur mauvais identifiants ni sur 429 (préserve intégralement le rate-limiting)
 */
export async function signInAdminWithResilience(
  client: Pick<SupabaseClient, 'auth'>,
  email: string,
  password: string,
  options?: {
    timeoutMs?: number;
    maxNetworkRetries?: number;
    retryDelayMs?: number;
    onRetrying?: (attempt: number) => void;
    isOnline?: boolean;
  }
): Promise<SignInResult> {
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxNetworkRetries = options?.maxNetworkRetries ?? 1;
  const retryDelayMs = options?.retryDelayMs ?? NETWORK_RETRY_DELAY_MS;
  const startedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();

  let attempts = 0;

  while (attempts <= maxNetworkRetries) {
    attempts += 1;
    try {
      const { data, error } = await withTimeout(
        () =>
          client.auth.signInWithPassword({
            email: email.trim(),
            password,
          }),
        timeoutMs
      );

      if (!error && data.session) {
        const elapsed =
          (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startedAt;
        return {
          session: data.session,
          error: null,
          metrics: { signInMs: Math.round(elapsed), attempts },
        };
      }

      const classified = classifyAuthError(
        error ?? ({ message: 'Session absente après authentification' } as Partial<AuthError>),
        { isOnline: options?.isOnline }
      );

      if (classified.retryable && attempts <= maxNetworkRetries) {
        options?.onRetrying?.(attempts + 1);
        await wait(retryDelayMs);
        continue;
      }

      const elapsed =
        (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startedAt;
      return {
        session: null,
        error: classified,
        metrics: { signInMs: Math.round(elapsed), attempts },
      };
    } catch (caught) {
      const classified = classifyAuthError(caught, { isOnline: options?.isOnline });
      if (classified.retryable && attempts <= maxNetworkRetries) {
        options?.onRetrying?.(attempts + 1);
        await wait(retryDelayMs);
        continue;
      }

      const elapsed =
        (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startedAt;
      return {
        session: null,
        error: classified,
        metrics: { signInMs: Math.round(elapsed), attempts },
      };
    }
  }

  const elapsed =
    (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startedAt;
  return {
    session: null,
    error: {
      kind: 'network_or_server',
      message: 'Serveur indisponible ou réseau instable, réessayez dans un instant.',
      retryable: true,
    },
    metrics: { signInMs: Math.round(elapsed), attempts },
  };
}
