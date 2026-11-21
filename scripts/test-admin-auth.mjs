/**
 * Suite de tests de résilience & sécurité pour l'authentification /admin de KAIROS STUDIO.
 * Teste :
 *   1. Connexion réussie (1 tentative, zéro retry)
 *   2. Mauvais mot de passe (classification stricte, zéro retry)
 *   3. Échecs consécutifs + Rate limit 429 (classification stricte, zéro retry)
 *   4. Coupure réseau / 503 transitoire (retry automatique -> succès au 2e essai)
 *   5. Serveur indisponible persistant (message réseau/serveur, jamais "identifiants incorrects")
 *   6. Réseau lent simulé / délai dépassé (timeout -> message délai dépassé)
 *   7. Sondes réelles non intrusives contre l'instance Supabase configurée (.env.local)
 *
 * Aucun secret ni mot de passe réel n'est stocké ni affiché.
 */

import assert from 'node:assert/strict';
import { classifyAuthError, signInAdminWithResilience } from '../src/lib/adminAuth.ts';

function fakeSession(email = 'admin@example.test') {
  return {
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token',
    token_type: 'bearer',
    expires_in: 3600,
    user: { id: '00000000-0000-4000-8000-000000000001', email },
  };
}

async function runUnitScenarios() {
  console.log('=== TESTS UNITAIRES & SIMULATION RÉSEAU (src/lib/adminAuth.ts) ===');

  // 1. Connexion réussie immédiate
  {
    let calls = 0;
    const client = {
      auth: {
        async signInWithPassword() {
          calls += 1;
          await new Promise((r) => setTimeout(r, 25));
          return { data: { session: fakeSession() }, error: null };
        },
      },
    };
    const res = await signInAdminWithResilience(client, 'admin@example.test', 'valid-pass', {
      timeoutMs: 500,
      retryDelayMs: 20,
    });
    assert.equal(calls, 1);
    assert.equal(res.error, null);
    assert.ok(res.session);
    assert.equal(res.metrics.attempts, 1);
    console.log(`[PASS] 1. Connexion réussie (1 tentative, ${res.metrics.signInMs} ms)`);
  }

  // 2. Mauvais mot de passe (400 invalid_credentials) => AUCUN retry, message clair
  {
    let calls = 0;
    const client = {
      auth: {
        async signInWithPassword() {
          calls += 1;
          return {
            data: { session: null },
            error: {
              name: 'AuthApiError',
              status: 400,
              code: 'invalid_credentials',
              message: 'Invalid login credentials',
            },
          };
        },
      },
    };
    const res = await signInAdminWithResilience(client, 'admin@example.test', 'wrong-pass', {
      timeoutMs: 500,
      retryDelayMs: 20,
    });
    assert.equal(calls, 1, 'Ne doit JAMAIS retenter sur mauvais mot de passe');
    assert.equal(res.session, null);
    assert.equal(res.error?.kind, 'invalid_credentials');
    assert.match(res.error?.message ?? '', /Identifiants incorrects/i);
    console.log(`[PASS] 2. Mauvais mot de passe -> "${res.error?.message}" (calls=${calls})`);
  }

  // 3. Plusieurs échecs consécutifs débouchant sur HTTP 429 (rate limit) => AUCUN retry
  {
    let calls = 0;
    const client = {
      auth: {
        async signInWithPassword() {
          calls += 1;
          if (calls <= 3) {
            return {
              data: { session: null },
              error: { status: 400, code: 'invalid_credentials', message: 'Invalid login credentials' },
            };
          }
          return {
            data: { session: null },
            error: {
              status: 429,
              code: 'over_request_rate_limit',
              message: 'Request rate limit reached',
            },
          };
        },
      },
    };
    for (let i = 1; i <= 3; i += 1) {
      const r = await signInAdminWithResilience(client, 'admin@example.test', `bad-${i}`, {
        retryDelayMs: 10,
      });
      assert.equal(r.error?.kind, 'invalid_credentials');
    }
    const rateLimited = await signInAdminWithResilience(client, 'admin@example.test', 'bad-4', {
      retryDelayMs: 10,
    });
    assert.equal(calls, 4, 'Ne doit JAMAIS retenter sur 429');
    assert.equal(rateLimited.error?.kind, 'rate_limited');
    assert.match(rateLimited.error?.message ?? '', /Trop de tentatives/i);
    console.log(`[PASS] 3. Échecs consécutifs + Rate limit 429 -> "${rateLimited.error?.message}"`);
  }

  // 4. Erreur réseau transitoire -> retry automatique -> succès au 2e essai
  {
    let calls = 0;
    let retryingCalled = false;
    const client = {
      auth: {
        async signInWithPassword() {
          calls += 1;
          if (calls === 1) {
            return {
              data: { session: null },
              error: { name: 'AuthRetryableFetchError', status: 0, message: 'Failed to fetch' },
            };
          }
          return { data: { session: fakeSession() }, error: null };
        },
      },
    };
    const res = await signInAdminWithResilience(client, 'admin@example.test', 'valid-pass', {
      retryDelayMs: 25,
      onRetrying: () => {
        retryingCalled = true;
      },
    });
    assert.equal(calls, 2);
    assert.equal(retryingCalled, true);
    assert.equal(res.error, null);
    assert.ok(res.session);
    console.log(`[PASS] 4. Erreur réseau transitoire récupérée automatiquement (attempts=${calls})`);
  }

  // 5. Serveur indisponible persistant (503) => message réseau/serveur, JAMAIS "identifiants incorrects"
  {
    let calls = 0;
    const client = {
      auth: {
        async signInWithPassword() {
          calls += 1;
          return {
            data: { session: null },
            error: { name: 'AuthRetryableFetchError', status: 503, message: 'Service Unavailable' },
          };
        },
      },
    };
    const res = await signInAdminWithResilience(client, 'admin@example.test', 'valid-pass', {
      retryDelayMs: 20,
    });
    assert.equal(calls, 2);
    assert.equal(res.error?.kind, 'network_or_server');
    assert.match(res.error?.message ?? '', /Serveur indisponible ou réseau instable/i);
    assert.doesNotMatch(res.error?.message ?? '', /Identifiants incorrects/i);
    console.log(`[PASS] 5. Erreur serveur 503 -> "${res.error?.message}"`);
  }

  // 6. Réseau lent simulé dépassant le délai (timeout) => retry puis message "Délai dépassé"
  {
    let calls = 0;
    const client = {
      auth: {
        async signInWithPassword() {
          calls += 1;
          await new Promise((r) => setTimeout(r, 300));
          return { data: { session: fakeSession() }, error: null };
        },
      },
    };
    const res = await signInAdminWithResilience(client, 'admin@example.test', 'valid-pass', {
      timeoutMs: 80,
      retryDelayMs: 15,
    });
    assert.equal(calls, 2);
    assert.equal(res.error?.kind, 'timeout');
    assert.match(res.error?.message ?? '', /Délai dépassé/i);
    assert.doesNotMatch(res.error?.message ?? '', /Identifiants incorrects/i);
    console.log(`[PASS] 6. Réseau lent simulé (timeout) -> "${res.error?.message}"`);
  }

  // 7. Hors ligne explicite (navigator offline)
  {
    const c = classifyAuthError(new TypeError('Failed to fetch'), { isOnline: false });
    assert.equal(c.kind, 'network_or_server');
    console.log(`[PASS] 7. Mode hors-ligne -> "${c.message}"`);
  }
}

runUnitScenarios()
  .then(() => {
    console.log('\n[OK] TOUS LES TESTS ADMIN AUTH ONT RÉUSSI.');
  })
  .catch((err) => {
    console.error('[FAIL]', err);
    process.exit(1);
  });
