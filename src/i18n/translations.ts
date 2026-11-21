import type { Locale, ProjectCategory } from '@/types/portfolio';

export interface ServiceItem {
  id: ProjectCategory;
  index: string;
  title: string;
  tagline: string;
  description: string;
  deliverables: string[];
  previewAssetId: string;
  ambientColor: string;
}

export interface SkillGroup {
  index: string;
  title: string;
  items: string[];
}

export interface SiteDictionary {
  meta: {
    homeTitle: string;
    homeDescription: string;
    projectTitleSuffix: string;
    legalTitle: string;
    privacyTitle: string;
    notFoundTitle: string;
  };
  nav: {
    services: string;
    works: string;
    explorer: string;
    founder: string;
    contact: string;
    menu: string;
    close: string;
    skipToContent: string;
    directAccess: string;
  };
  preloader: {
    caption: string;
  };
  hero: {
    badge: string;
    headlineLine1: string;
    headlineLine2: string;
    headlineLine3: string;
    signature: string;
    clientPitch: string;
    ctaPrimary: string;
    ctaSecondary: string;
    scrollHint: string;
    showreelLabel: string;
    monogramCaption: string;
  };
  manifesto: {
    label: string;
    statement: string;
    subtext: string;
    steps: { code: string; title: string; detail: string }[];
  };
  services: {
    label: string;
    title: string;
    subtitle: string;
    exploreCategory: string;
    hoverHint: string;
    items: ServiceItem[];
  };
  categories: Record<ProjectCategory | 'all', string>;
  works: {
    label: string;
    title: string;
    subtitle: string;
    modeGallery: string;
    modeList: string;
    modeExplore: string;
    pinnedHint: string;
    dragHint: string;
    resetCanvas: string;
    viewProject: string;
    publishedCount: string;
    demoBadge: string;
    videoBadge: string;
    visualBadge: string;
    emptyCategoryTitle: string;
    emptyCategoryText: string;
    viewAll: string;
  };
  founder: {
    label: string;
    name: string;
    role: string;
    headline: string;
    bio1: string;
    bio2: string;
    pillars: { code: string; label: string; value: string }[];
    skillsTitle: string;
    skillsGroups: SkillGroup[];
    contactCta: string;
  };
  marquee: {
    row1: string[];
    row2: string[];
  };
  contact: {
    label: string;
    title: string;
    subtitle: string;
    directHeading: string;
    emailLabel: string;
    whatsappLabel: string;
    whatsappCta: string;
    floatingWhatsapp: string;
    availabilityNote: string;
    form: {
      name: string;
      namePlaceholder: string;
      email: string;
      emailPlaceholder: string;
      phone: string;
      phonePlaceholder: string;
      service: string;
      servicePlaceholder: string;
      message: string;
      messagePlaceholder: string;
      submit: string;
      submitting: string;
      successTitle: string;
      successBody: string;
      fallbackTitle: string;
      fallbackBody: string;
      fallbackButton: string;
      validationName: string;
      validationEmail: string;
      validationMessage: string;
      rateLimitError: string;
    };
  };
  projectDetail: {
    backToWorks: string;
    caseStudyLabel: string;
    category: string;
    client: string;
    year: string;
    role: string;
    deliverables: string;
    visitLink: string;
    contextHeading: string;
    executionHeading: string;
    galleryHeading: string;
    videoHeading: string;
    demoNotice: string;
    nextProjectLabel: string;
    discussSimilar: string;
    fullscreenHint: string;
    closeLightbox: string;
  };
  notFound: {
    code: string;
    title: string;
    subtitle: string;
    backHome: string;
    viewWorks: string;
  };
  footer: {
    ctaEyebrow: string;
    ctaTitle: string;
    ctaButton: string;
    signature: string;
    navigation: string;
    directContact: string;
    legalNotice: string;
    privacyPolicy: string;
    rights: string;
    backToTop: string;
  };
  legal: {
    backHome: string;
    legalNoticeTitle: string;
    legalNoticeIntro: string;
    legalSections: { heading: string; paragraphs: string[] }[];
    privacyTitle: string;
    privacyIntro: string;
    privacySections: { heading: string; paragraphs: string[] }[];
  };
}

