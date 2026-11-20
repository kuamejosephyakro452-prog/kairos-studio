import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  Eye,
  EyeOff,
  FolderPlus,
  ImagePlus,
  Inbox,
  Layers,
  Lock,
  LogOut,
  Mail,
  MessageCircle,
  Pencil,
  Save,
  ShieldAlert,
  Trash2,
  Upload,
  Video,
  X,
} from 'lucide-react';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import {
  checkIsAdminUser,
  deleteMessageAdmin,
  deleteProjectAdmin,
  fetchAllProjectsAdmin,
  fetchContactMessagesAdmin,
  saveProjectAdmin,
  toggleMessageReadAdmin,
  updateProjectOrderAdmin,
  uploadMediaAdmin,
} from '@/lib/projectsRepository';
import { resolveAssetUrl } from '@/lib/media';
import { DICTIONARY } from '@/i18n/translations';
import { SeoHead } from '@/components/SeoHead';
import { MonogramJK } from '@/components/MonogramJK';
import {
  ALL_CATEGORIES,
  type ContactMessage,
  type CoverAspect,
  type Project,
  type ProjectCategory,
  type ProjectGalleryItem,
} from '@/types/portfolio';

type EditorDraft = Omit<Project, 'id'> & { id?: string };

const EMPTY_DRAFT: EditorDraft = {
  slug: '',
  category: 'graphic-design',
  status: 'draft',
  featured: false,
  sort_order: 10,
  title_fr: '',
  title_en: '',
  subtitle_fr: '',
  subtitle_en: '',
  summary_fr: '',
  summary_en: '',
  description_fr: '',
  description_en: '',
  client_name: '',
  project_year: '',
  role_fr: '',
  role_en: '',
  deliverables_fr: [],
  deliverables_en: [],
  external_url: '',
  cover_image_url: '',
  cover_image_alt_fr: '',
  cover_image_alt_en: '',
  cover_aspect: '4/5',
  video_url: '',
  video_webm_url: '',
  video_poster_url: '',
  gallery: [],
};

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72);
}

