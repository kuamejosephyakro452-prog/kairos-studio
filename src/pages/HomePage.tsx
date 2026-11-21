import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { DICTIONARY } from '@/i18n/translations';
import { HeroSection } from '@/components/HeroSection';
import { ManifestoSection } from '@/components/ManifestoSection';
import { ServicesStage } from '@/components/ServicesStage';
import { WorksShowcase } from '@/components/WorksShowcase';
import { FounderStage } from '@/components/FounderStage';
import { KineticMarquee } from '@/components/KineticMarquee';
import { ContactSection } from '@/components/ContactSection';
import { SeoHead } from '@/components/SeoHead';
import type { Locale, Project, ProjectCategory } from '@/types/portfolio';

interface HomePageProps {
  locale: Locale;
  projects: Project[];
}

export const HomePage: React.FC<HomePageProps> = ({ locale, projects }) => {
  const t = DICTIONARY[locale];
  const [activeCategory, setActiveCategory] = useState<ProjectCategory | 'all'>('all');
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const timer = window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
      return () => window.clearTimeout(timer);
    }
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
        <ManifestoSection locale={locale} />
        <ServicesStage
          locale={locale}
          projects={projects}
          onSelectCategory={(cat) => setActiveCategory(cat)}
        />
        <WorksShowcase
          locale={locale}
          projects={projects}
          activeCategory={activeCategory}
          onChangeCategory={setActiveCategory}
        />
        <FounderStage locale={locale} />
        <KineticMarquee locale={locale} />
        <ContactSection locale={locale} />
      </main>
    </>
  );
};
