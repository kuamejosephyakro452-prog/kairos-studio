import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  FolderPlus,
  ImagePlus,
  Inbox,
  Layers,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MessageCircle,
  Pencil,
  RefreshCw,
  Save,
  ShieldAlert,
  Trash2,
  Upload,
  Video,
  WifiOff,
  X,
} from 'lucide-react';
import {
  getAdminOAuthRedirectUrl,
  getSupabaseClient,
  isSupabaseConfigured,
  prewarmSupabaseAuth,
} from '@/lib/supabase';
import {
  classifyAuthError,
  hasOAuthCallbackParams,
  parseOAuthCallbackError,
  signInAdminWithResilience,
  signInWithGitHubAdmin,
  type ClassifiedAuthError,
} from '@/lib/adminAuth';
import {
  checkIsAdminUser,
  clearAdminRoleCache,
  deleteAllDemoProjectsAdmin,
  deleteMessageAdmin,
  deleteProjectAdmin,
  fetchAllProjectsAdmin,
  fetchContactMessagesAdmin,
  fetchUnreadMessagesCountAdmin,
  getMissingCollection2026Projects,
  publishMissingCollection2026Admin,
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
  origine_non_verifiee: false,
  demo: false,
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
  const [roleCheckError, setRoleCheckError] = useState<ClassifiedAuthError | null>(null);

  // Formulaire de connexion (GitHub principal + secours e-mail/mot de passe repliable)
  const [loginEmail, setLoginEmail] = useState('kuamejosephyakro452@gmail.com');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordFallback, setShowPasswordFallback] = useState(false);
  const [githubBusy, setGithubBusy] = useState(false);
  const [logoutBusy, setLogoutBusy] = useState(false);
  const [oauthProcessing, setOauthProcessing] = useState(false);
  const [loginError, setLoginError] = useState<ClassifiedAuthError | null>(null);
  const [loginNotice, setLoginNotice] = useState<string | null>(null);
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginStatusText, setLoginStatusText] = useState('Connexion en cours…');
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Verrous synchrones pour éviter les doubles requêtes (clics multiples & events auth)
  const loginInFlightRef = useRef(false);
  const verifiedAdminUserIdRef = useRef<string | null>(null);
  const lastSessionRef = useRef<Session | null>(null);

  // Données admin
  const [activeTab, setActiveTab] = useState<'projects' | 'messages'>('projects');
  const [projectFilter, setProjectFilter] = useState<
    'all' | 'published' | 'draft' | 'unverified' | 'demo'
  >('all');
  const [projects, setProjects] = useState<Project[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [unreadCountState, setUnreadCountState] = useState(0);
  const [dataBusy, setDataBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Éditeur de projet
  const [editing, setEditing] = useState<EditorDraft | null>(null);
  const [deliverablesFrText, setDeliverablesFrText] = useState('');
  const [deliverablesEnText, setDeliverablesEnText] = useState('');
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const catLabels = DICTIONARY.fr.categories;

  /**
   * Chargement initial minimal : projets + simple compteur HEAD des messages non lus.
   * Les messages complets ne sont chargés qu'à l'ouverture de l'onglet Messages.
   */
  const loadAdminData = useCallback(async (options?: { includeMessages?: boolean }) => {
    setDataBusy(true);
    try {
      const [projs, unread] = await Promise.all([
        fetchAllProjectsAdmin(),
        fetchUnreadMessagesCountAdmin(),
      ]);
      setProjects(projs);
      setUnreadCountState(unread);
      if (options?.includeMessages) {
        const msgs = await fetchContactMessagesAdmin();
        setMessages(msgs);
        setMessagesLoaded(true);
        setUnreadCountState(msgs.filter((m) => !m.is_read).length);
      }
    } catch (err) {
      const classified = classifyAuthError(err);
      setFeedback({
        type: 'err',
        text:
          classified.kind === 'network_or_server' || classified.kind === 'timeout'
            ? classified.message
            : err instanceof Error
              ? err.message
              : 'Erreur de chargement Supabase.',
      });
    } finally {
      setDataBusy(false);
    }
  }, []);

  const loadMessagesOnly = useCallback(async () => {
    setMessagesLoading(true);
    try {
      const msgs = await fetchContactMessagesAdmin();
      setMessages(msgs);
      setMessagesLoaded(true);
      setUnreadCountState(msgs.filter((m) => !m.is_read).length);
    } catch (err) {
      const classified = classifyAuthError(err);
      setFeedback({
        type: 'err',
        text:
          classified.kind === 'network_or_server' || classified.kind === 'timeout'
            ? classified.message
            : err instanceof Error
              ? err.message
              : 'Erreur lors du chargement des messages.',
      });
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  const applySessionState = useCallback(
    async (
      session: Session | null,
      options?: { showFullLoader?: boolean; forceRoleCheck?: boolean }
    ) => {
      lastSessionRef.current = session;
      if (!session?.user) {
        verifiedAdminUserIdRef.current = null;
        clearAdminRoleCache();
        setAuthenticated(false);
        setIsAdmin(false);
        setAdminEmail(null);
        setRoleCheckError(null);
        setAuthLoading(false);
        return;
      }

      // Si ce même admin est déjà validé et qu'on ne force pas, ne jamais relancer de cycle complet
      if (!options?.forceRoleCheck && verifiedAdminUserIdRef.current === session.user.id) {
        setAuthenticated(true);
        setIsAdmin(true);
        setAdminEmail(session.user.email ?? null);
        setRoleCheckError(null);
        setAuthLoading(false);
        return;
      }

      if (options?.showFullLoader) {
        setAuthLoading(true);
      }

      try {
        const status = await checkIsAdminUser(session, { force: options?.forceRoleCheck });
        setAuthenticated(status.authenticated);
        setAdminEmail(status.email);
        setRoleCheckError(status.roleCheckError);

        if (status.roleCheckError) {
          setIsAdmin(false);
          verifiedAdminUserIdRef.current = null;
          return;
        }

        setIsAdmin(status.isAdmin);
        if (status.authenticated && status.isAdmin) {
          verifiedAdminUserIdRef.current = status.userId;
          setLoginError(null);
          // Nettoyer ?code=... de l'URL après un retour OAuth PKCE réussi
          if (typeof window !== 'undefined' && /[?&]code=/.test(window.location.search)) {
            window.history.replaceState(null, '', window.location.pathname);
          }
          // L'interface admin s'affiche immédiatement pendant que les projets chargent
          setAuthLoading(false);
          setOauthProcessing(false);
          await loadAdminData();
        } else if (status.authenticated && !status.isAdmin) {
          // Compte authentifié (ex. autre compte GitHub) absent de public.admin_users :
          // révoquer immédiatement la session locale et refuser l'accès explicitement.
          verifiedAdminUserIdRef.current = null;
          clearAdminRoleCache();
          const refusedIdentity = status.email || 'ce compte';
          const client = getSupabaseClient();
          if (client) {
            await client.auth.signOut({ scope: 'local' }).catch(() => undefined);
          }
          if (typeof window !== 'undefined' && /[?&](?:code|error)=/.test(window.location.search)) {
            window.history.replaceState(null, '', window.location.pathname);
          }
          setAuthenticated(false);
          setIsAdmin(false);
          setAdminEmail(null);
          setOauthProcessing(false);
          setLoginError({
            kind: 'unauthorized_account',
            message: `Accès refusé : ${refusedIdentity} n’est pas autorisé à administrer KAIROS STUDIO. Seul le compte administrateur unique est accepté.`,
            retryable: false,
          });
        } else {
          verifiedAdminUserIdRef.current = null;
        }
      } catch (err) {
        setAuthenticated(true);
        setIsAdmin(false);
        setRoleCheckError(classifyAuthError(err));
      } finally {
        setAuthLoading(false);
        setOauthProcessing(false);
      }
    },
    [loadAdminData]
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.location.hash.includes('type=recovery')) {
        setRecoveryMode(true);
      }

      // 1. Inspecter une éventuelle erreur retournée dans l'URL par GitHub / Supabase OAuth
      const oauthErr = parseOAuthCallbackError(window.location.search, window.location.hash);
      if (oauthErr) {
        setLoginError(oauthErr);
        window.history.replaceState(null, '', window.location.pathname);
      } else if (hasOAuthCallbackParams(window.location.search, window.location.hash)) {
        setOauthProcessing(true);
      }
    }

    // Préchauffage non bloquant de la connexion TLS vers Supabase Auth
    prewarmSupabaseAuth();

    const client = getSupabaseClient();
    if (!client) {
      setAuthLoading(false);
      setOauthProcessing(false);
      return;
    }

    let mounted = true;
    let initialHandled = false;

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === 'PASSWORD_RECOVERY') {
        setRecoveryMode(true);
      }

      if (event === 'INITIAL_SESSION') {
        initialHandled = true;
        void applySessionState(session, { showFullLoader: Boolean(session) });
        return;
      }

      if (event === 'SIGNED_OUT') {
        verifiedAdminUserIdRef.current = null;
        clearAdminRoleCache();
        setAuthenticated(false);
        setIsAdmin(false);
        setAdminEmail(null);
        setRoleCheckError(null);
        setProjects([]);
        setMessages([]);
        setMessagesLoaded(false);
        setUnreadCountState(0);
        setEditing(null);
        setAuthLoading(false);
        setOauthProcessing(false);
        return;
      }

      // Sur TOKEN_REFRESHED : garder l'UI intacte sans relancer de vérification réseau ni loader
      if (event === 'TOKEN_REFRESHED') {
        lastSessionRef.current = session;
        return;
      }

      // Sur SIGNED_IN : si handleLogin gère déjà la connexion en cours, ne pas dupliquer
      if (event === 'SIGNED_IN') {
        if (loginInFlightRef.current) return;
        void applySessionState(session, { showFullLoader: false });
      }
    });

    // Garde-fou au cas où INITIAL_SESSION tarderait sur un navigateur atypique
    const fallbackTimer = setTimeout(() => {
      if (!mounted || initialHandled) return;
      initialHandled = true;
      void client.auth
        .getSession()
        .then(({ data }) => {
          if (mounted) void applySessionState(data.session, { showFullLoader: false });
        })
        .catch(() => {
          if (mounted) {
            setAuthLoading(false);
            setOauthProcessing(false);
          }
        });
    }, 4_000);

    return () => {
      mounted = false;
      clearTimeout(fallbackTimer);
      subscription.unsubscribe();
    };
  }, [applySessionState]);

  const handleGitHubLogin = async () => {
    if (loginInFlightRef.current || loginBusy || githubBusy) return;
    setLoginError(null);
    setLoginNotice(null);

    const client = getSupabaseClient();
    if (!client) {
      setLoginError({
        kind: 'unconfigured',
        message: 'Connexion impossible : Supabase n’est pas encore configuré.',
        retryable: false,
      });
      return;
    }

    loginInFlightRef.current = true;
    setGithubBusy(true);

    try {
      const redirectTo = getAdminOAuthRedirectUrl();
      const result = await signInWithGitHubAdmin(client, redirectTo);
      if (result.error) {
        setLoginError(result.error);
        setGithubBusy(false);
        loginInFlightRef.current = false;
        return;
      }
      // En cas normal, Supabase redirige le navigateur vers GitHub ; on garde un garde-fou
      // pour réactiver le bouton si la redirection était bloquée par le navigateur.
      setTimeout(() => {
        setGithubBusy(false);
        loginInFlightRef.current = false;
      }, 10_000);
    } catch (caught) {
      setLoginError(classifyAuthError(caught));
      setGithubBusy(false);
      loginInFlightRef.current = false;
    }
  };

  const handleSendResetEmail = async () => {
    if (loginInFlightRef.current || loginBusy) return;
    setLoginError(null);
    setLoginNotice(null);
    const client = getSupabaseClient();
    if (!client) return;
    setLoginBusy(true);
    setLoginStatusText('Envoi du lien sécurisé…');
    try {
      const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
      const redirectTo = `${window.location.origin}${base}/admin`;
      const { error } = await client.auth.resetPasswordForEmail(loginEmail.trim(), {
        redirectTo,
      });
      if (error) {
        setLoginError(classifyAuthError(error));
      } else {
        setLoginNotice(
          'Un lien sécurisé de définition / réinitialisation du mot de passe a été envoyé à votre adresse administrateur.'
        );
      }
    } catch (caught) {
      setLoginError(classifyAuthError(caught));
    } finally {
      setLoginBusy(false);
      setLoginStatusText('Connexion en cours…');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (newPassword.length < 10) {
      setFeedback({
        type: 'err',
        text: 'Choisissez un mot de passe fort d’au moins 10 caractères.',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'err', text: 'Les deux mots de passe ne correspondent pas.' });
      return;
    }
    const client = getSupabaseClient();
    if (!client) return;
    setDataBusy(true);
    try {
      const { error } = await client.auth.updateUser({ password: newPassword });
      if (error) {
        setFeedback({ type: 'err', text: error.message });
      } else {
        setNewPassword('');
        setConfirmPassword('');
        setRecoveryMode(false);
        setFeedback({
          type: 'ok',
          text: 'Mot de passe administrateur mis à jour avec succès.',
        });
      }
    } finally {
      setDataBusy(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Protection synchrone anti double-clic / soumissions simultanées
    if (loginInFlightRef.current || loginBusy) return;

    setLoginError(null);
    setLoginNotice(null);

    const client = getSupabaseClient();
    if (!client) {
      setLoginError({
        kind: 'unconfigured',
        message: 'Connexion impossible : Supabase n’est pas encore configuré.',
        retryable: false,
      });
      return;
    }

    loginInFlightRef.current = true;
    setLoginBusy(true);
    setLoginStatusText('Connexion sécurisée…');

    try {
      const result = await signInAdminWithResilience(client, loginEmail, loginPassword, {
        maxNetworkRetries: 2,
        onRetrying: (attempt) => {
          setLoginStatusText(`Réseau instable — tentative ${attempt}/3…`);
        },
      });

      if (result.error || !result.session) {
        setLoginError(
          result.error ?? {
            kind: 'unknown',
            message: 'Une erreur inattendue est survenue lors de la connexion. Réessayez.',
            retryable: false,
          }
        );
        return;
      }

      setLoginPassword('');
      setLoginStatusText('Vérification des droits…');
      await applySessionState(result.session, { showFullLoader: false, forceRoleCheck: true });
    } finally {
      loginInFlightRef.current = false;
      setLoginBusy(false);
      setLoginStatusText('Connexion en cours…');
    }
  };

  const handleLogout = async () => {
    if (logoutBusy) return;
    setLogoutBusy(true);

    // 1. Nettoyage immédiat de l'état mémoire et UI (ne jamais bloquer l'utilisateur sur un timeout réseau)
    verifiedAdminUserIdRef.current = null;
    lastSessionRef.current = null;
    loginInFlightRef.current = false;
    clearAdminRoleCache();

    const resetLocalUi = () => {
      setAuthenticated(false);
      setIsAdmin(false);
      setAdminEmail(null);
      setRoleCheckError(null);
      setLoginError(null);
      setLoginNotice(null);
      setFeedback(null);
      setProjects([]);
      setMessages([]);
      setMessagesLoaded(false);
      setUnreadCountState(0);
      setEditing(null);
      setAuthLoading(false);
      setOauthProcessing(false);
      setRecoveryMode(false);
    };

    const client = getSupabaseClient();
    try {
      if (client) {
        // 1. Révocation serveur best-effort bornée à 2 s (utilise encore le token actif)
        await Promise.race([
          client.auth.signOut({ scope: 'global' }).catch(() => undefined),
          new Promise((resolve) => setTimeout(resolve, 2_000)),
        ]);
        // 2. Révocation locale garantie (sans réseau) pour purger la session SDK en mémoire et stockage
        await client.auth.signOut({ scope: 'local' }).catch(() => undefined);
      }
    } finally {
      // Garde-fou stockage local (session + éventuel PKCE code verifier)
      try {
        localStorage.removeItem('kairos-studio-auth');
        localStorage.removeItem('kairos-studio-auth-code-verifier');
      } catch {
        // ignore
      }
      resetLocalUi();
      setLogoutBusy(false);
    }
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
        text: `Enregistré — « ${saved.title_fr} » (${saved.status === 'published' ? 'Publié sur le site public' : 'Brouillon'}).`,
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
            ? `Enregistré — « ${proj.title_fr} » est maintenant publié sur le site public.`
            : `Enregistré — « ${proj.title_fr} » a été repassé en brouillon.`,
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
      setFeedback({ type: 'ok', text: 'Enregistré — Ordre des projets mis à jour sur le site public.' });
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

  const handleDeleteAllDemo = async () => {
    const demoCount = projects.filter((p) => p.demo).length;
    if (demoCount === 0) {
      setFeedback({ type: 'ok', text: 'Aucun contenu de démonstration à supprimer.' });
      return;
    }
    if (
      !window.confirm(
        `Supprimer définitivement les ${demoCount} contenus de démonstration (base + fichiers demo/) ?`
      )
    ) {
      return;
    }
    setDataBusy(true);
    setFeedback(null);
    try {
      const removed = await deleteAllDemoProjectsAdmin();
      await loadAdminData();
      setFeedback({
        type: 'ok',
        text: `${removed} contenu(s) de démonstration supprimé(s) définitivement.`,
      });
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Erreur lors de la suppression des démos.',
      });
    } finally {
      setDataBusy(false);
    }
  };

  const handlePublishMissingCollection = async () => {
    setDataBusy(true);
    setFeedback(null);
    try {
      const added = await publishMissingCollection2026Admin(projects);
      await loadAdminData();
      setFeedback({
        type: 'ok',
        text: `Enregistré — ${added} création(s) de la collection (5 affiches + vidéo Showreel 60 s) publiée(s) dans Supabase et visible(s) sur le site public.`,
      });
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Erreur lors de la publication dans Supabase.',
      });
    } finally {
      setDataBusy(false);
    }
  };

  const missingCollectionProjects = getMissingCollection2026Projects(projects);

  const filteredAdminProjects = projects.filter((p) => {
    if (projectFilter === 'published') return p.status === 'published';
    if (projectFilter === 'draft') return p.status === 'draft';
    if (projectFilter === 'unverified') return Boolean(p.origine_non_verifiee);
    if (projectFilter === 'demo') return Boolean(p.demo);
    return true;
  });

  const unreadCount = messagesLoaded
    ? messages.filter((m) => !m.is_read).length
    : unreadCountState;
  const demoTotal = projects.filter((p) => p.demo).length;
  const unverifiedTotal = projects.filter((p) => p.origine_non_verifiee).length;

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
                  disabled={logoutBusy}
                  onClick={() => void handleLogout()}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#F4EEE3]/20 px-4 py-1.5 text-xs font-medium tracking-[0.14em] uppercase text-[#F4EEE3] hover:border-[#E8C877] hover:text-[#E8C877] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {logoutBusy ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <LogOut className="h-3.5 w-3.5" />
                  )}
                  <span>{logoutBusy ? 'Déconnexion…' : 'Déconnexion'}</span>
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
          {authLoading || oauthProcessing ? (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-center text-sm text-[#BDB5A8]">
              <Loader2 className="h-6 w-6 animate-spin text-[#E8C877]" />
              <span>
                {oauthProcessing
                  ? 'Finalisation de la connexion GitHub sécurisée…'
                  : 'Vérification de la session sécurisée…'}
              </span>
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
                  <li>Définir <code>VITE_SUPABASE_URL</code> et <code>VITE_SUPABASE_ANON_KEY</code> dans <code>.env.local</code> et les variables GitHub Actions.</li>
                  <li>Exécuter <code>supabase/schema.sql</code> puis <code>supabase/seed.sql</code>.</li>
                  <li>Activer le fournisseur GitHub OAuth, désactiver les inscriptions publiques et lier l’unique compte admin dans <code>public.admin_users</code>.</li>
                </ul>
              </div>
            </div>
          ) : !authenticated ? (
            /* Écran de connexion administrateur : GitHub OAuth principal + secours e-mail/mot de passe */
            <div className="mx-auto max-w-md rounded-2xl border border-[#E8C877]/28 bg-[#141418] p-8 sm:p-10">
              <div className="flex items-center gap-2.5 text-[#E8C877]">
                <Lock className="h-4 w-4" />
                <span className="text-[11px] font-semibold tracking-[0.24em] uppercase">
                  Authentification requise
                </span>
              </div>
              <h1 className="mt-3 font-display text-3xl font-light">Connexion Administrateur</h1>
              <p className="mt-2 text-xs leading-relaxed text-[#BDB5A8]">
                Accès strictement réservé à l’administrateur unique de KAIROS STUDIO. Inscriptions publiques désactivées et droits vérifiés côté base de données (RLS).
              </p>

              {/* Alertes globales (GitHub OAuth ou secours) */}
              {loginError && (
                <div
                  role="alert"
                  data-error-kind={loginError.kind}
                  className={`mt-6 flex items-start gap-2.5 rounded-lg border px-4 py-3 text-xs leading-relaxed ${
                    loginError.kind === 'invalid_credentials' ||
                    loginError.kind === 'unauthorized_account'
                      ? 'border-red-500/40 bg-red-500/12 text-red-200'
                      : 'border-amber-400/40 bg-amber-400/10 text-amber-100'
                  }`}
                >
                  {loginError.kind === 'network_or_server' || loginError.kind === 'timeout' ? (
                    <WifiOff className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                  ) : (
                    <AlertTriangle
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        loginError.kind === 'invalid_credentials' ||
                        loginError.kind === 'unauthorized_account'
                          ? 'text-red-300'
                          : 'text-amber-300'
                      }`}
                    />
                  )}
                  <span>{loginError.message}</span>
                </div>
              )}

              {loginNotice && (
                <p
                  role="status"
                  className="mt-6 rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-4 py-2.5 text-xs text-emerald-200"
                >
                  {loginNotice}
                </p>
              )}

              {/* Connexion principale : GitHub OAuth (PKCE) */}
              <div className="mt-7">
                <button
                  type="button"
                  onClick={handleGitHubLogin}
                  disabled={githubBusy || loginBusy}
                  aria-busy={githubBusy}
                  className="inline-flex w-full cursor-pointer items-center justify-center gap-3 rounded-full bg-accent-gradient py-3.5 text-xs font-semibold tracking-[0.2em] uppercase text-[#0B0B0C] transition-opacity disabled:cursor-not-allowed disabled:opacity-65"
                >
                  {githubBusy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-4 w-4 fill-current"
                    >
                      <path d="M12 0.5C5.65 0.5 0.5 5.65 0.5 12c0 5.08 3.29 9.39 7.86 10.91 0.58 0.11 0.79-0.25 0.79-0.56 0-0.28-0.01-1.02-0.02-2-3.2 0.7-3.88-1.54-3.88-1.54-0.52-1.33-1.28-1.69-1.28-1.69-1.05-0.72 0.08-0.7 0.08-0.7 1.16 0.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36 0.96 0.1-0.75 0.4-1.26 0.73-1.55-2.55-0.29-5.24-1.28-5.24-5.69 0-1.26 0.45-2.29 1.19-3.09-0.12-0.29-0.52-1.46 0.11-3.05 0 0 0.97-0.31 3.18 1.18a11.05 11.05 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18 0.63 1.59 0.23 2.76 0.11 3.05 0.74 0.8 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.26 5.68 0.41 0.36 0.78 1.06 0.78 2.14 0 1.55-0.01 2.79-0.01 3.17 0 0.31 0.21 0.68 0.8 0.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35 0.5 12 0.5Z" />
                    </svg>
                  )}
                  <span>{githubBusy ? 'Redirection vers GitHub…' : 'Se connecter avec GitHub'}</span>
                </button>
                <p className="mt-2.5 text-center text-[11px] text-[#9E978B]">
                  Authentification OAuth 2.0 (PKCE) via votre compte GitHub administrateur.
                </p>
              </div>

              {/* Séparateur & Accès de secours e-mail/mot de passe (verrouillé au même compte) */}
              <div className="mt-7 border-t border-[#F4EEE3]/12 pt-5">
                <button
                  type="button"
                  onClick={() => setShowPasswordFallback((prev) => !prev)}
                  aria-expanded={showPasswordFallback}
                  className="flex w-full cursor-pointer items-center justify-between text-left text-xs text-[#BDB5A8] hover:text-[#E8C877]"
                >
                  <span>Connexion de secours (e-mail et mot de passe)</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${showPasswordFallback ? 'rotate-180' : ''}`}
                  />
                </button>

                {showPasswordFallback && (
                  <form onSubmit={handleLogin} className="mt-5 space-y-4">
                    <div>
                      <label htmlFor="admin-email" className="block text-[11px] tracking-[0.2em] uppercase text-[#BDB5A8]">
                        E-mail administrateur
                      </label>
                      <input
                        id="admin-email"
                        type="email"
                        autoComplete="username"
                        required
                        disabled={loginBusy || githubBusy}
                        value={loginEmail}
                        onChange={(e) => {
                          setLoginEmail(e.target.value);
                          if (loginError) setLoginError(null);
                        }}
                        className="mt-2 w-full rounded-lg border border-[#F4EEE3]/18 bg-[#0B0B0C] px-4 py-2.5 text-sm text-[#F4EEE3] outline-none focus:border-[#E8C877] disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <label htmlFor="admin-pass" className="block text-[11px] tracking-[0.2em] uppercase text-[#BDB5A8]">
                        Mot de passe
                      </label>
                      <div className="relative mt-2">
                        <input
                          id="admin-pass"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          required
                          disabled={loginBusy || githubBusy}
                          value={loginPassword}
                          onChange={(e) => {
                            setLoginPassword(e.target.value);
                            if (loginError) setLoginError(null);
                          }}
                          className="w-full rounded-lg border border-[#F4EEE3]/18 bg-[#0B0B0C] py-2.5 pl-4 pr-11 text-sm text-[#F4EEE3] outline-none focus:border-[#E8C877] disabled:opacity-60"
                        />
                        <button
                          type="button"
                          disabled={loginBusy || githubBusy}
                          onClick={() => setShowPassword((prev) => !prev)}
                          aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#BDB5A8] hover:text-[#E8C877] disabled:opacity-50"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loginBusy || githubBusy}
                      aria-busy={loginBusy}
                      className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-[#E8C877]/50 bg-[#E8C877]/12 py-3 text-xs font-semibold tracking-[0.2em] uppercase text-[#E8C877] hover:bg-[#E8C877]/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loginBusy && <Loader2 className="h-4 w-4 animate-spin" />}
                      <span>{loginBusy ? loginStatusText : 'Se connecter par mot de passe'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={loginBusy || githubBusy}
                      onClick={handleSendResetEmail}
                      className="w-full cursor-pointer pt-1 text-center text-xs text-[#BDB5A8] underline decoration-[#E8C877]/45 underline-offset-4 hover:text-[#E8C877] disabled:opacity-50"
                    >
                      Mot de passe de secours oublié ? Recevoir un lien par e-mail
                    </button>
                  </form>
                )}
              </div>
            </div>
          ) : roleCheckError ? (
            /* Erreur réseau/délai lors de la vérification du rôle : ne jamais confondre avec un accès refusé */
            <div className="mx-auto max-w-lg rounded-2xl border border-amber-400/35 bg-[#141418] p-8 text-center">
              <WifiOff className="mx-auto h-10 w-10 text-amber-300" />
              <h1 className="mt-4 font-display text-3xl">Vérification interrompue</h1>
              <p className="mt-2 text-sm text-[#BDB5A8]">{roleCheckError.message}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    void applySessionState(lastSessionRef.current, {
                      showFullLoader: true,
                      forceRoleCheck: true,
                    })
                  }
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-accent-gradient px-6 py-2.5 text-xs font-semibold tracking-[0.18em] uppercase text-[#0B0B0C]"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Réessayer</span>
                </button>
                <button
                  type="button"
                  disabled={logoutBusy}
                  onClick={() => void handleLogout()}
                  className="cursor-pointer rounded-full border border-[#F4EEE3]/25 px-6 py-2.5 text-xs font-semibold tracking-[0.18em] uppercase disabled:opacity-60"
                >
                  {logoutBusy ? 'Déconnexion…' : 'Se déconnecter'}
                </button>
              </div>
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
                disabled={logoutBusy}
                onClick={() => void handleLogout()}
                className="mt-6 cursor-pointer rounded-full border border-[#F4EEE3]/25 px-6 py-2.5 text-xs font-semibold tracking-[0.18em] uppercase disabled:opacity-60"
              >
                {logoutBusy ? 'Déconnexion…' : 'Se déconnecter'}
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
                      if (!messagesLoaded && !messagesLoading) {
                        void loadMessagesOnly();
                      }
                    }}
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold tracking-[0.16em] uppercase ${
                      activeTab === 'messages'
                        ? 'bg-[#E8C877] text-[#0B0B0C]'
                        : 'border border-[#F4EEE3]/20 text-[#F4EEE3]'
                    }`}
                  >
                    <Inbox className="h-3.5 w-3.5" />
                    <span>
                      Messages
                      {messagesLoaded
                        ? ` (${messages.length}${unreadCount > 0 ? ` · ${unreadCount} non lu${unreadCount > 1 ? 's' : ''}` : ''})`
                        : unreadCount > 0
                          ? ` (${unreadCount} non lu${unreadCount > 1 ? 's' : ''})`
                          : ''}
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

              {activeTab === 'projects' && missingCollectionProjects.length > 0 && (
                <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#E8C877]/40 bg-[#17161B] p-5 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#E8C877]">
                      Collection prête à publier dans Supabase ({missingCollectionProjects.length}/6)
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-[#D0C8BC]">
                      Les 5 affiches (Grande Moisson, Véra Botanique, Agir Vert, K-Vibes Sans Sommeil, Cap sur l’Essentiel) et la vidéo Showreel 60 s sont prêtes sur le site mais pas encore enregistrées dans la base Supabase.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={dataBusy}
                    onClick={handlePublishMissingCollection}
                    className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-accent-gradient px-6 py-3 text-xs font-semibold tracking-[0.16em] uppercase text-[#0B0B0C] disabled:opacity-60"
                  >
                    {dataBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    <span>Publier les {missingCollectionProjects.length} créations</span>
                  </button>
                </div>
              )}

              {recoveryMode && (
                <form
                  onSubmit={handleUpdatePassword}
                  className="rounded-2xl border border-[#E8C877]/45 bg-[#17161B] p-6"
                >
                  <h2 className="font-display text-2xl text-[#E8C877]">
                    Définir votre mot de passe administrateur
                  </h2>
                  <p className="mt-1 text-xs text-[#BDB5A8]">
                    Choisissez un mot de passe personnel fort (au moins 10 caractères).
                  </p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <input
                      type="password"
                      required
                      minLength={10}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nouveau mot de passe (min. 10 car.)"
                      className="rounded-lg border border-[#F4EEE3]/18 bg-[#0B0B0C] px-4 py-2.5 text-sm text-[#F4EEE3] outline-none focus:border-[#E8C877]"
                    />
                    <input
                      type="password"
                      required
                      minLength={10}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirmer le mot de passe"
                      className="rounded-lg border border-[#F4EEE3]/18 bg-[#0B0B0C] px-4 py-2.5 text-sm text-[#F4EEE3] outline-none focus:border-[#E8C877]"
                    />
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button
                      type="submit"
                      disabled={dataBusy}
                      className="cursor-pointer rounded-full bg-accent-gradient px-6 py-2.5 text-xs font-semibold tracking-[0.18em] uppercase text-[#0B0B0C]"
                    >
                      Enregistrer le mot de passe
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecoveryMode(false)}
                      className="cursor-pointer rounded-full border border-[#F4EEE3]/20 px-5 py-2.5 text-xs uppercase tracking-[0.14em]"
                    >
                      Fermer
                    </button>
                  </div>
                </form>
              )}

              {/* ONGLET PROJETS */}
              {activeTab === 'projects' && !editing && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {(
                        [
                          { id: 'all', label: `Tous (${projects.length})` },
                          {
                            id: 'published',
                            label: `Publiés (${projects.filter((p) => p.status === 'published').length})`,
                          },
                          {
                            id: 'draft',
                            label: `Brouillons (${projects.filter((p) => p.status === 'draft').length})`,
                          },
                          {
                            id: 'unverified',
                            label: `Origine non vérifiée (${unverifiedTotal})`,
                          },
                          { id: 'demo', label: `Démo (${demoTotal})` },
                        ] as const
                      ).map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setProjectFilter(f.id)}
                          className={`cursor-pointer rounded-full px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.1em] uppercase transition-colors ${
                            projectFilter === f.id
                              ? 'bg-[#FF6B00] text-[#07070B]'
                              : 'border border-[#F4EEE3]/18 text-[#BDB5A8] hover:border-[#FF6B00]/60 hover:text-[#F4EEE3]'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {demoTotal > 0 && (
                        <button
                          type="button"
                          disabled={dataBusy}
                          onClick={handleDeleteAllDemo}
                          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-red-500/45 bg-red-500/15 px-5 py-2.5 text-xs font-semibold tracking-[0.14em] uppercase text-red-200 hover:bg-red-500/30 disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Supprimer tout le contenu de démonstration ({demoTotal})</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={openNewProject}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-accent-gradient px-6 py-2.5 text-xs font-semibold tracking-[0.18em] uppercase text-[#07070B]"
                      >
                        <FolderPlus className="h-4 w-4" />
                        <span>Nouveau projet</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-[#BDB5A8]">
                    Quota Storage gratuit Supabase : ~1 Go (max 25 Mo/fichier). Utilisez les filtres ci-dessus pour retrouver et gérer rapidement les pièces d’origine non vérifiée ou de démonstration.
                  </p>

                  <div className="space-y-4">
                    {filteredAdminProjects.map((proj) => {
                      const idx = projects.findIndex((p) => p.id === proj.id);
                      return (
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
                              {proj.origine_non_verifiee && (
                                <span className="rounded-full bg-orange-500/20 px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.14em] uppercase text-orange-300">
                                  Origine non vérifiée
                                </span>
                              )}
                              {proj.demo && (
                                <span className="rounded-full bg-fuchsia-500/20 px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.14em] uppercase text-fuchsia-300">
                                  Démo temporaire
                                </span>
                              )}
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
                            className="cursor-pointer rounded-lg border border-[#F4EEE3]/15 p-2 text-[#BDB5A8] hover:border-[#FF6B00] hover:text-[#FF6B00] disabled:opacity-30"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === projects.length - 1 || dataBusy}
                            onClick={() => handleMoveProject(idx, 1)}
                            title="Descendre"
                            className="cursor-pointer rounded-lg border border-[#F4EEE3]/15 p-2 text-[#BDB5A8] hover:border-[#FF6B00] hover:text-[#FF6B00] disabled:opacity-30"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            disabled={dataBusy}
                            onClick={() => handleToggleStatus(proj)}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#F4EEE3]/18 px-3 py-2 text-xs text-[#F4EEE3] hover:border-[#FF6B00] hover:text-[#FF8C3A]"
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
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#FF6B00]/55 px-3 py-2 text-xs text-[#FF8C3A] hover:bg-[#FF6B00] hover:text-[#07070B]"
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
                      );
                    })}
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

                  {/* Marqueurs origine & démo */}
                  <div className="flex flex-wrap gap-6 rounded-xl border border-[#F4EEE3]/12 bg-[#0B0B0C] px-4 py-3 text-xs">
                    <label className="inline-flex cursor-pointer items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={Boolean(editing.origine_non_verifiee)}
                        onChange={(e) =>
                          setEditing({ ...editing, origine_non_verifiee: e.target.checked })
                        }
                        className="h-4 w-4 accent-[#FF6B00]"
                      />
                      <span>Origine non vérifiée (à trier ultérieurement)</span>
                    </label>
                    <label className="inline-flex cursor-pointer items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={Boolean(editing.demo)}
                        onChange={(e) => setEditing({ ...editing, demo: e.target.checked })}
                        className="h-4 w-4 accent-[#E6007E]"
                      />
                      <span>Contenu de démonstration temporaire (supprimable en 1 clic)</span>
                    </label>
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
                      className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-accent-gradient px-8 py-3 text-xs font-semibold tracking-[0.2em] uppercase text-[#0B0B0C] disabled:opacity-60"
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
                  {messagesLoading ? (
                    <div className="flex items-center justify-center gap-2.5 rounded-2xl border border-[#F4EEE3]/12 bg-[#141418] p-12 text-sm text-[#BDB5A8]">
                      <Loader2 className="h-4 w-4 animate-spin text-[#E8C877]" />
                      <span>Chargement des messages…</span>
                    </div>
                  ) : messages.length === 0 ? (
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
                                await loadMessagesOnly();
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
                                await loadMessagesOnly();
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