export const DICTIONARY: Record<Locale, SiteDictionary> = {
  fr: {
    meta: {
      homeTitle: 'KAIROS STUDIO — Turning Ideas Into Experiences | Joseph Kouamé',
      homeDescription:
        'Studio créatif et numérique dirigé par Joseph Kouamé. Design graphique, production audiovisuelle, communication digitale, solutions numériques / TIC et création de sites web.',
      projectTitleSuffix: 'KAIROS STUDIO',
      legalTitle: 'Mentions légales — KAIROS STUDIO',
      privacyTitle: 'Politique de confidentialité — KAIROS STUDIO',
      notFoundTitle: 'Page introuvable — KAIROS STUDIO',
    },
    nav: {
      services: 'Expertises',
      works: 'Réalisations',
      explorer: 'Explorer',
      founder: 'Studio & Fondateur',
      contact: 'Contact',
      menu: 'Menu',
      close: 'Fermer',
      skipToContent: 'Aller au contenu principal',
      directAccess: 'Échange direct',
    },
    preloader: {
      caption: 'Turning Ideas Into Experiences.',
    },
    hero: {
      badge: 'Studio créatif & numérique · Joseph Kouamé',
      headlineLine1: 'Transformer',
      headlineLine2: 'vos idées en',
      headlineLine3: 'expériences.',
      signature: 'Turning Ideas Into Experiences.',
      clientPitch:
        'KAIROS STUDIO accompagne les marques, entreprises et créateurs avec une exécution complète : design graphique, films publicitaires, campagnes digitales, solutions TIC et sites web sur mesure.',
      ctaPrimary: 'Démarrer un projet',
      ctaSecondary: 'Voir les réalisations',
      scrollHint: 'Défiler pour explorer',
      showreelLabel: 'Aperçu studio',
      monogramCaption: 'Déplacez le curseur · Emblème JK',
    },
    manifesto: {
      label: '01 · Du signal brut à l’expérience',
      statement:
        'Une idée seule reste invisible. Nous la sculptons en image, en film, en interface et en système numérique pour qu’elle capte l’attention dès la première seconde.',
      subtext:
        'Un même studio pour concevoir l’identité visuelle, produire la vidéo, structurer la présence digitale et développer le site web — sans perte de cohérence entre les disciplines.',
      steps: [
        {
          code: '01 / SIGNAL',
          title: 'Clarifier l’intention',
          detail: 'Comprendre votre audience, votre message clé et le support exact où votre marque doit marquer les esprits.',
        },
        {
          code: '02 / FORME',
          title: 'Façonner la matière',
          detail: 'Composition graphique, étalonnage vidéo, motion design et architecture d’interface conçus sur mesure.',
        },
        {
          code: '03 / EXPÉRIENCE',
          title: 'Déployer avec impact',
          detail: 'Livrables rapides, optimisés mobile et grand écran, prêts à convaincre vos clients dès la mise en ligne.',
        },
      ],
    },
    services: {
      label: '02 · Cinq disciplines intégrées',
      title: 'Ce que nous réalisons pour vos projets',
      subtitle:
        'Survolez ou sélectionnez une expertise pour découvrir son univers visuel et accéder aux réalisations associées.',
      exploreCategory: 'Filtrer les réalisations',
      hoverHint: 'Survolez une ligne pour révéler la scène',
      items: [
        {
          id: 'graphic-design',
          index: '01',
          title: 'Design graphique',
          tagline: 'Identités de marque, affiches & systèmes visuels',
          description:
            'Création de chartes graphiques, logotypes, packagings et affiches haute définition pensés pour installer une présence visuelle immédiatement mémorable.',
          deliverables: ['Identité & logotype', 'Affiches print & digitales', 'Manuels de marque', 'Photomontage HD'],
          previewAssetId: 'dc2026-instagram',
          ambientColor: '#FF5A3C',
        },
        {
          id: 'audiovisual',
          index: '02',
          title: 'Production audiovisuelle',
          tagline: 'Films publicitaires, montage cinéma & motion design',
          description:
            'Montage publicitaire dynamique, étalonnage colorimétrique, habillages HUD en motion graphics et mixage sonore calibrés pour le web, les réseaux et la diffusion HD.',
          deliverables: ['Spots publicitaires', 'Montage & étalonnage', 'Motion graphics', 'Formats multi-écrans'],
          previewAssetId: 'pub-nexora-poster',
          ambientColor: '#5B2EFF',
        },
        {
          id: 'digital-communication',
          index: '03',
          title: 'Communication digitale',
          tagline: 'Campagnes visuelles conçues pour arrêter le scroll',
          description:
            'Déclinaisons sociales haute conversion (formats 9:16 Statut WhatsApp, carrés 1:1, visuels produits) respectant strictement les marges mobiles et la lisibilité instantanée.',
          deliverables: ['Campagnes produits', 'Statuts WhatsApp 9:16', 'Visuels Feed 1:1 & 4:5', 'Direction créative sociale'],
          previewAssetId: 'louange-carre',
          ambientColor: '#E6007E',
        },
        {
          id: 'digital-solutions',
          index: '04',
          title: 'Solutions numériques / TIC',
          tagline: 'Outils pragmatiques, automatisation & architecture',
          description:
            'Mise en place d’outils numériques sur mesure, automatisation de processus créatifs ou métiers, intégrations cloud et conseil TIC pour accélérer vos opérations.',
          deliverables: ['Automatisation de flux', 'Intégrations cloud & bases', 'Outils internes', 'Conseil numérique'],
          previewAssetId: 'tpl-solution-global',
          ambientColor: '#00A884',
        },
        {
          id: 'web-creation',
          index: '05',
          title: 'Création de sites web',
          tagline: 'Vitrines interactives, portfolios & plateformes rapides',
          description:
            'Conception UI/UX et développement front-end de sites web modernes, animés, rapides sur mobile, optimisés pour le référencement naturel et simples à administrer.',
          deliverables: ['Sites vitrines sur mesure', 'Expériences animées', 'SEO technique & vitesse', 'Administration privée'],
          previewAssetId: 'tpl-ecommerce-session',
          ambientColor: '#FF6B00',
        },
      ],
    },
    categories: {
      all: 'Tout voir',
      'graphic-design': 'Design graphique',
      audiovisual: 'Production audiovisuelle',
      'digital-communication': 'Communication digitale',
      'digital-solutions': 'Solutions numériques / TIC',
      'web-creation': 'Création de sites web',
    },
    works: {
      label: '03 · Sélection & Table lumineuse',
      title: 'Réalisations',
      subtitle:
        'Parcourez les créations en défilement horizontal, explorez la liste interactive ou glissez librement sur le canevas du studio.',
      modeGallery: 'Galerie',
      modeList: 'Index',
      modeExplore: 'Explorer',
      pinnedHint: 'Défilement horizontal guidé · Faites défiler pour traverser les projets',
      dragHint: 'Maintenez et glissez le canevas librement · Cliquez une pièce pour l’ouvrir',
      resetCanvas: 'Recentrer',
      viewProject: 'Voir l’étude de cas',
      publishedCount: 'pièces publiées',
      demoBadge: 'Démo',
      videoBadge: 'Vidéo',
      visualBadge: 'Visuel',
      emptyCategoryTitle: 'Aucune pièce dans cette discipline',
      emptyCategoryText:
        'Afficher toutes les réalisations ou discuter directement de votre projet avec le studio.',
      viewAll: 'Tout afficher',
    },
    founder: {
      label: '04 · Le Fondateur',
      name: 'Joseph Kouamé',
      role: 'Fondateur & Directeur créatif',
      headline: 'Sensibilité visuelle et exécution technique réunies dans un seul regard.',
      bio1:
        'À la tête de KAIROS STUDIO, Joseph Kouamé réunit direction artistique, production audiovisuelle et développement numérique au sein d’une même démarche exigeante.',
      bio2:
        'Du concept graphique initial jusqu’au montage final ou à la mise en ligne d’une interface web, chaque projet est piloté en direct, sans intermédiaire, avec une attention constante à la clarté, au rythme et à la finition.',
      pillars: [
        { code: 'JK // 01', label: 'Signature', value: 'Turning Ideas Into Experiences.' },
        { code: 'JK // 02', label: 'Spectre', value: 'Graphisme, Vidéo, Digital, TIC & Web' },
        { code: 'JK // 03', label: 'Engagement', value: 'Interlocuteur direct du brief à la livraison' },
      ],
      skillsTitle: 'Chaîne de production & outils maîtrisés',
      skillsGroups: [
        {
          index: '01',
          title: 'Image & Direction artistique',
          items: [
            'Direction visuelle, affiches HD & systèmes de marque',
            'Photomontage & retouche avancée (Adobe Photoshop)',
            'Création vectorielle & logotypes (Adobe Illustrator)',
            'Déclinaisons print & réseaux sociaux calibrées',
          ],
        },
        {
          index: '02',
          title: 'Film, Montage & Motion',
          items: [
            'Montage publicitaire & narratif (DaVinci Resolve)',
            'Étalonnage colorimétrique cinématographique',
            'Habillages d’écran & motion graphics',
            'Compression web multi-supports (MP4 / WebM)',
          ],
        },
        {
          index: '03',
          title: 'Web, Shaders & Solutions TIC',
          items: [
            'Interfaces responsives & design systems',
            'Développement front-end (React, TypeScript, Vite)',
            'Chorégraphie GSAP, ScrollTrigger & WebGL GLSL',
            'Bases sécurisées Supabase, RLS & automatisation',
          ],
        },
      ],
      contactCta: 'Parler directement à Joseph Kouamé',
    },
    marquee: {
      row1: [
        'DESIGN GRAPHIQUE',
        'PRODUCTION AUDIOVISUELLE',
        'COMMUNICATION DIGITALE',
        'SOLUTIONS NUMÉRIQUES / TIC',
        'CRÉATION DE SITES WEB',
      ],
      row2: [
        'TURNING IDEAS INTO EXPERIENCES',
        'KAIROS STUDIO',
        'DIRECTION ARTISTIQUE',
        'MOTION & WEB',
        'JOSEPH KOUAMÉ',
      ],
    },
    contact: {
      label: '05 · Parler de votre projet',
      title: 'Donnons vie à votre prochaine expérience.',
      subtitle:
        'Un visuel marquant, un film publicitaire, une campagne digitale ou un site web sur mesure ? Décrivez votre besoin et obtenez une réponse directe.',
      directHeading: 'Contact direct sans intermédiaire',
      emailLabel: 'E-mail direct',
      whatsappLabel: 'WhatsApp direct',
      whatsappCta: 'Discuter sur WhatsApp',
      floatingWhatsapp: 'WhatsApp',
      availabilityNote: 'Réponse directe par Joseph Kouamé · Français & English',
      form: {
        name: 'Nom complet',
        namePlaceholder: 'Votre nom ou entreprise',
        email: 'Adresse e-mail',
        emailPlaceholder: 'vous@entreprise.com',
        phone: 'Téléphone / WhatsApp (optionnel)',
        phonePlaceholder: '+225 ...',
        service: 'Discipline souhaitée',
        servicePlaceholder: 'Choisir une discipline',
        message: 'Votre projet',
        messagePlaceholder: 'Parlez-moi de votre objectif, de votre support et de vos attentes...',
        submit: 'Envoyer ma demande',
        submitting: 'Envoi en cours...',
        successTitle: 'Message transmis avec succès',
        successBody: 'Merci pour votre prise de contact. Joseph Kouamé vous répondra rapidement.',
        fallbackTitle: 'Poursuivre directement sur WhatsApp',
        fallbackBody:
          'L’enregistrement direct n’a pas pu aboutir pour le moment. Votre message est prêt : cliquez ci-dessous pour l’envoyer immédiatement sur WhatsApp.',
        fallbackButton: 'Envoyer sur WhatsApp',
        validationName: 'Veuillez saisir votre nom (au moins 2 caractères).',
        validationEmail: 'Veuillez saisir une adresse e-mail valide.',
        validationMessage: 'Veuillez décrire votre demande en au moins 10 caractères.',
        rateLimitError: 'Un message vient déjà d’être envoyé. Patientez quelques instants avant un nouvel envoi.',
      },
    },
    projectDetail: {
      backToWorks: 'Toutes les réalisations',
      caseStudyLabel: 'Étude de cas',
      category: 'Discipline',
      client: 'Client',
      year: 'Année',
      role: 'Rôle',
      deliverables: 'Livrables',
      visitLink: 'Ouvrir le lien',
      contextHeading: 'Présentation',
      executionHeading: 'Ce qui a été réalisé',
      galleryHeading: 'Planches & détails',
      videoHeading: 'Lecture vidéo',
      demoNotice:
        'Séquence de démonstration temporaire libre de droits (Pexels), présentée uniquement pour illustrer le lecteur vidéo du portfolio.',
      nextProjectLabel: 'Projet suivant',
      discussSimilar: 'Un projet similaire en tête ?',
      fullscreenHint: 'Cliquer pour agrandir',
      closeLightbox: 'Fermer l’aperçu plein écran',
    },
    notFound: {
      code: 'ERR // 404',
      title: 'Signal hors cadre.',
      subtitle: 'La page demandée n’existe pas ou a été déplacée. Revenez à l’accueil ou explorez la galerie du studio.',
      backHome: 'Retour à l’accueil',
      viewWorks: 'Voir les réalisations',
    },
    footer: {
      ctaEyebrow: 'Prêt à lancer votre projet ?',
      ctaTitle: 'Transformons votre idée en expérience mémorable.',
      ctaButton: 'Démarrer une conversation',
      signature: 'Turning Ideas Into Experiences.',
      navigation: 'Navigation',
      directContact: 'Contact direct',
      legalNotice: 'Mentions légales',
      privacyPolicy: 'Confidentialité',
      rights: 'KAIROS STUDIO — Joseph Kouamé. Tous droits réservés.',
      backToTop: 'Haut',
    },
    legal: {
      backHome: 'Retour à l’accueil',
      legalNoticeTitle: 'Mentions légales',
      legalNoticeIntro:
        'Informations générales relatives à l’édition et à l’hébergement du portfolio KAIROS STUDIO.',
      legalSections: [
        {
          heading: '1. Éditeur',
          paragraphs: [
            'Le présent site est édité par KAIROS STUDIO, représenté par son fondateur et directeur créatif Joseph Kouamé.',
            'E-mail : kuamejosephyakro452@gmail.com — WhatsApp : +225 07 89 50 17 05.',
          ],
        },
        {
          heading: '2. Hébergement & Infrastructure',
          paragraphs: [
            'Le site vitrine statique est hébergé via GitHub Pages (GitHub, Inc.). Le formulaire de contact et l’administration privée reposent sur Supabase.',
          ],
        },
        {
          heading: '3. Propriété intellectuelle',
          paragraphs: [
            'L’identité KAIROS STUDIO, le monogramme JK, le code, les textes et les créations originales présentées demeurent la propriété de leur auteur. Les éventuelles séquences de démonstration temporaires proviennent de banques libres de droits identifiées.',
          ],
        },
        {
          heading: '4. Responsabilité',
          paragraphs: [
            'KAIROS STUDIO actualise régulièrement les contenus de ce portfolio et peut les modifier à tout moment sans préavis.',
          ],
        },
      ],
      privacyTitle: 'Politique de confidentialité',
      privacyIntro:
        'KAIROS STUDIO collecte uniquement les informations strictement nécessaires pour répondre à vos demandes.',
      privacySections: [
        {
          heading: '1. Données collectées',
          paragraphs: [
            'Aucun traceur publicitaire ni inscription publique n’est utilisé. Seules les informations soumises volontairement dans le formulaire de contact (nom, e-mail, téléphone optionnel, discipline, message) sont enregistrées.',
          ],
        },
        {
          heading: '2. Usage et conservation',
          paragraphs: [
            'Vos données servent uniquement à répondre à votre demande de projet. Elles ne sont ni vendues ni transmises à des tiers.',
          ],
        },
        {
          heading: '3. Préférences locales',
          paragraphs: [
            'Votre choix de langue (FR/EN) est enregistré localement dans votre navigateur (localStorage).',
          ],
        },
        {
          heading: '4. Contact & suppression',
          paragraphs: [
            'Pour toute demande d’accès ou de suppression de vos messages, écrivez à kuamejosephyakro452@gmail.com.',
          ],
        },
      ],
    },
  },

  en: {
    meta: {
      homeTitle: 'KAIROS STUDIO — Turning Ideas Into Experiences | Joseph Kouamé',
      homeDescription:
        'Creative and digital studio led by Joseph Kouamé. Graphic design, audiovisual production, digital communication, ICT solutions, and bespoke web creation.',
      projectTitleSuffix: 'KAIROS STUDIO',
      legalTitle: 'Legal Notice — KAIROS STUDIO',
      privacyTitle: 'Privacy Policy — KAIROS STUDIO',
      notFoundTitle: 'Page Not Found — KAIROS STUDIO',
    },
    nav: {
      services: 'Capabilities',
      works: 'Selected Works',
      explorer: 'Explore',
      founder: 'Studio & Founder',
      contact: 'Contact',
      menu: 'Menu',
      close: 'Close',
      skipToContent: 'Skip to main content',
      directAccess: 'Direct inquiry',
    },
    preloader: {
      caption: 'Turning Ideas Into Experiences.',
    },
    hero: {
      badge: 'Creative & Digital Studio · Joseph Kouamé',
      headlineLine1: 'Turning bold',
      headlineLine2: 'ideas into',
      headlineLine3: 'experiences.',
      signature: 'Turning Ideas Into Experiences.',
      clientPitch:
        'KAIROS STUDIO partners with ambitious brands, organizations, and founders across graphic design, commercial film, digital campaigns, ICT solutions, and bespoke websites.',
      ctaPrimary: 'Start a project',
      ctaSecondary: 'Explore works',
      scrollHint: 'Scroll to explore',
      showreelLabel: 'Studio reel',
      monogramCaption: 'Move cursor · JK Emblem',
    },
    manifesto: {
      label: '01 · From Raw Signal to Living Experience',
      statement:
        'An idea alone stays invisible. We shape it into bold visuals, commercial film, fluid websites, and digital systems built to command attention from the very first second.',
      subtext:
        'One unified creative studio handling visual identity, video post-production, digital campaigns, and web engineering — keeping every touchpoint unmistakably coherent.',
      steps: [
        {
          code: '01 / SIGNAL',
          title: 'Sharpen the message',
          detail: 'Define your audience, focal point, and exact medium so every creative decision serves business impact.',
        },
        {
          code: '02 / CRAFT',
          title: 'Sculpt the medium',
          detail: 'High-impact typography, cinematic grading, motion graphics, and responsive web architecture built from scratch.',
        },
        {
          code: '03 / EXPERIENCE',
          title: 'Launch with momentum',
          detail: 'Fast, mobile-ready deliverables engineered to earn trust and convert clients on every screen.',
        },
      ],
    },
    services: {
      label: '02 · Five Integrated Practices',
      title: 'What we craft for your brand',
      subtitle:
        'Hover or select any capability to shift the visual atmosphere and jump directly to related works.',
      exploreCategory: 'Filter related works',
      hoverHint: 'Hover a row to preview its visual world',
      items: [
        {
          id: 'graphic-design',
          index: '01',
          title: 'Graphic Design',
          tagline: 'Brand identities, posters & distinctive visual systems',
          description:
            'Brand guidelines, logotypes, packaging direction, and high-resolution event posters engineered to establish instant visual authority.',
          deliverables: ['Visual identity & logos', 'Print & digital posters', 'Brand manuals', 'High-res compositing'],
          previewAssetId: 'dc2026-instagram',
          ambientColor: '#FF5A3C',
        },
        {
          id: 'audiovisual',
          index: '02',
          title: 'Audiovisual Production',
          tagline: 'Commercial films, cinema editing & motion graphics',
          description:
            'Dynamic commercial editing, cinematic color grading, custom HUD motion overlays, and crisp audio mixing calibrated for web and HD broadcast.',
          deliverables: ['Commercial spots', 'Editing & grading', 'Motion graphics', 'Multi-screen masters'],
          previewAssetId: 'pub-nexora-poster',
          ambientColor: '#5B2EFF',
        },
        {
          id: 'digital-communication',
          index: '03',
          title: 'Digital Communication',
          tagline: 'Scroll-stopping visual campaigns for mobile feeds',
          description:
            'High-impact social assets tailored for 9:16 mobile status, 1:1 product campaigns, and multi-platform launches honoring interface safe zones.',
          deliverables: ['Product campaigns', '9:16 WhatsApp Status', '1:1 & 4:5 Feed kits', 'Social art direction'],
          previewAssetId: 'louange-carre',
          ambientColor: '#E6007E',
        },
        {
          id: 'digital-solutions',
          index: '04',
          title: 'Digital Solutions / ICT',
          tagline: 'Pragmatic tools, automation & cloud systems',
          description:
            'Custom digital utilities, creative and operational workflow automation, cloud integrations, and practical ICT advisory to modernize teams.',
          deliverables: ['Workflow automation', 'Cloud & DB integration', 'Custom tooling', 'ICT advisory'],
          previewAssetId: 'tpl-solution-global',
          ambientColor: '#00A884',
        },
        {
          id: 'web-creation',
          index: '05',
          title: 'Web Creation',
          tagline: 'Interactive showcases, portfolios & fast web platforms',
          description:
            'Bespoke UI/UX design and front-end engineering for expressive, mobile-first websites combining fluid motion, technical SEO, and private administration.',
          deliverables: ['Bespoke showcase sites', 'Fluid web animation', 'Technical SEO & speed', 'Private admin CMS'],
          previewAssetId: 'tpl-ecommerce-session',
          ambientColor: '#FF6B00',
        },
      ],
    },
    categories: {
      all: 'All works',
      'graphic-design': 'Graphic Design',
      audiovisual: 'Audiovisual Production',
      'digital-communication': 'Digital Communication',
      'digital-solutions': 'Digital Solutions / ICT',
      'web-creation': 'Web Creation',
    },
    works: {
      label: '03 · Selected Works & Light Table',
      title: 'Selected Works',
      subtitle:
        'Glide through the pinned horizontal gallery, browse the hover-trail index, or drag freely across the studio canvas.',
      modeGallery: 'Gallery',
      modeList: 'Index',
      modeExplore: 'Explore',
      pinnedHint: 'Guided horizontal gallery · Scroll to move across projects',
      dragHint: 'Click and drag freely across the canvas · Open any piece',
      resetCanvas: 'Recenter',
      viewProject: 'Open case study',
      publishedCount: 'published pieces',
      demoBadge: 'Demo',
      videoBadge: 'Video',
      visualBadge: 'Visual',
      emptyCategoryTitle: 'No works in this discipline yet',
      emptyCategoryText: 'Browse all published pieces or reach out to start your project with the studio.',
      viewAll: 'View all works',
    },
    founder: {
      label: '04 · The Founder',
      name: 'Joseph Kouamé',
      role: 'Founder & Creative Director',
      headline: 'Visual sensibility and technical precision united under one roof.',
      bio1:
        'Leading KAIROS STUDIO, Joseph Kouamé bridges art direction, audiovisual post-production, and modern web engineering within one focused practice.',
      bio2:
        'From the first graphic concept to the final film cut or website launch, every project is led directly — no layers, no friction, total dedication to clarity and craft.',
      pillars: [
        { code: 'JK // 01', label: 'Signature', value: 'Turning Ideas Into Experiences.' },
        { code: 'JK // 02', label: 'Range', value: 'Design, Film, Digital, ICT & Web' },
        { code: 'JK // 03', label: 'Commitment', value: 'Direct collaboration from brief to launch' },
      ],
      skillsTitle: 'Production stack & core craft',
      skillsGroups: [
        {
          index: '01',
          title: 'Visuals & Art Direction',
          items: [
            'Brand direction, HD posters & visual systems',
            'Retouching & multi-layer compositing (Adobe Photoshop)',
            'Vector design & logotypes (Adobe Illustrator)',
            'Print & mobile-native social adaptations',
          ],
        },
        {
          index: '02',
          title: 'Film, Editing & Motion',
          items: [
            'Commercial & narrative editing (DaVinci Resolve)',
            'Cinematic color grading & visual cohesion',
            'Screen overlays & kinetic motion graphics',
            'Multi-platform web video optimization (MP4 / WebM)',
          ],
        },
        {
          index: '03',
          title: 'Web, Shaders & ICT Systems',
          items: [
            'Responsive interfaces & token design systems',
            'Front-end engineering (React, TypeScript, Vite)',
            'GSAP choreography, ScrollTrigger & WebGL GLSL',
            'Secure Supabase databases, RLS & automation',
          ],
        },
      ],
      contactCta: 'Speak directly with Joseph Kouamé',
    },
    marquee: {
      row1: [
        'GRAPHIC DESIGN',
        'AUDIOVISUAL PRODUCTION',
        'DIGITAL COMMUNICATION',
        'DIGITAL SOLUTIONS / ICT',
        'WEB CREATION',
      ],
      row2: [
        'TURNING IDEAS INTO EXPERIENCES',
        'KAIROS STUDIO',
        'ART DIRECTION',
        'MOTION & WEB',
        'JOSEPH KOUAMÉ',
      ],
    },
    contact: {
      label: '05 · Start a Project',
      title: 'Let’s build your next standout experience.',
      subtitle:
        'Looking for a bold visual identity, a commercial film, a digital campaign, or a bespoke website? Share your brief for a direct response.',
      directHeading: 'Direct channels, zero intermediaries',
      emailLabel: 'Direct email',
      whatsappLabel: 'Direct WhatsApp',
      whatsappCta: 'Message on WhatsApp',
      floatingWhatsapp: 'WhatsApp',
      availabilityNote: 'Direct conversation with Joseph Kouamé · Français & English',
      form: {
        name: 'Full name',
        namePlaceholder: 'Your name or company',
        email: 'Email address',
        emailPlaceholder: 'you@company.com',
        phone: 'Phone / WhatsApp (optional)',
        phonePlaceholder: '+225 ...',
        service: 'Discipline',
        servicePlaceholder: 'Select a discipline',
        message: 'Project brief',
        messagePlaceholder: 'Share your goal, expected format, and creative direction...',
        submit: 'Send inquiry',
        submitting: 'Sending...',
        successTitle: 'Message sent successfully',
        successBody: 'Thank you for reaching out. Joseph Kouamé will reply promptly.',
        fallbackTitle: 'Continue directly on WhatsApp',
        fallbackBody:
          'Direct storage is temporarily unavailable. Your brief is pre-filled below so you can reach the studio immediately on WhatsApp.',
        fallbackButton: 'Send via WhatsApp',
        validationName: 'Please enter your name (at least 2 characters).',
        validationEmail: 'Please enter a valid email address.',
        validationMessage: 'Please describe your inquiry in at least 10 characters.',
        rateLimitError: 'A message was just sent. Please wait a moment before sending another.',
      },
    },
    projectDetail: {
      backToWorks: 'All works',
      caseStudyLabel: 'Case Study',
      category: 'Discipline',
      client: 'Client',
      year: 'Year',
      role: 'Role',
      deliverables: 'Deliverables',
      visitLink: 'Open link',
      contextHeading: 'Overview',
      executionHeading: 'What was crafted',
      galleryHeading: 'Visual plates & frames',
      videoHeading: 'Film screening',
      demoNotice:
        'Temporary royalty-free demonstration clip (Pexels), included solely to showcase the portfolio video experience.',
      nextProjectLabel: 'Next project',
      discussSimilar: 'Have a similar project in mind?',
      fullscreenHint: 'Click to expand',
      closeLightbox: 'Close fullscreen view',
    },
    notFound: {
      code: 'ERR // 404',
      title: 'Signal out of frame.',
      subtitle: 'The page you requested does not exist or has moved. Return home or explore the studio gallery.',
      backHome: 'Back to home',
      viewWorks: 'Explore works',
    },
    footer: {
      ctaEyebrow: 'Ready to launch your next project?',
      ctaTitle: 'Let’s turn your idea into a lasting experience.',
      ctaButton: 'Start a conversation',
      signature: 'Turning Ideas Into Experiences.',
      navigation: 'Navigation',
      directContact: 'Direct contact',
      legalNotice: 'Legal Notice',
      privacyPolicy: 'Privacy Policy',
      rights: 'KAIROS STUDIO — Joseph Kouamé. All rights reserved.',
      backToTop: 'Top',
    },
    legal: {
      backHome: 'Back to home',
      legalNoticeTitle: 'Legal Notice',
      legalNoticeIntro: 'Publishing and hosting information for the official KAIROS STUDIO portfolio.',
      legalSections: [
        {
          heading: '1. Publisher',
          paragraphs: [
            'This website is published by KAIROS STUDIO, represented by its founder and creative director Joseph Kouamé.',
            'Email: kuamejosephyakro452@gmail.com — WhatsApp: +225 07 89 50 17 05.',
          ],
        },
        {
          heading: '2. Hosting & Infrastructure',
          paragraphs: [
            'The static portfolio is hosted via GitHub Pages (GitHub, Inc.). Contact inquiries and private administration run on Supabase.',
          ],
        },
        {
          heading: '3. Intellectual Property',
          paragraphs: [
            'The KAIROS STUDIO brand, JK monogram, code, copy, and original studio works remain the property of their author. Temporary demonstration clips are clearly flagged and sourced under royalty-free licenses.',
          ],
        },
        {
          heading: '4. Liability',
          paragraphs: [
            'KAIROS STUDIO maintains this portfolio regularly and may update published works at any time.',
          ],
        },
      ],
      privacyTitle: 'Privacy Policy',
      privacyIntro: 'KAIROS STUDIO collects only the strict minimum required to answer your project inquiries.',
      privacySections: [
        {
          heading: '1. Data Collected',
          paragraphs: [
            'No advertising trackers or public accounts are used. Only information voluntarily submitted via the contact form (name, email, optional phone, discipline, message) is stored.',
          ],
        },
        {
          heading: '2. Use & Retention',
          paragraphs: [
            'Your contact details are used solely to respond to your inquiry and are never sold or shared with third parties.',
          ],
        },
        {
          heading: '3. Local Preferences',
          paragraphs: [
            'Your language preference (FR/EN) is stored locally in your browser (localStorage).',
          ],
        },
        {
          heading: '4. Contact & Deletion',
          paragraphs: [
            'To request access or deletion of your messages, email kuamejosephyakro452@gmail.com.',
          ],
        },
      ],
    },
  },
};
