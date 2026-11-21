import React, { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { DICTIONARY } from '@/i18n/translations';
import {
  fetchPublishedProjects,
  getInitialPublishedProjects,
  PROJECTS_UPDATED_EVENT,
  PROJECTS_VERSION_STORAGE_KEY,
} from '@/lib/projectsRepository';
import { SmoothScrollProvider } from '@/components/SmoothScrollProvider';
import { CustomCursor } from '@/components/CustomCursor';
import { Preloader } from '@/components/Preloader';
import { FullscreenNav } from '@/components/FullscreenNav';
import { Footer } from '@/components/Footer';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import type { FontPairId, Locale, Project } from '@/types/portfolio';

const ProjectDetailPage = lazy(() =>
  import('@/pages/ProjectDetailPage').then((m) => ({ default: m.ProjectDetailPage }))
);
const LegalPage = lazy(() =>
  import('@/pages/LegalPage').then((m) => ({ default: m.LegalPage }))
);
const AdminPage = lazy(() =>
  import('@/pages/AdminPage').then((m) => ({ default: m.AdminPage }))
);

const LOCALE_KEY = 'kairos-locale';
const VALID_FONTS: FontPairId[] = ['syne', 'bricolage', 'fraunces'];

function mapPathToLocale(pathname: string, target: Locale): string {
  if (pathname.startsWith('/fr/projets/')) {
    return pathname.replace('/fr/projets/', target === 'en' ? '/en/projects/' : '/fr/projets/');
  }
  if (pathname.startsWith('/en/projects/')) {
    return pathname.replace('/en/projects/', target === 'fr' ? '/fr/projets/' : '/en/projects/');
  }
  if (pathname === '/fr/mentions-legales' || pathname === '/en/legal-notice') {
    return target === 'fr' ? '/fr/mentions-legales' : '/en/legal-notice';
  }
  if (pathname === '/fr/confidentialite' || pathname === '/en/privacy') {
    return target === 'fr' ? '/fr/confidentialite' : '/en/privacy';
  }
  return `/${target}`;
}

const PublicLayout: React.FC<{
  locale: Locale;
  children: React.ReactNode;
}> = ({ locale, children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      localStorage.setItem(LOCALE_KEY, locale);
    } catch {
      // ignore
    }
  }, [locale]);

  const handleSwitchLocale = (next: Locale) => {
    if (next === locale) return;
    try {
      localStorage.setItem(LOCALE_KEY, next);
    } catch {
      // ignore
    }
    const nextPath = mapPathToLocale(location.pathname, next);
    navigate(`${nextPath}${location.search}${location.hash}`);
  };

  return (
    <SmoothScrollProvider>
      <div className="film-grain" aria-hidden="true" />
      <CustomCursor />
      <Preloader caption={DICTIONARY[locale].preloader.caption} />
      <FullscreenNav locale={locale} onSwitchLocale={handleSwitchLocale} />
      <div key={location.pathname} className="page-transition">
        {children}
      </div>
      <Footer locale={locale} />
      <FloatingWhatsApp locale={locale} />
    </SmoothScrollProvider>
  );
};

const RootRedirect: React.FC = () => {
  if (
    typeof window !== 'undefined' &&
    (/type=recovery|access_token=|error_description=|error=/.test(window.location.hash) ||
      /[?&](?:code|error|error_code|error_description)=/.test(window.location.search))
  ) {
    return <Navigate to={`/admin${window.location.search}${window.location.hash}`} replace />;
  }

  let target: Locale = 'fr';
  try {
    const saved = localStorage.getItem(LOCALE_KEY);
    if (saved === 'en') target = 'en';
  } catch {
    target = 'fr';
  }
  const search = typeof window !== 'undefined' ? window.location.search : '';
  return <Navigate to={`/${target}${search}`} replace />;
};

/**
 * Pont de synchronisation live Supabase -> site public :
 * - À chaque retour depuis /admin vers une page publique : force une lecture fraîche Supabase.
 * - Sur événement local (même onglet) ou storage (autre onglet admin) : recharge immédiatement.
 * - Au retour sur l'onglet (visibilitychange) : recharge si le cache court (2 min) a expiré.
 */
