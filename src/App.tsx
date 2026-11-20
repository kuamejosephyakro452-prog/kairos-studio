import React, { Suspense, lazy, useEffect, useState } from 'react';
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
  getStaticPublishedProjects,
} from '@/lib/projectsRepository';
import { SmoothScrollProvider } from '@/components/SmoothScrollProvider';
import { CustomCursor } from '@/components/CustomCursor';
import { Preloader } from '@/components/Preloader';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { HomePage } from '@/pages/HomePage';
import type { Locale, Project, ThemeMode } from '@/types/portfolio';

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
const THEME_KEY = 'kairos-theme';

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
  theme: ThemeMode;
  onToggleTheme: () => void;
  children: React.ReactNode;
}> = ({ locale, theme, onToggleTheme, children }) => {
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
    navigate(`${nextPath}${location.hash}`);
  };

  return (
    <SmoothScrollProvider>
      <div className="film-grain" aria-hidden="true" />
      <CustomCursor />
      <Preloader caption={DICTIONARY[locale].preloader.caption} />
      <Navbar
        locale={locale}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onSwitchLocale={handleSwitchLocale}
      />
      <div key={location.pathname} className="animate-[fadeIn_0.4s_ease-out]">
        {children}
      </div>
      <Footer locale={locale} />
    </SmoothScrollProvider>
  );
};

const RootRedirect: React.FC = () => {
  // Français PAR DÉFAUT. Ne bascule vers /en que si l'utilisateur a explicitement mémorisé 'en'.
  let target: Locale = 'fr';
  try {
    const saved = localStorage.getItem(LOCALE_KEY);
    if (saved === 'en') target = 'en';
  } catch {
    target = 'fr';
  }
  return <Navigate to={`/${target}`} replace />;
};

export const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(() => getStaticPublishedProjects());
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'editorial';
    try {
      const saved = localStorage.getItem(THEME_KEY);
      return saved === 'nocturne' ? 'nocturne' : 'editorial';
    } catch {
      return 'editorial';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  useEffect(() => {
    let active = true;
    fetchPublishedProjects().then(({ projects: live }) => {
      if (active && live.length > 0) {
        setProjects(live);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const toggleTheme = () =>
    setTheme((prev) => (prev === 'editorial' ? 'nocturne' : 'editorial'));

  const basename = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '') || '/';

  return (
    <BrowserRouter basename={basename === '/' ? undefined : basename}>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-[#0B0B0C] text-xs tracking-[0.26em] uppercase text-[#E8C877]">
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
            <PublicLayout locale="fr" theme={theme} onToggleTheme={toggleTheme}>
              <HomePage locale="fr" projects={projects} />
            </PublicLayout>
          }
        />
        <Route
          path="/fr/projets/:slug"
          element={
            <PublicLayout locale="fr" theme={theme} onToggleTheme={toggleTheme}>
              <ProjectDetailPage locale="fr" projects={projects} />
            </PublicLayout>
          }
        />
        <Route
          path="/fr/mentions-legales"
          element={
            <PublicLayout locale="fr" theme={theme} onToggleTheme={toggleTheme}>
              <LegalPage locale="fr" kind="legal" />
            </PublicLayout>
          }
        />
        <Route
          path="/fr/confidentialite"
          element={
            <PublicLayout locale="fr" theme={theme} onToggleTheme={toggleTheme}>
              <LegalPage locale="fr" kind="privacy" />
            </PublicLayout>
          }
        />

        {/* Routes anglaises */}
        <Route
          path="/en"
          element={
            <PublicLayout locale="en" theme={theme} onToggleTheme={toggleTheme}>
              <HomePage locale="en" projects={projects} />
            </PublicLayout>
          }
        />
        <Route
          path="/en/projects/:slug"
          element={
            <PublicLayout locale="en" theme={theme} onToggleTheme={toggleTheme}>
              <ProjectDetailPage locale="en" projects={projects} />
            </PublicLayout>
          }
        />
        <Route
          path="/en/legal-notice"
          element={
            <PublicLayout locale="en" theme={theme} onToggleTheme={toggleTheme}>
              <LegalPage locale="en" kind="legal" />
            </PublicLayout>
          }
        />
        <Route
          path="/en/privacy"
          element={
            <PublicLayout locale="en" theme={theme} onToggleTheme={toggleTheme}>
              <LegalPage locale="en" kind="privacy" />
            </PublicLayout>
          }
        />

        {/* Administration privée (hors sitemap, noindex) */}
        <Route path="/admin" element={<AdminPage />} />

        {/* Repli général */}
        <Route path="*" element={<Navigate to="/fr" replace />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
