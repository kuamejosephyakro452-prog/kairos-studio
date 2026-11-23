import React, { Suspense, lazy, useEffect, useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { SmoothScrollProvider } from '@/components/SmoothScrollProvider';
import { FullscreenNav } from '@/components/FullscreenNav';
import { Footer } from '@/components/Footer';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import type { FontPairId, Locale } from '@/types/portfolio';

const CustomCursor = lazy(() =>
  import('@/components/CustomCursor').then((m) => ({ default: m.CustomCursor }))
);
const ProjectDetailPage = lazy(() =>
  import('@/pages/ProjectDetailPage').then((m) => ({ default: m.ProjectDetailPage }))
);
const LegalPage = lazy(() =>
  import('@/pages/LegalPage').then((m) => ({ default: m.LegalPage }))
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
  const [enableDesktopCursor, setEnableDesktopCursor] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(LOCALE_KEY, locale);
    } catch {
      // ignore
    }
  }, [locale]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (fine && !reduced) {
      setEnableDesktopCursor(true);
    }
  }, []);

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
      {enableDesktopCursor && (
        <Suspense fallback={null}>
          <CustomCursor />
        </Suspense>
      )}
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
  useEffect(() => {
    const qFont = new URLSearchParams(window.location.search).get('font') as FontPairId | null;
    if (qFont && VALID_FONTS.includes(qFont)) {
      document.documentElement.setAttribute('data-font', qFont);
    }
  }, []);

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
              <PublicLayout locale="fr">
                <HomePage locale="fr" />
              </PublicLayout>
            }
          />
          <Route
            path="/fr/projets/:slug"
            element={
              <PublicLayout locale="fr">
                <ProjectDetailPage locale="fr" />
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
                <HomePage locale="en" />
              </PublicLayout>
            }
          />
          <Route
            path="/en/projects/:slug"
            element={
              <PublicLayout locale="en">
                <ProjectDetailPage locale="en" />
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

          {/* Page 404 */}
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