const ProjectsSyncBridge: React.FC<{
  onSync: (force: boolean) => void;
}> = ({ onSync }) => {
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    const prev = prevPathRef.current;
    prevPathRef.current = location.pathname;
    const leftAdmin = prev.startsWith('/admin') && !location.pathname.startsWith('/admin');
    if (leftAdmin) {
      onSync(true);
    } else if (!location.pathname.startsWith('/admin')) {
      onSync(false);
    }
  }, [location.pathname, onSync]);

  useEffect(() => {
    const handleLocalUpdate = () => onSync(true);
    const handleStorage = (e: StorageEvent) => {
      if (e.key === PROJECTS_VERSION_STORAGE_KEY) {
        onSync(true);
      }
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && !location.pathname.startsWith('/admin')) {
        onSync(false);
      }
    };

    window.addEventListener(PROJECTS_UPDATED_EVENT, handleLocalUpdate);
    window.addEventListener('storage', handleStorage);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener(PROJECTS_UPDATED_EVENT, handleLocalUpdate);
      window.removeEventListener('storage', handleStorage);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [location.pathname, onSync]);

  return null;
};

export const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(() => getInitialPublishedProjects());
  const [projectsHydrating, setProjectsHydrating] = useState(true);

  useEffect(() => {
    const qFont = new URLSearchParams(window.location.search).get('font') as FontPairId | null;
    if (qFont && VALID_FONTS.includes(qFont)) {
      document.documentElement.setAttribute('data-font', qFont);
    }
  }, []);

  const syncPublishedProjects = useCallback((force: boolean) => {
    let active = true;
    fetchPublishedProjects({ force }).then(({ projects: live }) => {
      if (active) {
        setProjects(live);
        setProjectsHydrating(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Lecture prioritaire depuis Supabase à chaque visite (remplace le repli statique sans clignotement)
  useEffect(() => {
    return syncPublishedProjects(true);
  }, [syncPublishedProjects]);

  const basename = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '') || '/';

  return (
    <BrowserRouter basename={basename === '/' ? undefined : basename}>
      <ProjectsSyncBridge onSync={syncPublishedProjects} />
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] font-mono-tech text-xs tracking-[0.26em] uppercase text-[var(--accent-text)]">
            KAIROS STUDIO
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<RootRedirect />} />

          {/* Routes françaises */}
          <Route
            path="/fr"
            element={
              <PublicLayout locale="fr">
                <HomePage locale="fr" projects={projects} />
              </PublicLayout>
            }
          />
          <Route
            path="/fr/projets/:slug"
            element={
              <PublicLayout locale="fr">
                <ProjectDetailPage
                  locale="fr"
                  projects={projects}
                  projectsLoading={projectsHydrating}
                />
              </PublicLayout>
            }
          />
          <Route
            path="/fr/mentions-legales"
            element={
              <PublicLayout locale="fr">
                <LegalPage locale="fr" kind="legal" />
              </PublicLayout>
            }
          />
          <Route
            path="/fr/confidentialite"
            element={
              <PublicLayout locale="fr">
                <LegalPage locale="fr" kind="privacy" />
              </PublicLayout>
            }
          />

          {/* Routes anglaises */}
          <Route
            path="/en"
            element={
              <PublicLayout locale="en">
                <HomePage locale="en" projects={projects} />
              </PublicLayout>
            }
          />
          <Route
            path="/en/projects/:slug"
            element={
              <PublicLayout locale="en">
                <ProjectDetailPage
                  locale="en"
                  projects={projects}
                  projectsLoading={projectsHydrating}
                />
              </PublicLayout>
            }
          />
          <Route
            path="/en/legal-notice"
            element={
              <PublicLayout locale="en">
                <LegalPage locale="en" kind="legal" />
              </PublicLayout>
            }
          />
          <Route
            path="/en/privacy"
            element={
              <PublicLayout locale="en">
                <LegalPage locale="en" kind="privacy" />
              </PublicLayout>
            }
          />

          {/* Administration privée (noindex, hors sitemap) */}
          <Route path="/admin" element={<AdminPage />} />

          {/* Page 404 mémorable */}
          <Route
            path="/en/*"
            element={
              <PublicLayout locale="en">
                <NotFoundPage locale="en" />
              </PublicLayout>
            }
          />
          <Route
            path="*"
            element={
              <PublicLayout locale="fr">
                <NotFoundPage locale="fr" />
              </PublicLayout>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
