import React from 'react';
import { PUBLISHED_PROJECTS } from '@/content/projects';
import { ManifestoSection } from '@/components/ManifestoSection';
import { ServicesStage } from '@/components/ServicesStage';
import { WorksShowcase } from '@/components/WorksShowcase';
import { FounderStage } from '@/components/FounderStage';
import { KineticMarquee } from '@/components/KineticMarquee';
import { ContactSection } from '@/components/ContactSection';
import type { WorksReturnState } from '@/lib/scrollControl';
import type { Locale, ProjectCategory } from '@/types/portfolio';

interface HomeBelowFoldProps {
  locale: Locale;
  activeCategory: ProjectCategory | 'all';
  onChangeCategory: (cat: ProjectCategory | 'all') => void;
  initialReturnState?: WorksReturnState | null;
  onReadyForRestore?: () => void;
}

export const HomeBelowFold: React.FC<HomeBelowFoldProps> = ({
  locale,
  activeCategory,
  onChangeCategory,
  initialReturnState,
  onReadyForRestore,
}) => {
  return (
    <>
      <ManifestoSection locale={locale} />
      <ServicesStage
        locale={locale}
        projects={PUBLISHED_PROJECTS}
        onSelectCategory={onChangeCategory}
      />
      <WorksShowcase
        locale={locale}
        projects={PUBLISHED_PROJECTS}
        activeCategory={activeCategory}
        onChangeCategory={onChangeCategory}
        initialReturnState={initialReturnState}
        onReadyForRestore={onReadyForRestore}
      />
      <FounderStage locale={locale} />
      <KineticMarquee locale={locale} />
      <ContactSection locale={locale} />
    </>
  );
};
