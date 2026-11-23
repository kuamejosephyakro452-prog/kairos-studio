import React, { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { DICTIONARY } from '@/i18n/translations';
import { HeroSection } from '@/components/HeroSection';
import { SeoHead } from '@/components/SeoHead';
import {
  clearWorksReturnState,
  peekWorksReturnState,
  scrollToElement,
  scrollToY,
  type WorksReturnState,
} from '@/lib/scrollControl';
import type { Locale, ProjectCategory } from '@/types/portfolio';

const HomeBelowFold = lazy(() =>
  import('@/components/HomeBelowFold').then((m) => ({ default: m.HomeBelowFold }))
);

interface HomePageProps {
  locale: Locale;
}

export const HomePage: React.FC<HomePageProps> = ({ locale }) => {
  const t = DICTIONARY[locale];
  const location = useLocation();
  const navigationType = useNavigationType();

  // Détecte une seule fois au montage un retour depuis une fiche projet
  // (bouton Retour navigateur OU lien « Retour aux réalisations »)
  const [restoreSnapshot] = useState<WorksReturnState | null>(() => {
    if (location.hash) return null;
    const navState = location.state as { restoreWorksState?: boolean } | null;
    const isReturnNav = navigationType === 'POP' || Boolean(navState?.restoreWorksState);
    return isReturnNav ? peekWorksReturnState() : null;
  });

  const pendingRestoreRef = useRef<WorksReturnState | null>(restoreSnapshot);
  const [activeCategory, setActiveCategory] = useState<ProjectCategory | 'all'>(
    () => restoreSnapshot?.activeCategory ?? 'all'
  );
  const [mountBelowFold, setMountBelowFold] = useState<boolean>(() =>
    Boolean(location.hash || restoreSnapshot)
  );

  // Sur une arrivée normale en page d'accueil (hors retour projet et hors #ancre), repart proprement en haut
  useEffect(() => {
    if (pendingRestoreRef.current || location.hash) return;
    scrollToY(0, { immediate: true });
  }, [location.pathname, location.hash]);

  // Restaure la position exacte dès que WorksShowcase a stabilisé sa hauteur (galerie horizontale, index ou explorer)
  const handleReadyForRestore = useCallback(() => {
    const target = pendingRestoreRef.current;
    if (!target) return;
    pendingRestoreRef.current = null;
    clearWorksReturnState();

    let userInteracted = false;
    const markInteracted = () => {
      userInteracted = true;
    };
    window.addEventListener('wheel', markInteracted, { passive: true, once: true });
    window.addEventListener('touchstart', markInteracted, { passive: true, once: true });

    scrollToY(target.scrollY, { immediate: true });

    // Garde-fou court si Lenis ou des images finissent de se caler juste après le premier frame
    const raf = requestAnimationFrame(() => {
      if (!userInteracted) scrollToY(target.scrollY, { immediate: true });
    });
    const timer = window.setTimeout(() => {
      if (!userInteracted) scrollToY(target.scrollY, { immediate: true });
      window.removeEventListener('wheel', markInteracted);
      window.removeEventListener('touchstart', markInteracted);
    }, 140);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      window.removeEventListener('wheel', markInteracted);
      window.removeEventListener('touchstart', markInteracted);
    };
  }, []);

  // Diffère le chargement des sections sous la ligne de flottaison (GSAP/ScrollTrigger/galerie)
  // juste après le premier rendu du Hero, ou immédiatement dès le premier scroll / ancre #hash / retour projet.
  useEffect(() => {
    if (mountBelowFold) return;
    if (location.hash) {
      setMountBelowFold(true);
      return;
    }

    const activate = () => setMountBelowFold(true);
    window.addEventListener('scroll', activate, { passive: true, once: true });
    window.addEventListener('wheel', activate, { passive: true, once: true });
    window.addEventListener('touchstart', activate, { passive: true, once: true });

    const timer = window.setTimeout(activate, 450);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', activate);
      window.removeEventListener('wheel', activate);
      window.removeEventListener('touchstart', activate);
    };
  }, [mountBelowFold, location.hash]);

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace('#', '');
    let attempts = 0;
    let timer = 0;
    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        scrollToElement(el, { immediate: false });
        return;
      }
      if (attempts++ < 15) {
        timer = window.setTimeout(tryScroll, 120);
      }
    };
    timer = window.setTimeout(tryScroll, 100);
    return () => window.clearTimeout(timer);
  }, [location.hash]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'KAIROS STUDIO',
        slogan: 'Turning Ideas Into Experiences.',
        email: 'kuamejosephyakro452@gmail.com',
        telephone: '+2250789501705',
        founder: {
          '@type': 'Person',
          name: 'Joseph Kouamé',
          jobTitle: locale === 'fr' ? 'Fondateur & Directeur créatif' : 'Founder & Creative Director',
        },
      },
      {
        '@type': 'WebSite',
        name: 'KAIROS STUDIO',
        inLanguage: locale === 'fr' ? 'fr-FR' : 'en-US',
      },
    ],
  };

  return (
    <>
      <SeoHead
        title={t.meta.homeTitle}
        description={t.meta.homeDescription}
        locale={locale}
        canonicalPath={`/${locale}`}
        alternateFrPath="/fr"
        alternateEnPath="/en"
        jsonLd={jsonLd}
      />

      <main id="main-content">
        <HeroSection locale={locale} />
        {mountBelowFold ? (
          <Suspense fallback={<div className="min-h-screen bg-[var(--bg-elevated)]" aria-hidden="true" />}>
            <HomeBelowFold
              locale={locale}
              activeCategory={activeCategory}
              onChangeCategory={setActiveCategory}
              initialReturnState={restoreSnapshot}
              onReadyForRestore={handleReadyForRestore}
            />
          </Suspense>
        ) : (
          <div className="min-h-screen bg-[var(--bg-elevated)]" aria-hidden="true" />
        )}
      </main>
    </>
  );
};
