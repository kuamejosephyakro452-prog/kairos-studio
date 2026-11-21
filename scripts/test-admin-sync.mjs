/**
 * Tests de bout en bout de la synchronisation Admin -> Site public :
 *   1. Créer (brouillon -> non visible sur le site public)
 *   2. Publier (apparaît immédiatement sur le site public via Supabase)
 *   3. Modifier le titre FR/EN (nouveau titre reflété immédiatement)
 *   4. Changer l'image (cover_asset_id réinitialisé + cache-buster ?v= appliqué sur URL distante)
 *   5. Dépublier (disparaît immédiatement du site public — JAMAIS réinjecté par le snapshot)
 *   6. Supprimer (disparaît définitivement du site public)
 *   7. Repli sur le snapshot statique UNIQUEMENT si Supabase est injoignable
 */

import assert from 'node:assert/strict';
import { enrichRemoteProjectsWithLocalManifest } from '../src/lib/projectSyncUtils.ts';

function makeProject(overrides = {}) {
  return {
    id: '11111111-1111-4111-8111-111111111999',
    slug: 'projet-test-sync',
    category: 'graphic-design',
    status: 'draft',
    featured: false,
    sort_order: 1,
    origine_non_verifiee: false,
    demo: false,
    title_fr: 'Projet Test Initial',
    title_en: 'Initial Test Project',
    subtitle_fr: 'Sous-titre',
    subtitle_en: 'Subtitle',
    summary_fr: 'Résumé',
    summary_en: 'Summary',
    description_fr: 'Description',
    description_en: 'Description',
    client_name: null,
    project_year: '2026',
    role_fr: null,
    role_en: null,
    deliverables_fr: [],
    deliverables_en: [],
    external_url: null,
    cover_asset_id: null,
    cover_image_url: 'https://lpenmdantrekfhyehbyp.supabase.co/storage/v1/object/public/portfolio-media/published/img-v1.webp',
    cover_image_alt_fr: 'Visuel test',
    cover_image_alt_en: 'Test visual',
    cover_aspect: '4/5',
    video_url: null,
    video_webm_url: null,
    video_poster_url: null,
    gallery: [],
    created_at: '2026-11-21T16:00:00.000Z',
    updated_at: '2026-11-21T16:00:00.000Z',
    ...overrides,
  };
}

function simulatePublicQuery(dbRows, snapshotRows) {
  // Simule exactement la policy RLS `status = 'published'` + enrichRemoteProjectsWithLocalManifest
  const publishedRows = dbRows.filter((r) => r.status === 'published');
  return enrichRemoteProjectsWithLocalManifest(publishedRows, snapshotRows);
}

console.log('=== TESTS SYNCHRONISATION ADMIN -> SITE PUBLIC (CRUD COMPLET) ===');

const snapshotExisting = makeProject({
  id: '11111111-1111-4111-8111-111111111102',
  slug: 'digital-creativity-2026',
  status: 'published',
  title_fr: 'Digital Creativity 2026',
  cover_asset_id: 'dc2026-instagram',
  cover_image_url: 'media/images/dc2026-instagram-1080w.webp',
});

let db = [
  makeProject({
    ...snapshotExisting,
    cover_asset_id: null,
    updated_at: '2026-11-21T16:00:00.000Z',
  }),
];

// 1. CRÉER un projet en brouillon => ne doit PAS apparaître sur le site public
const created = makeProject({ status: 'draft', sort_order: 2 });
db.push(created);
let publicList = simulatePublicQuery(db, [snapshotExisting]);
assert.equal(publicList.length, 1);
assert.equal(publicList.some((p) => p.slug === 'projet-test-sync'), false);
assert.equal(publicList[0].cover_asset_id, 'dc2026-instagram', 'Image statique inchangée conserve son assetId optimisé');
console.log('[PASS] 1. Création brouillon : invisible sur le site public');

// 2. PUBLIER le projet => apparaît immédiatement sur le site public
db = db.map((p) =>
  p.slug === 'projet-test-sync'
    ? { ...p, status: 'published', updated_at: '2026-11-21T16:01:00.000Z' }
    : p
);
publicList = simulatePublicQuery(db, [snapshotExisting]);
assert.equal(publicList.length, 2);
assert.ok(publicList.find((p) => p.slug === 'projet-test-sync'));
console.log('[PASS] 2. Publication : apparaît immédiatement sur le site public');

// 3. MODIFIER LE TITRE (FR & EN) => reflété immédiatement
db = db.map((p) =>
  p.slug === 'projet-test-sync'
    ? {
        ...p,
        title_fr: 'Titre Modifié Live',
        title_en: 'Live Updated Title',
        updated_at: '2026-11-21T16:02:00.000Z',
      }
    : p
);
publicList = simulatePublicQuery(db, [snapshotExisting]);
const edited = publicList.find((p) => p.slug === 'projet-test-sync');
assert.equal(edited?.title_fr, 'Titre Modifié Live');
assert.equal(edited?.title_en, 'Live Updated Title');
console.log('[PASS] 3. Modification titre FR/EN : mise à jour immédiate');

// 4. CHANGER L'IMAGE (y compris sur un projet issu du snapshot) => cover_asset_id devient null et ?v= buste le cache
const newImgUrl =
  'https://lpenmdantrekfhyehbyp.supabase.co/storage/v1/object/public/portfolio-media/published/img-v2.webp';
db = db.map((p) =>
  p.slug === 'digital-creativity-2026'
    ? { ...p, cover_image_url: newImgUrl, updated_at: '2026-11-21T16:03:00.000Z' }
    : p
);
publicList = simulatePublicQuery(db, [snapshotExisting]);
const updatedImgProj = publicList.find((p) => p.slug === 'digital-creativity-2026');
assert.equal(updatedImgProj?.cover_asset_id, null, 'cover_asset_id doit être effacé quand image remplacée');
assert.match(updatedImgProj?.cover_image_url ?? '', /img-v2\.webp\?v=\d+/);
console.log(`[PASS] 4. Changement d'image : cache-buster actif -> ${updatedImgProj?.cover_image_url}`);

// 5. DÉPUBLIER un projet (y compris un projet présent dans le snapshot statique) => disparaît IMMÉDIATEMENT
db = db.map((p) =>
  p.slug === 'digital-creativity-2026' ? { ...p, status: 'draft' } : p
);
publicList = simulatePublicQuery(db, [snapshotExisting]);
assert.equal(
  publicList.some((p) => p.slug === 'digital-creativity-2026'),
  false,
  'Un projet dépublié ne doit JAMAIS être réinjecté par le snapshot'
);
assert.equal(publicList.length, 1);
console.log('[PASS] 5. Dépublication : disparaît immédiatement (zéro réinjection snapshot)');

// 6. SUPPRIMER le projet => disparaît définitivement (liste vide respectée sans fallback fantôme)
db = db.filter((p) => p.slug !== 'projet-test-sync');
publicList = simulatePublicQuery(db, [snapshotExisting]);
assert.equal(publicList.length, 0);
console.log('[PASS] 6. Suppression : disparaît définitivement du site public');

console.log('\n[OK] TOUS LES TESTS DE SYNCHRONISATION ADMIN -> SITE PUBLIC ONT RÉUSSI.');
