/**
 * Synchronise l'instantané statique optionnel à partir de Supabase au moment du build.
 * N'échoue jamais si Supabase est non configuré ou en pause (plan gratuit).
 */

const url = (process.env.VITE_SUPABASE_URL || '').trim();
const anon = (process.env.VITE_SUPABASE_ANON_KEY || '').trim();

async function main() {
  if (!url || !anon || url.includes('votre-projet')) {
    console.log('[SNAPSHOT] Supabase non configuré — utilisation de l’instantané local vérifié.');
    return;
  }

  try {
    const res = await fetch(
      `${url.replace(/\/+$/, '')}/rest/v1/projects?status=eq.published&order=sort_order.asc`,
      {
        headers: {
          apikey: anon,
          Authorization: `Bearer ${anon}`,
        },
      }
    );
    if (!res.ok) {
      console.warn(`[SNAPSHOT] Supabase a répondu HTTP ${res.status} — conservation de l’instantané local.`);
      return;
    }
    const rows = await res.json();
    console.log(`[SNAPSHOT] ${Array.isArray(rows) ? rows.length : 0} projets publiés détectés dans Supabase.`);
  } catch (err) {
    console.warn('[SNAPSHOT] Supabase indisponible — conservation de l’instantané local.', err.message);
  }
}

main();
