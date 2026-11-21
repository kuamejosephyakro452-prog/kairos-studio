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
import { FullscreenNav } from '@/components/FullscreenNav';
import { Footer } from '@/components/Footer';
import { PaletteSwitcher } from '@/components/PaletteSwitcher';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import type { FontPairId, Locale, PaletteId, Project } from '@/types/portfolio';

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
const PALETTE_KEY = 'kairos-palette';
const VALID_PALETTES: PaletteId[] = ['braise', 'indigo', 'encre'];
const VALID_FONTS: FontPairId[] = ['syne', 'bricolage', 'fraunces'];

function detectInitialPalette(): PaletteId {
  if (typeof window === 'undefined') return 'braise';
  try {
    const q = new URLSearchParams(window.location.search).get('palette') as PaletteId | null;
    if (q && VALID_PALETTES.includes(q)) return q;
    const saved = localStorage.getItem(PALETTE_KEY) as PaletteId | null;
    if (saved && VALID_PALETTES.includes(saved)) return saved;
  } catch {
    // ignore
  }
  return 'braise';
}

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
  palette: PaletteId;
  onChangePalette: (next: PaletteId) => void;
  children: React.ReactNode;
}> = ({ locale, palette, onChangePalette, children }) => {
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
      {/* Sélecteur temporaire de palette (?palette=braise|indigo|encre) — retirer cette ligne une fois la palette définitivement validée */}
      <PaletteSwitcher locale={locale} palette={palette} onChange={onChangePalette} />
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

export const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(() => getStaticPublishedProjects());
  const [palette, setPalette] = useState<PaletteId>(() => detectInitialPalette());

  useEffect(() => {
    document.documentElement.setAttribute('data-palette', palette);
    const metaTheme = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.content =
        palette === 'indigo' ? '#0A0E27' : palette === 'encre' ? '#F3EEE6' : '#07070B';
    }
    try {
      localStorage.setItem(PALETTE_KEY, palette);
    } catch {
      // ignore
    }
  }, [palette]);

  useEffect(() => {
    const qFont = new URLSearchParams(window.location.search).get('font') as FontPairId | null;
    if (qFont && VALID_FONTS.includes(qFont)) {
      document.documentElement.setAttribute('data-font', qFont);
    }
  }, []);

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

  const handleChangePalette = (next: PaletteId) => {
    setPalette(next);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('palette', next);
      window.history.replaceState(null, '', url.toString());
    } catch {
      // ignore
    }
  };

  const basename = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '') || '/';

  return (
    <BrowserRouter basename={basename === '/' ? undefined : basename}>
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
              <PublicLayout locale="fr" palette={palette} onChangePalette={handleChangePalette}>
                <HomePage locale="fr" palette={palette} projects={projects} />
              </PublicLayout>
            }
          />
          <Route
            path="/fr/projets/:slug"
            element={
              <PublicLayout locale="fr" palette={palette} onChangePalette={handleChangePalette}>
                <ProjectDetailPage locale="fr" projects={projects} />
              </PublicLayout>
            }
          />
          <Route
            path="/fr/mentions-legales"
            element={
              <PublicLayout locale="fr" palette={palette} onChangePalette={handleChangePalette}>
                <LegalPage locale="fr" kind="legal" />
              </PublicLayout>
            }
          />
          <Route
            path="/fr/confidentialite"
            element={
              <PublicLayout locale="fr" palette={palette} onChangePalette={handleChangePalette}>
                <LegalPage locale="fr" kind="privacy" />
              </PublicLayout>
            }
          />

          {/* Routes anglaises */}
          <Route
            path="/en"
            element={
              <PublicLayout locale="en" palette={palette} onChangePalette={handleChangePalette}>
                <HomePage locale="en" palette={palette} projects={projects} />
              </PublicLayout>
            }
          />
          <Route
            path="/en/projects/:slug"
            element={
              <PublicLayout locale="en" palette={palette} onChangePalette={handleChangePalette}>
                <ProjectDetailPage locale="en" projects={projects} />
              </PublicLayout>
            }
          />
          <Route
            path="/en/legal-notice"
            element={
              <PublicLayout locale="en" palette={palette} onChangePalette={handleChangePalette}>
                <LegalPage locale="en" kind="legal" />
              </PublicLayout>
            }
          />
          <Route
            path="/en/privacy"
            element={
              <PublicLayout locale="en" palette={palette} onChangePalette={handleChangePalette}>
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
              <PublicLayout locale="en" palette={palette} onChangePalette={handleChangePalette}>
                <NotFoundPage locale="en" />
              </PublicLayout>
            }
          />
          <Route
            path="*"
            element={
              <PublicLayout locale="fr" palette={palette} onChangePalette={handleChangePalette}>
                <NotFoundPage locale="fr" />
              </PublicLayout>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
