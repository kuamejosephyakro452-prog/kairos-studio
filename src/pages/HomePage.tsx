import React, { Suspense, lazy, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { DICTIONARY } from '@/i18n/translations';
import { HeroSection } from '@/components/HeroSection';
import { SeoHead } from '@/components/SeoHead';
import type { Locale, ProjectCategory } from '@/types/portfolio';

const HomeBelowFold = lazy(() =>
  import('@/components/HomeBelowFold').then((m) => ({ default: m.HomeBelowFold }))
);

interface HomePageProps {
  locale: Locale;
}

export const HomePage: React.FC<HomePageProps> = ({ locale }) => {
  const t = DICTIONARY[locale];
  const [activeCategory, setActiveCategory] = useState<ProjectCategory | 'all'>('all');
  const location = useLocation();
  const [mountBelowFold, setMountBelowFold] = useState<boolean>(() => Boolean(location.hash));

  // Diffère le chargement des sections sous la ligne de flottaison (GSAP/ScrollTrigger/galerie)
  // juste après le premier rendu du Hero, ou immédiatement dès le premier scroll / ancre #hash.
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
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
            />
          </Suspense>
        ) : (
          <div className="min-h-screen bg-[var(--bg-elevated)]" aria-hidden="true" />
        )}
      </main>
    </>
  );
};