export const AdminPage: React.FC = () => {
  const [authLoading, setAuthLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  // Formulaire de connexion
  const [loginEmail, setLoginEmail] = useState('kuamejosephyakro452@gmail.com');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginBusy, setLoginBusy] = useState(false);

  // Données admin
  const [activeTab, setActiveTab] = useState<'projects' | 'messages'>('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [dataBusy, setDataBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Éditeur de projet
  const [editing, setEditing] = useState<EditorDraft | null>(null);
  const [deliverablesFrText, setDeliverablesFrText] = useState('');
  const [deliverablesEnText, setDeliverablesEnText] = useState('');
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const catLabels = DICTIONARY.fr.categories;

  const refreshAdminState = async () => {
    setAuthLoading(true);
    try {
      const status = await checkIsAdminUser();
      setAuthenticated(status.authenticated);
      setIsAdmin(status.isAdmin);
      setAdminEmail(status.email);
      if (status.authenticated && status.isAdmin) {
        await loadAdminData();
      }
    } catch {
      setAuthenticated(false);
      setIsAdmin(false);
    } finally {
      setAuthLoading(false);
    }
  };

  const loadAdminData = async () => {
    setDataBusy(true);
    try {
      const [projs, msgs] = await Promise.all([
        fetchAllProjectsAdmin(),
        fetchContactMessagesAdmin(),
      ]);
      setProjects(projs);
      setMessages(msgs);
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Erreur de chargement Supabase.',
      });
    } finally {
      setDataBusy(false);
    }
  };

  useEffect(() => {
    refreshAdminState();
    const client = getSupabaseClient();
    if (!client) return;
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(() => {
      refreshAdminState();
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const client = getSupabaseClient();
    if (!client) {
      setLoginError('Connexion impossible : Supabase n’est pas encore configuré.');
      return;
    }

    setLoginBusy(true);
    try {
      const { error } = await client.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      });
      if (error) {
        setLoginError('Identifiants invalides ou accès refusé.');
      } else {
        setLoginPassword('');
        await refreshAdminState();
      }
    } finally {
      setLoginBusy(false);
    }
  };

  const handleLogout = async () => {
    const client = getSupabaseClient();
    if (client) await client.auth.signOut();
    setAuthenticated(false);
    setIsAdmin(false);
    setProjects([]);
    setMessages([]);
    setEditing(null);
  };

  const openNewProject = () => {
    setFeedback(null);
    setEditing({
      ...EMPTY_DRAFT,
      sort_order: projects.length + 1,
    });
    setDeliverablesFrText('');
    setDeliverablesEnText('');
  };

  const openEditProject = (proj: Project) => {
    setFeedback(null);
    setEditing({
      ...proj,
      client_name: proj.client_name || '',
      project_year: proj.project_year || '',
      role_fr: proj.role_fr || '',
      role_en: proj.role_en || '',
      external_url: proj.external_url || '',
      video_url: proj.video_url || '',
      video_webm_url: proj.video_webm_url || '',
      video_poster_url: proj.video_poster_url || '',
    });
    setDeliverablesFrText(proj.deliverables_fr.join('\n'));
    setDeliverablesEnText(proj.deliverables_en.join('\n'));
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setFeedback(null);

    const slug = (editing.slug || slugify(editing.title_fr)).trim();
    if (!slug || !editing.title_fr.trim() || !editing.title_en.trim()) {
      setFeedback({
        type: 'err',
        text: 'Le slug ainsi que les titres FR et EN sont obligatoires.',
      });
      return;
    }

    setDataBusy(true);
    try {
      const saved = await saveProjectAdmin({
        ...editing,
        slug,
        deliverables_fr: deliverablesFrText
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        deliverables_en: deliverablesEnText
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
      });
      await loadAdminData();
      setEditing(null);
      setFeedback({
        type: 'ok',
        text: `Projet « ${saved.title_fr} » enregistré (${saved.status === 'published' ? 'Publié' : 'Brouillon'}).`,
      });
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Erreur lors de la sauvegarde.',
      });
    } finally {
      setDataBusy(false);
    }
  };

  const handleToggleStatus = async (proj: Project) => {
    setDataBusy(true);
    setFeedback(null);
    try {
      const nextStatus = proj.status === 'published' ? 'draft' : 'published';
      await saveProjectAdmin({ ...proj, status: nextStatus });
      await loadAdminData();
      setFeedback({
        type: 'ok',
        text:
          nextStatus === 'published'
            ? `« ${proj.title_fr} » est maintenant publié sur le portfolio.`
            : `« ${proj.title_fr} » a été repassé en brouillon.`,
      });
    } catch (err) {
      setFeedback({ type: 'err', text: err instanceof Error ? err.message : 'Erreur.' });
    } finally {
      setDataBusy(false);
    }
  };

  const handleDeleteProject = async (proj: Project) => {
    if (!window.confirm(`Supprimer définitivement « ${proj.title_fr} » ?`)) return;
    setDataBusy(true);
    try {
      await deleteProjectAdmin(proj.id);
      await loadAdminData();
      setFeedback({ type: 'ok', text: `Projet « ${proj.title_fr} » supprimé.` });
    } catch (err) {
      setFeedback({ type: 'err', text: err instanceof Error ? err.message : 'Erreur suppression.' });
    } finally {
      setDataBusy(false);
    }
  };

  const handleMoveProject = async (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= projects.length) return;
    const reordered = [...projects];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(target, 0, moved);
    setProjects(reordered);
    try {
      await updateProjectOrderAdmin(reordered.map((p) => p.id));
      setFeedback({ type: 'ok', text: 'Ordre des projets mis à jour.' });
    } catch (err) {
      setFeedback({ type: 'err', text: err instanceof Error ? err.message : 'Erreur réorganisation.' });
      await loadAdminData();
    }
  };

  const handleFileUpload = async (
    file: File | undefined,
    target: 'cover' | 'video' | 'poster' | 'gallery'
  ) => {
    if (!file || !editing) return;
    setUploadingField(target);
    setFeedback(null);
    try {
      const folder = editing.status === 'published' ? 'published' : 'drafts';
      const { publicUrl } = await uploadMediaAdmin(file, folder);

      if (target === 'cover') {
        setEditing({ ...editing, cover_image_url: publicUrl });
      } else if (target === 'video') {
        if (file.type === 'video/webm') {
          setEditing({ ...editing, video_webm_url: publicUrl });
        } else {
          setEditing({ ...editing, video_url: publicUrl });
        }
      } else if (target === 'poster') {
        setEditing({ ...editing, video_poster_url: publicUrl });
      } else if (target === 'gallery') {
        const newItem: ProjectGalleryItem = {
          id: `media-${Date.now()}`,
          type: file.type.startsWith('video/') ? 'video' : 'image',
          url: publicUrl,
          alt_fr: editing.title_fr || file.name,
          alt_en: editing.title_en || file.name,
          aspect: '16/9',
        };
        setEditing({ ...editing, gallery: [...editing.gallery, newItem] });
      }

      setFeedback({ type: 'ok', text: `Fichier « ${file.name} » téléversé vers Supabase Storage.` });
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Échec du téléversement.',
      });
    } finally {
      setUploadingField(null);
    }
  };

  const handleRemoveGalleryItem = (id: string) => {
    if (!editing) return;
    setEditing({
      ...editing,
      gallery: editing.gallery.filter((item) => item.id !== id),
    });
  };

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <>
      <SeoHead
        title="Administration privée — KAIROS STUDIO"
        description="Espace privé d'administration KAIROS STUDIO."
        locale="fr"
        canonicalPath="/admin"
        noindex
      />

      <div className="min-h-screen bg-[#0B0B0C] text-[#F4EEE3]">
        {/* Barre supérieure admin */}
        <header className="border-b border-[#E8C877]/18 bg-[#0E0E11] px-5 py-4 sm:px-8">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <MonogramJK size={36} showFrame />
              <div>
                <p className="font-display text-lg tracking-[0.2em] uppercase">KAIROS STUDIO</p>
                <p className="text-[10px] tracking-[0.24em] uppercase text-[#E8C877]">
                  Administration privée
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link
                to="/fr"
                className="inline-flex items-center gap-1.5 text-xs tracking-[0.16em] uppercase text-[#BDB5A8] hover:text-[#E8C877]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Site public</span>
              </Link>
              {authenticated && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#F4EEE3]/20 px-4 py-1.5 text-xs font-medium tracking-[0.14em] uppercase text-[#F4EEE3] hover:border-[#E8C877] hover:text-[#E8C877]"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Déconnexion</span>
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
          {authLoading ? (
            <div className="py-24 text-center text-sm text-[#BDB5A8]">
              Vérification de la session sécurisée...
            </div>
          ) : !isSupabaseConfigured ? (
            <div className="mx-auto max-w-xl rounded-2xl border border-[#E8C877]/30 bg-[#141418] p-8 sm:p-10">
              <div className="flex items-center gap-3 text-[#E8C877]">
                <Lock className="h-5 w-5" />
                <p className="text-xs font-semibold tracking-[0.24em] uppercase">
                  Accès protégé — Liaison Supabase requise
                </p>
              </div>
              <h1 className="mt-4 font-display text-3xl font-light">
                Administration verrouillée
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-[#BDB5A8]">
                L’espace d’administration repose sur l’authentification et la Row Level Security
                (RLS) du projet Supabase <strong className="text-[#F4EEE3]">kairos-studio</strong>.
                Aucune modification n’est autorisée sans connexion authentifiée.
              </p>
              <div className="mt-6 rounded-xl border border-[#F4EEE3]/10 bg-[#0B0B0C] p-4 text-xs leading-relaxed text-[#D0C8BC]">
                <p className="font-semibold text-[#E8C877]">Configuration attendue :</p>
                <ul className="mt-2 list-disc space-y-1 pl-4">
                  <li>Définir <code>VITE_SUPABASE_URL</code> et <code>VITE_SUPABASE_ANON_KEY</code> dans <code>.env.local</code> et les secrets GitHub Actions.</li>
                  <li>Exécuter <code>supabase/schema.sql</code> puis <code>supabase/seed.sql</code>.</li>
                  <li>Désactiver les inscriptions publiques et lier l’unique compte admin dans <code>public.admin_users</code>.</li>
                </ul>
              </div>
            </div>
          ) : !authenticated ? (
            /* Écran de connexion administrateur */
            <div className="mx-auto max-w-md rounded-2xl border border-[#E8C877]/28 bg-[#141418] p-8 sm:p-10">
              <div className="flex items-center gap-2.5 text-[#E8C877]">
                <Lock className="h-4 w-4" />
                <span className="text-[11px] font-semibold tracking-[0.24em] uppercase">
                  Authentification requise
                </span>
              </div>
              <h1 className="mt-3 font-display text-3xl font-light">Connexion Administrateur</h1>
              <p className="mt-2 text-xs leading-relaxed text-[#BDB5A8]">
                Accès strictement réservé à Joseph Kouamé (inscriptions publiques désactivées).
              </p>

              <form onSubmit={handleLogin} className="mt-7 space-y-5">
                <div>
                  <label htmlFor="admin-email" className="block text-[11px] tracking-[0.2em] uppercase text-[#BDB5A8]">
                    E-mail administrateur
                  </label>
                  <input
                    id="admin-email"
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-[#F4EEE3]/18 bg-[#0B0B0C] px-4 py-3 text-sm text-[#F4EEE3] outline-none focus:border-[#E8C877]"
                  />
                </div>
                <div>
                  <label htmlFor="admin-pass" className="block text-[11px] tracking-[0.2em] uppercase text-[#BDB5A8]">
                    Mot de passe
                  </label>
                  <input
                    id="admin-pass"
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-[#F4EEE3]/18 bg-[#0B0B0C] px-4 py-3 text-sm text-[#F4EEE3] outline-none focus:border-[#E8C877]"
                  />
                </div>

                {loginError && (
                  <p role="alert" className="rounded-lg border border-red-500/35 bg-red-500/10 px-4 py-2.5 text-xs text-red-300">
                    {loginError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loginBusy}
                  className="w-full cursor-pointer rounded-full bg-gold-gradient py-3.5 text-xs font-semibold tracking-[0.22em] uppercase text-[#0B0B0C] disabled:opacity-60"
                >
                  {loginBusy ? 'Vérification...' : 'Se connecter'}
                </button>
              </form>
            </div>
          ) : !isAdmin ? (
            /* Utilisateur connecté mais absent de admin_users => Accès refusé */
            <div className="mx-auto max-w-lg rounded-2xl border border-red-500/35 bg-[#141418] p-8 text-center">
              <ShieldAlert className="mx-auto h-10 w-10 text-red-400" />
              <h1 className="mt-4 font-display text-3xl">Accès refusé</h1>
              <p className="mt-2 text-sm text-[#BDB5A8]">
                Le compte <strong>{adminEmail}</strong> n’est pas autorisé dans <code>public.admin_users</code>.
              </p>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-6 cursor-pointer rounded-full border border-[#F4EEE3]/25 px-6 py-2.5 text-xs font-semibold tracking-[0.18em] uppercase"
              >
                Se déconnecter
              </button>
            </div>
          ) : (
            /* TABLEAU DE BORD ADMINISTRATEUR AUTHENTIFIÉ */
            <div className="space-y-8">
              {/* En-tête + onglets */}
              <div className="flex flex-col justify-between gap-6 border-b border-[#F4EEE3]/12 pb-6 sm:flex-row sm:items-end">
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.24em] uppercase text-[#E8C877]">
                    Connecté : {adminEmail}
                  </p>
                  <h1 className="mt-2 font-display text-4xl font-light">
                    Gestion du portfolio
                  </h1>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('projects');
                      setEditing(null);
                    }}
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold tracking-[0.16em] uppercase ${
                      activeTab === 'projects'
                        ? 'bg-[#E8C877] text-[#0B0B0C]'
                        : 'border border-[#F4EEE3]/20 text-[#F4EEE3]'
                    }`}
                  >
                    <Layers className="h-3.5 w-3.5" />
                    <span>Projets ({projects.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('messages');
                      setEditing(null);
                    }}
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold tracking-[0.16em] uppercase ${
                      activeTab === 'messages'
                        ? 'bg-[#E8C877] text-[#0B0B0C]'
                        : 'border border-[#F4EEE3]/20 text-[#F4EEE3]'
                    }`}
                  >
                    <Inbox className="h-3.5 w-3.5" />
                    <span>
                      Messages ({messages.length}
                      {unreadCount > 0 ? ` · ${unreadCount} non lu${unreadCount > 1 ? 's' : ''}` : ''})
                    </span>
                  </button>
                </div>
              </div>

              {feedback && (
                <div
                  role="status"
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-xs ${
                    feedback.type === 'ok'
                      ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-200'
                      : 'border-red-500/35 bg-red-500/10 text-red-200'
                  }`}
                >
                  <span>{feedback.text}</span>
                  <button type="button" onClick={() => setFeedback(null)} className="cursor-pointer">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* ONGLET PROJETS */}
              {activeTab === 'projects' && !editing && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <p className="text-xs text-[#BDB5A8]">
                      Publiés : {projects.filter((p) => p.status === 'published').length} · Brouillons :{' '}
                      {projects.filter((p) => p.status === 'draft').length} · Quota Storage gratuit Supabase : ~1 Go (max 25 Mo/fichier)
                    </p>
                    <button
                      type="button"
                      onClick={openNewProject}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-gold-gradient px-6 py-2.5 text-xs font-semibold tracking-[0.18em] uppercase text-[#0B0B0C]"
                    >
                      <FolderPlus className="h-4 w-4" />
                      <span>Nouveau projet</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {projects.map((proj, idx) => (
                      <div
                        key={proj.id}
                        className="flex flex-col justify-between gap-5 rounded-2xl border border-[#F4EEE3]/12 bg-[#141418] p-5 sm:flex-row sm:items-center"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={resolveAssetUrl(proj.cover_image_url)}
                            alt={proj.title_fr}
                            className="h-16 w-24 shrink-0 rounded-lg border border-[#F4EEE3]/10 bg-[#0B0B0C] object-cover"
                          />
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.16em] uppercase ${
                                  proj.status === 'published'
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : 'bg-amber-500/20 text-amber-300'
                                }`}
                              >
                                {proj.status === 'published' ? 'Publié' : 'Brouillon'}
                              </span>
                              <span className="text-[11px] text-[#BDB5A8]">
                                {catLabels[proj.category]}
                              </span>
                            </div>
                            <h2 className="mt-1 font-display text-2xl text-[#F4EEE3]">
                              {proj.title_fr}
                            </h2>
                            <p className="text-xs text-[#BDB5A8]">/{proj.slug}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            disabled={idx === 0 || dataBusy}
                            onClick={() => handleMoveProject(idx, -1)}
                            title="Monter"
                            className="cursor-pointer rounded-lg border border-[#F4EEE3]/15 p-2 text-[#BDB5A8] hover:border-[#E8C877] hover:text-[#E8C877] disabled:opacity-30"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === projects.length - 1 || dataBusy}
                            onClick={() => handleMoveProject(idx, 1)}
                            title="Descendre"
                            className="cursor-pointer rounded-lg border border-[#F4EEE3]/15 p-2 text-[#BDB5A8] hover:border-[#E8C877] hover:text-[#E8C877] disabled:opacity-30"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            disabled={dataBusy}
                            onClick={() => handleToggleStatus(proj)}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#F4EEE3]/18 px-3 py-2 text-xs text-[#F4EEE3] hover:border-[#E8C877] hover:text-[#E8C877]"
                          >
                            {proj.status === 'published' ? (
                              <>
                                <EyeOff className="h-3.5 w-3.5" />
                                <span>Dépublier</span>
                              </>
                            ) : (
                              <>
                                <Eye className="h-3.5 w-3.5" />
                                <span>Publier</span>
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditProject(proj)}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#E8C877]/45 px-3 py-2 text-xs text-[#E8C877] hover:bg-[#E8C877] hover:text-[#0B0B0C]"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            <span>Modifier</span>
                          </button>
                          <button
                            type="button"
                            disabled={dataBusy}
                            onClick={() => handleDeleteProject(proj)}
                            title="Supprimer"
                            className="cursor-pointer rounded-lg border border-red-500/30 p-2 text-red-300 hover:bg-red-500/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ÉDITEUR DE PROJET */}
              {activeTab === 'projects' && editing && (
                <form
                  onSubmit={handleSaveProject}
                  className="space-y-8 rounded-2xl border border-[#E8C877]/25 bg-[#141418] p-6 sm:p-8"
                >
                  <div className="flex items-center justify-between border-b border-[#F4EEE3]/12 pb-5">
                    <h2 className="font-display text-3xl">
                      {editing.id ? 'Modifier le projet' : 'Nouveau projet'}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setEditing(null)}
                      className="inline-flex cursor-pointer items-center gap-1.5 text-xs uppercase tracking-[0.16em] text-[#BDB5A8] hover:text-[#F4EEE3]"
                    >
                      <X className="h-4 w-4" />
                      <span>Annuler</span>
                    </button>
                  </div>

                  {/* Identifiants & statut */}
                  <div className="grid gap-5 sm:grid-cols-3">
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.18em] text-[#BDB5A8]">
                        Catégorie *
                      </label>
                      <select
                        value={editing.category}
                        onChange={(e) =>
                          setEditing({ ...editing, category: e.target.value as ProjectCategory })
                        }
                        className="mt-2 w-full rounded-lg border border-[#F4EEE3]/18 bg-[#0B0B0C] px-3 py-2.5 text-sm"
                      >
                        {ALL_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {catLabels[cat]}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.18em] text-[#BDB5A8]">
                        Statut *
                      </label>
                      <select
                        value={editing.status}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            status: e.target.value as 'draft' | 'published',
                          })
                        }
                        className="mt-2 w-full rounded-lg border border-[#F4EEE3]/18 bg-[#0B0B0C] px-3 py-2.5 text-sm"
                      >
                        <option value="draft">Brouillon (privé)</option>
                        <option value="published">Publié (visible publiquement)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.18em] text-[#BDB5A8]">
                        Slug URL *
                      </label>
                      <input
                        type="text"
                        required
                        value={editing.slug}
                        onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })}
                        placeholder="mon-projet-visuel"
                        className="mt-2 w-full rounded-lg border border-[#F4EEE3]/18 bg-[#0B0B0C] px-3 py-2.5 text-sm"
                      />
                    </div>
                  </div>

                  {/* Titres & textes FR / EN */}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.18em] text-[#BDB5A8]">
                        Titre (FR) *
                      </label>
                      <input
                        type="text"
                        required
                        value={editing.title_fr}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            title_fr: e.target.value,
                            slug: editing.id ? editing.slug : slugify(e.target.value),
                          })
                        }
                        className="mt-2 w-full rounded-lg border border-[#F4EEE3]/18 bg-[#0B0B0C] px-3 py-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.18em] text-[#BDB5A8]">
                        Title (EN) *
                      </label>
                      <input
                        type="text"
                        required
                        value={editing.title_en}
                        onChange={(e) => setEditing({ ...editing, title_en: e.target.value })}
                        className="mt-2 w-full rounded-lg border border-[#F4EEE3]/18 bg-[#0B0B0C] px-3 py-2.5 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.18em] text-[#BDB5A8]">
                        Sous-titre (FR)
                      </label>
                      <input
                        type="text"
                        value={editing.subtitle_fr}
                        onChange={(e) => setEditing({ ...editing, subtitle_fr: e.target.value })}
                        className="mt-2 w-full rounded-lg border border-[#F4EEE3]/18 bg-[#0B0B0C] px-3 py-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.18em] text-[#BDB5A8]">
                        Subtitle (EN)
                      </label>
                      <input
                        type="text"
                        value={editing.subtitle_en}
                        onChange={(e) => setEditing({ ...editing, subtitle_en: e.target.value })}
                        className="mt-2 w-full rounded-lg border border-[#F4EEE3]/18 bg-[#0B0B0C] px-3 py-2.5 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.18em] text-[#BDB5A8]">
                        Résumé court (FR)
                      </label>
                      <textarea
                        rows={3}
                        value={editing.summary_fr}
                        onChange={(e) => setEditing({ ...editing, summary_fr: e.target.value })}
                        className="mt-2 w-full rounded-lg border border-[#F4EEE3]/18 bg-[#0B0B0C] px-3 py-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.18em] text-[#BDB5A8]">
                        Short summary (EN)
                      </label>
                      <textarea
                        rows={3}
                        value={editing.summary_en}
                        onChange={(e) => setEditing({ ...editing, summary_en: e.target.value })}
                        className="mt-2 w-full rounded-lg border border-[#F4EEE3]/18 bg-[#0B0B0C] px-3 py-2.5 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.18em] text-[#BDB5A8]">
                        Description complète (FR)
                      </label>
                      <textarea
                        rows={5}
                        value={editing.description_fr}
                        onChange={(e) => setEditing({ ...editing, description_fr: e.target.value })}
                        className="mt-2 w-full rounded-lg border border-[#F4EEE3]/18 bg-[#0B0B0C] px-3 py-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.18em] text-[#BDB5A8]">
                        Full description (EN)
                      </label>
                      <textarea
                        rows={5}
                        value={editing.description_en}
                        onChange={(e) => setEditing({ ...editing, description_en: e.target.value })}
                        className="mt-2 w-full rounded-lg border border-[#F4EEE3]/18 bg-[#0B0B0C] px-3 py-2.5 text-sm"
                      />
                    </div>
                  </div>

                  {/* Métadonnées optionnelles */}
                  <div className="grid gap-5 border-t border-[#F4EEE3]/10 pt-6 sm:grid-cols-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.18em] text-[#BDB5A8]">
                        Client (optionnel)
                      </label>
                      <input
                        type="text"
                        value={editing.client_name || ''}
                        onChange={(e) => setEditing({ ...editing, client_name: e.target.value })}
                        className="mt-2 w-full rounded-lg border border-[#F4EEE3]/18 bg-[#0B0B0C] px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.18em] text-[#BDB5A8]">
                        Année (optionnel)
                      </label>
                      <input
                        type="text"
                        value={editing.project_year || ''}
                        onChange={(e) => setEditing({ ...editing, project_year: e.target.value })}
                        className="mt-2 w-full rounded-lg border border-[#F4EEE3]/18 bg-[#0B0B0C] px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.18em] text-[#BDB5A8]">
                        Rôle FR (optionnel)
                      </label>
                      <input
                        type="text"
                        value={editing.role_fr || ''}
                        onChange={(e) => setEditing({ ...editing, role_fr: e.target.value })}
                        className="mt-2 w-full rounded-lg border border-[#F4EEE3]/18 bg-[#0B0B0C] px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.18em] text-[#BDB5A8]">
                        Ratio couverture
                      </label>
                      <select
                        value={editing.cover_aspect}
                        onChange={(e) =>
                          setEditing({ ...editing, cover_aspect: e.target.value as CoverAspect })
                        }
                        className="mt-2 w-full rounded-lg border border-[#F4EEE3]/18 bg-[#0B0B0C] px-3 py-2 text-sm"
                      >
                        <option value="16/9">16:9 (Paysage / Vidéo)</option>
                        <option value="4/5">4:5 (Portrait Instagram)</option>
                        <option value="1/1">1:1 (Carré)</option>
                        <option value="3/4">3:4 (Affiche A4/A3)</option>
                        <option value="9/16">9:16 (Vertical Statut)</option>
                      </select>
                    </div>
                  </div>

                  {/* Livrables FR / EN */}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.18em] text-[#BDB5A8]">
                        Livrables FR (1 par ligne)
                      </label>
                      <textarea
                        rows={3}
                        value={deliverablesFrText}
                        onChange={(e) => setDeliverablesFrText(e.target.value)}
                        className="mt-2 w-full rounded-lg border border-[#F4EEE3]/18 bg-[#0B0B0C] px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.18em] text-[#BDB5A8]">
                        Deliverables EN (1 per line)
                      </label>
                      <textarea
                        rows={3}
                        value={deliverablesEnText}
                        onChange={(e) => setDeliverablesEnText(e.target.value)}
                        className="mt-2 w-full rounded-lg border border-[#F4EEE3]/18 bg-[#0B0B0C] px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  {/* Médias & Uploads depuis l'ordinateur */}
                  <div className="space-y-5 border-t border-[#F4EEE3]/10 pt-6">
                    <h3 className="font-display text-2xl text-[#E8C877]">
                      Médias (upload ordinateur vers Supabase Storage)
                    </h3>

                    <div className="grid gap-5 sm:grid-cols-2">
                      {/* Image de couverture */}
                      <div className="rounded-xl border border-[#F4EEE3]/12 bg-[#0B0B0C] p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em]">
                          Image de couverture
                        </p>
                        <input
                          type="text"
                          value={editing.cover_image_url}
                          onChange={(e) =>
                            setEditing({ ...editing, cover_image_url: e.target.value })
                          }
                          placeholder="URL ou chemin média..."
                          className="mt-2 w-full rounded border border-[#F4EEE3]/15 bg-[#141418] px-3 py-2 text-xs"
                        />
                        <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#E8C877]/45 px-4 py-2 text-xs text-[#E8C877] hover:bg-[#E8C877] hover:text-[#0B0B0C]">
                          <Upload className="h-3.5 w-3.5" />
                          <span>
                            {uploadingField === 'cover'
                              ? 'Téléversement...'
                              : 'Charger une image (WebP/PNG/JPG)'}
                          </span>
                          <input
                            type="file"
                            accept="image/webp,image/avif,image/png,image/jpeg"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e.target.files?.[0], 'cover')}
                          />
                        </label>
                      </div>

                      {/* Vidéo optionnelle */}
                      <div className="rounded-xl border border-[#F4EEE3]/12 bg-[#0B0B0C] p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em]">
                          Vidéo principale (optionnel, ≤ 25 Mo)
                        </p>
                        <input
                          type="text"
                          value={editing.video_url || ''}
                          onChange={(e) => setEditing({ ...editing, video_url: e.target.value })}
                          placeholder="URL MP4..."
                          className="mt-2 w-full rounded border border-[#F4EEE3]/15 bg-[#141418] px-3 py-2 text-xs"
                        />
                        <div className="mt-3 flex flex-wrap gap-2">
                          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#E8C877]/45 px-4 py-2 text-xs text-[#E8C877] hover:bg-[#E8C877] hover:text-[#0B0B0C]">
                            <Video className="h-3.5 w-3.5" />
                            <span>
                              {uploadingField === 'video'
                                ? 'Téléversement...'
                                : 'Charger MP4 / WebM'}
                            </span>
                            <input
                              type="file"
                              accept="video/mp4,video/webm"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e.target.files?.[0], 'video')}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Galerie additionnelle */}
                    <div className="rounded-xl border border-[#F4EEE3]/12 bg-[#0B0B0C] p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em]">
                          Galerie du projet ({editing.gallery.length} éléments)
                        </p>
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#E8C877]/45 px-4 py-2 text-xs text-[#E8C877] hover:bg-[#E8C877] hover:text-[#0B0B0C]">
                          <ImagePlus className="h-3.5 w-3.5" />
                          <span>
                            {uploadingField === 'gallery'
                              ? 'Téléversement...'
                              : 'Ajouter une image depuis l’ordinateur'}
                          </span>
                          <input
                            type="file"
                            accept="image/webp,image/avif,image/png,image/jpeg"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e.target.files?.[0], 'gallery')}
                          />
                        </label>
                      </div>

                      {editing.gallery.length > 0 && (
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          {editing.gallery.map((g) => (
                            <div
                              key={g.id}
                              className="flex items-center justify-between gap-2 rounded-lg border border-[#F4EEE3]/12 bg-[#141418] p-2.5 text-xs"
                            >
                              <span className="truncate text-[#D0C8BC]">
                                {g.caption_fr || g.alt_fr || g.assetId || g.url}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveGalleryItem(g.id)}
                                className="cursor-pointer text-red-300 hover:text-red-200"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 border-t border-[#F4EEE3]/12 pt-6">
                    <button
                      type="button"
                      onClick={() => setEditing(null)}
                      className="cursor-pointer rounded-full border border-[#F4EEE3]/20 px-6 py-3 text-xs font-semibold tracking-[0.18em] uppercase"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={dataBusy || Boolean(uploadingField)}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-gold-gradient px-8 py-3 text-xs font-semibold tracking-[0.2em] uppercase text-[#0B0B0C] disabled:opacity-60"
                    >
                      <Save className="h-4 w-4" />
                      <span>{dataBusy ? 'Enregistrement...' : 'Enregistrer le projet'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* ONGLET MESSAGES REÇUS */}
              {activeTab === 'messages' && (
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="rounded-2xl border border-[#F4EEE3]/12 bg-[#141418] p-12 text-center text-sm text-[#BDB5A8]">
                      Aucun message reçu pour le moment.
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <article
                        key={msg.id}
                        className={`rounded-2xl border p-6 ${
                          msg.is_read
                            ? 'border-[#F4EEE3]/10 bg-[#121216]'
                            : 'border-[#E8C877]/45 bg-[#17161B]'
                        }`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-2.5">
                              {!msg.is_read && (
                                <span className="rounded-full bg-[#E8C877] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#0B0B0C]">
                                  Nouveau
                                </span>
                              )}
                              <h2 className="font-display text-2xl text-[#F4EEE3]">
                                {msg.full_name}
                              </h2>
                              {msg.service && (
                                <span className="rounded-full border border-[#F4EEE3]/15 px-3 py-0.5 text-[11px] text-[#E8C877]">
                                  {msg.service}
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-xs text-[#BDB5A8]">
                              {msg.email}
                              {msg.phone ? ` · ${msg.phone}` : ''} ·{' '}
                              {new Date(msg.created_at).toLocaleString('fr-FR')}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <a
                              href={`mailto:${msg.email}?subject=${encodeURIComponent('Re: KAIROS STUDIO')}`}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[#F4EEE3]/18 px-3 py-1.5 text-xs hover:border-[#E8C877] hover:text-[#E8C877]"
                            >
                              <Mail className="h-3.5 w-3.5" />
                              <span>Répondre</span>
                            </a>
                            {msg.phone && (
                              <a
                                href={`https://wa.me/${msg.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-[#F4EEE3]/18 px-3 py-1.5 text-xs hover:border-[#E8C877] hover:text-[#E8C877]"
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                                <span>WhatsApp</span>
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={async () => {
                                await toggleMessageReadAdmin(msg.id, !msg.is_read);
                                await loadAdminData();
                              }}
                              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#F4EEE3]/18 px-3 py-1.5 text-xs hover:border-[#E8C877]"
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span>{msg.is_read ? 'Marquer non lu' : 'Marquer lu'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                if (!window.confirm('Supprimer ce message ?')) return;
                                await deleteMessageAdmin(msg.id);
                                await loadAdminData();
                              }}
                              className="cursor-pointer rounded-lg border border-red-500/30 p-1.5 text-red-300 hover:bg-red-500/20"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[#E2DBD0]">
                          {msg.message}
                        </p>
                      </article>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
};
