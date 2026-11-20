import type { Locale, ProjectCategory } from '@/types/portfolio';

export interface ServiceItem {
  id: ProjectCategory;
  index: string;
  title: string;
  tagline: string;
  description: string;
  disciplines: string[];
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
  };
  nav: {
    services: string;
    works: string;
    founder: string;
    skills: string;
    contact: string;
    themeEditorial: string;
    themeNocturne: string;
    skipToContent: string;
    openMenu: string;
    closeMenu: string;
  };
  preloader: {
    caption: string;
  };
  hero: {
    eyebrow: string;
    headlineLine1: string;
    headlineLine2: string;
    signature: string;
    kairosNote: string;
    ctaPrimary: string;
    ctaSecondary: string;
    scrollHint: string;
    showreelLabel: string;
  };
  manifesto: {
    label: string;
    quote: string;
    body: string;
    pillars: { title: string; text: string }[];
  };
  services: {
    label: string;
    title: string;
    subtitle: string;
    items: ServiceItem[];
    exploreCategory: string;
  };
  categories: Record<ProjectCategory | 'all', string>;
  works: {
    label: string;
    title: string;
    subtitle: string;
    horizontalHint: string;
    viewProject: string;
    allProjectsCount: string;
    emptyCategoryTitle: string;
    emptyCategoryText: string;
    viewAll: string;
    videoBadge: string;
    visualBadge: string;
  };
  founder: {
    label: string;
    name: string;
    role: string;
    headline: string;
    bio1: string;
    bio2: string;
    principles: { label: string; value: string }[];
    contactFounder: string;
  };
  skills: {
    label: string;
    title: string;
    subtitle: string;
    groups: SkillGroup[];
  };
  contact: {
    label: string;
    title: string;
    subtitle: string;
    directHeading: string;
    emailLabel: string;
    whatsappLabel: string;
    whatsappCta: string;
    responseNote: string;
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
    category: string;
    client: string;
    year: string;
    role: string;
    deliverables: string;
    visitLink: string;
    galleryHeading: string;
    videoHeading: string;
    nextProject: string;
    prevProject: string;
    discussSimilar: string;
    notFoundTitle: string;
    notFoundText: string;
    fullscreenHint: string;
    closeLightbox: string;
  };
  footer: {
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
        'Studio créatif et numérique polyvalent fondé par Joseph Kouamé : design graphique, production audiovisuelle, communication digitale, solutions numériques / TIC et création de sites web.',
      projectTitleSuffix: 'KAIROS STUDIO',
      legalTitle: 'Mentions légales — KAIROS STUDIO',
      privacyTitle: 'Politique de confidentialité — KAIROS STUDIO',
    },
    nav: {
      services: 'Domaines',
      works: 'Réalisations',
      founder: 'Fondateur',
      skills: 'Savoir-faire',
      contact: 'Contact',
      themeEditorial: 'Clair',
      themeNocturne: 'Sombre',
      skipToContent: 'Aller au contenu principal',
      openMenu: 'Ouvrir le menu',
      closeMenu: 'Fermer le menu',
    },
    preloader: {
      caption: 'L’instant juste — Kairos Studio',
    },
    hero: {
      eyebrow: 'Studio créatif & numérique · Joseph Kouamé',
      headlineLine1: 'Façonner l’instant,',
      headlineLine2: 'élever l’expérience.',
      signature: 'Turning Ideas Into Experiences.',
      kairosNote:
        'En grec ancien, Kairos désigne le moment opportun — cet instant précis où une vision trouve sa forme juste, son rythme et son impact.',
      ctaPrimary: 'Explorer les réalisations',
      ctaSecondary: 'Initier un projet',
      scrollHint: 'Défiler',
      showreelLabel: 'Extrait visuel du studio',
    },
    manifesto: {
      label: 'Philosophie · Kairos',
      quote:
        'Une création juste ne cherche pas le bruit : elle arrive au bon moment, avec la bonne cadence et une clarté mémorable.',
      body:
        'KAIROS STUDIO réunit direction artistique, production audiovisuelle, stratégie digitale et ingénierie web au sein d’une même exigence. Chaque projet est pensé comme une expérience cohérente — du premier trait graphique jusqu’à sa mise en ligne.',
      pillars: [
        {
          title: 'Justesse visuelle',
          text: 'Hiérarchie typographique, maîtrise des contrastes et sens du détail sur chaque support.',
        },
        {
          title: 'Narration en mouvement',
          text: 'Rythme cinématographique, montage précis et habillages conçus pour retenir l’attention.',
        },
        {
          title: 'Maîtrise technique',
          text: 'Interfaces rapides, accessibles et pensées mobile d’abord, sans compromis sur l’esthétique.',
        },
      ],
    },
    services: {
      label: '01 — Domaines d’intervention',
      title: 'Cinq disciplines, une même direction.',
      subtitle:
        'Du visuel imprimé au film publicitaire, de la présence digitale aux solutions web et TIC, le studio accompagne les idées de bout en bout.',
      exploreCategory: 'Voir les réalisations',
      items: [
        {
          id: 'graphic-design',
          index: '01',
          title: 'Design graphique',
          tagline: 'Identités, affiches & systèmes visuels de caractère',
          description:
            'Conception d’affiches événementielles, identités visuelles, logotypes et compositions print ou numériques portés par une direction artistique rigoureuse.',
          disciplines: ['Direction artistique', 'Affiches & print HD', 'Identité & logotype', 'Photomontage'],
        },
        {
          id: 'audiovisual',
          index: '02',
          title: 'Production audiovisuelle',
          tagline: 'Films publicitaires, montage & habillage motion',
          description:
            'Réalisation et post-production de spots publicitaires, montages rythmés, étalonnage cinématographique, design sonore et motion graphics calibrés pour chaque écran.',
          disciplines: ['Spots publicitaires', 'Montage & étalonnage', 'Motion graphics', 'Formats multi-écrans'],
        },
        {
          id: 'digital-communication',
          index: '03',
          title: 'Communication digitale',
          tagline: 'Visuels éditoriaux & formats pensés pour l’engagement',
          description:
            'Création de campagnes visuelles adaptées aux usages mobiles (statuts, feeds, formats courts), en respectant les zones de sécurité, la lisibilité immédiate et la cohérence de marque.',
          disciplines: ['Campagnes visuelles', 'Formats mobiles 9:16 & 1:1', 'Déclinaisons éditoriales', 'Stratégie de contenu'],
        },
        {
          id: 'digital-solutions',
          index: '04',
          title: 'Solutions numériques / TIC',
          tagline: 'Outils sur mesure, automatisation & accompagnement',
          description:
            'Conception d’outils numériques pragmatiques, automatisation de flux de travail, intégration de services cloud et conseil technique pour moderniser les opérations.',
          disciplines: ['Automatisation de flux', 'Intégration d’outils', 'Architecture numérique', 'Conseil TIC'],
        },
        {
          id: 'web-creation',
          index: '05',
          title: 'Création de sites web',
          tagline: 'Vitrines éditoriales & expériences web rapides',
          description:
            'Design d’interface et développement front-end de sites vitrines, portfolios et plateformes administrables alliant esthétique soignée, performance et référencement naturel.',
          disciplines: ['Sites vitrines sur mesure', 'UI / UX éditorial', 'Performance & SEO', 'Espaces administrables'],
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
      label: '02 — Sélection choisie',
      title: 'Réalisations',
      subtitle:
        'Une sélection de productions originales réalisées au studio — films, affiches et campagnes visuelles.',
      horizontalHint: 'Défilement horizontal · Faites glisser ou utilisez les filtres',
      viewProject: 'Découvrir le projet',
      allProjectsCount: 'projets publiés',
      emptyCategoryTitle: 'Nouvelles pièces en préparation',
      emptyCategoryText:
        'Les réalisations de cette discipline seront publiées ici très prochainement. Vous pouvez consulter l’ensemble de la galerie ou discuter directement de votre projet.',
      viewAll: 'Afficher toutes les réalisations',
      videoBadge: 'Film & Motion',
      visualBadge: 'Direction visuelle',
    },
    founder: {
      label: '03 — Direction créative',
      name: 'Joseph Kouamé',
      role: 'Fondateur & Directeur créatif',
      headline: 'Relier l’œil du créatif et la rigueur du numérique.',
      bio1:
        'À l’origine de KAIROS STUDIO, une conviction simple : les meilleures expériences naissent lorsque la sensibilité artistique dialogue directement avec la maîtrise technique.',
      bio2:
        'De la composition d’une affiche au montage d’un film publicitaire, jusqu’à l’architecture d’un site web ou d’une solution numérique, Joseph Kouamé conduit chaque projet avec la même attention au rythme, à la clarté et à la finition.',
      principles: [
        { label: 'Signature', value: 'Turning Ideas Into Experiences.' },
        { label: 'Approche', value: 'Polyvalence maîtrisée & exécution directe' },
        { label: 'Exigence', value: 'Clarté éditoriale, rapidité & finition' },
      ],
      contactFounder: 'Échanger avec Joseph Kouamé',
    },
    skills: {
      label: '04 — Savoir-faire & outils',
      title: 'Architecture de compétences',
      subtitle:
        'Une chaîne de production complète réunissant création visuelle, post-production vidéo et développement web moderne.',
      groups: [
        {
          index: 'I',
          title: 'Direction artistique & Design',
          items: [
            'Composition éditoriale & affiches HD',
            'Identité visuelle & systèmes graphiques',
            'Retouche & photomontage (Adobe Photoshop)',
            'Création vectorielle (Adobe Illustrator)',
            'Déclinaisons print & réseaux sociaux',
          ],
        },
        {
          index: 'II',
          title: 'Audiovisuel & Mouvement',
          items: [
            'Montage publicitaire & narratif (DaVinci Resolve)',
            'Étalonnage colorimétrique cinéma',
            'Motion graphics & habillages d’écran',
            'Mixage voix-off, musique & sound design',
            'Optimisation vidéo multi-plateformes',
          ],
        },
        {
          index: 'III',
          title: 'Web, TIC & Numérique',
          items: [
            'Interfaces responsives & design systems',
            'Développement front-end (React, TypeScript, Vite)',
            'Animations web fluides (GSAP, WebGL léger)',
            'SEO technique, accessibilité & performance',
            'Bases de données sécurisées & automatisation',
          ],
        },
      ],
    },
    contact: {
      label: '05 — Prendre contact',
      title: 'C’est le bon moment pour donner forme à votre idée.',
      subtitle:
        'Parlez-moi de votre projet — affiche, film publicitaire, campagne digitale, site web ou solution numérique. Réponse directe et sans intermédiaire.',
      directHeading: 'Canaux directs',
      emailLabel: 'Courriel',
      whatsappLabel: 'WhatsApp direct',
      whatsappCta: 'Écrire sur WhatsApp',
      responseNote: 'Échange direct avec Joseph Kouamé · Français & English',
      form: {
        name: 'Nom complet',
        namePlaceholder: 'Votre nom ou organisation',
        email: 'Adresse e-mail',
        emailPlaceholder: 'vous@exemple.com',
        phone: 'Téléphone / WhatsApp (optionnel)',
        phonePlaceholder: '+225 ...',
        service: 'Domaine concerné',
        servicePlaceholder: 'Sélectionnez un domaine',
        message: 'Votre projet',
        messagePlaceholder: 'Décrivez vos objectifs, le support envisagé et vos attentes...',
        submit: 'Envoyer le message',
        submitting: 'Envoi en cours...',
        successTitle: 'Message transmis avec succès',
        successBody: 'Merci pour votre prise de contact. Joseph Kouamé vous répondra dans les meilleurs délais.',
        fallbackTitle: 'Connexion temporairement indisponible',
        fallbackBody:
          'L’enregistrement direct n’a pas abouti pour le moment. Pour ne rien perdre de votre demande, poursuivez instantanément sur WhatsApp avec votre message pré-rempli.',
        fallbackButton: 'Continuer sur WhatsApp',
        validationName: 'Veuillez saisir votre nom (au moins 2 caractères).',
        validationEmail: 'Veuillez saisir une adresse e-mail valide.',
        validationMessage: 'Veuillez décrire votre demande en au moins 10 caractères.',
        rateLimitError: 'Un message vient déjà d’être envoyé. Patientez quelques instants avant un nouvel envoi.',
      },
    },
    projectDetail: {
      backToWorks: 'Retour aux réalisations',
      category: 'Discipline',
      client: 'Commanditaire',
      year: 'Année',
      role: 'Rôle',
      deliverables: 'Livrables',
      visitLink: 'Consulter le projet',
      galleryHeading: 'Planches & visuels',
      videoHeading: 'Projection du film',
      nextProject: 'Projet suivant',
      prevProject: 'Projet précédent',
      discussSimilar: 'Discuter d’un projet similaire',
      notFoundTitle: 'Réalisation introuvable',
      notFoundText: 'Ce projet n’est pas disponible ou n’est pas encore publié.',
      fullscreenHint: 'Cliquer pour afficher en plein écran',
      closeLightbox: 'Fermer l’aperçu plein écran',
    },
    footer: {
      signature: 'Turning Ideas Into Experiences.',
      navigation: 'Navigation',
      directContact: 'Contact direct',
      legalNotice: 'Mentions légales',
      privacyPolicy: 'Confidentialité',
      rights: 'KAIROS STUDIO — Joseph Kouamé. Tous droits réservés.',
      backToTop: 'Haut de page',
    },
    legal: {
      backHome: 'Retour à l’accueil',
      legalNoticeTitle: 'Mentions légales',
      legalNoticeIntro:
        'Informations relatives à l’édition et à la mise en ligne du portfolio officiel de KAIROS STUDIO.',
      legalSections: [
        {
          heading: '1. Éditeur du site',
          paragraphs: [
            'Le présent site est édité par KAIROS STUDIO, représenté par son fondateur et directeur créatif Joseph Kouamé.',
            'Contact électronique : kuamejosephyakro452@gmail.com — WhatsApp : +225 07 89 50 17 05.',
          ],
        },
        {
          heading: '2. Hébergement',
          paragraphs: [
            'Le site public est hébergé via le service GitHub Pages (GitHub, Inc.). Les fonctionnalités de formulaire de contact et d’administration s’appuient sur l’infrastructure Supabase.',
          ],
        },
        {
          heading: '3. Propriété intellectuelle',
          paragraphs: [
            'Sauf mention contraire, l’ensemble des créations présentées (textes, compositions graphiques, vidéos, interfaces, monogramme JK et identité KAIROS STUDIO) demeure la propriété de son auteur. Toute reproduction ou utilisation sans autorisation préalable est interdite.',
          ],
        },
        {
          heading: '4. Responsabilité',
          paragraphs: [
            'KAIROS STUDIO veille à l’exactitude des contenus publiés sur ce portfolio et se réserve le droit de les actualiser à tout moment sans préavis.',
          ],
        },
      ],
      privacyTitle: 'Politique de confidentialité',
      privacyIntro:
        'KAIROS STUDIO accorde une importance particulière à la confidentialité et à la sobriété dans la collecte de données.',
      privacySections: [
        {
          heading: '1. Données collectées',
          paragraphs: [
            'Aucune inscription ni aucun traceur publicitaire n’est utilisé sur ce site. Les seules données personnelles transmises sont celles que vous renseignez volontairement dans le formulaire de contact (nom, adresse e-mail, téléphone optionnel, domaine souhaité et message).',
          ],
        },
        {
          heading: '2. Finalité et conservation',
          paragraphs: [
            'Les informations envoyées via le formulaire servent exclusivement à répondre à votre demande et à échanger autour de votre projet. Elles ne sont ni vendues, ni cédées à des tiers, et sont conservées uniquement le temps nécessaire au suivi de la conversation.',
          ],
        },
        {
          heading: '3. Stockage local (préférences)',
          paragraphs: [
            'Votre préférence de langue (français / anglais) et de thème visuel (clair / sombre) est enregistrée localement dans votre navigateur (localStorage) pour améliorer votre confort de navigation.',
          ],
        },
        {
          heading: '4. Vos droits & contact',
          paragraphs: [
            'Vous pouvez à tout moment demander l’accès, la rectification ou la suppression de vos messages en écrivant à kuamejosephyakro452@gmail.com.',
          ],
        },
      ],
    },
  },

  en: {
    meta: {
      homeTitle: 'KAIROS STUDIO — Turning Ideas Into Experiences | Joseph Kouamé',
      homeDescription:
        'Multidisciplinary creative and digital studio founded by Joseph Kouamé: graphic design, audiovisual production, digital communication, ICT solutions, and web creation.',
      projectTitleSuffix: 'KAIROS STUDIO',
      legalTitle: 'Legal Notice — KAIROS STUDIO',
      privacyTitle: 'Privacy Policy — KAIROS STUDIO',
    },
    nav: {
      services: 'Disciplines',
      works: 'Selected Works',
      founder: 'Founder',
      skills: 'Craft',
      contact: 'Contact',
      themeEditorial: 'Light',
      themeNocturne: 'Dark',
      skipToContent: 'Skip to main content',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
    },
    preloader: {
      caption: 'The opportune moment — Kairos Studio',
    },
    hero: {
      eyebrow: 'Creative & Digital Studio · Joseph Kouamé',
      headlineLine1: 'Shaping the moment,',
      headlineLine2: 'elevating the craft.',
      signature: 'Turning Ideas Into Experiences.',
      kairosNote:
        'In ancient Greek, Kairos names the opportune moment — the precise instant when an idea finds its right form, cadence, and lasting resonance.',
      ctaPrimary: 'Explore selected works',
      ctaSecondary: 'Start a project',
      scrollHint: 'Scroll',
      showreelLabel: 'Studio visual excerpt',
    },
    manifesto: {
      label: 'Philosophy · Kairos',
      quote:
        'Purposeful craft never chases noise: it arrives at the right instant, with measured cadence and unmistakable clarity.',
      body:
        'KAIROS STUDIO brings together art direction, audiovisual production, digital communication, and web engineering under one cohesive standard. Every project is shaped as a complete experience — from the first visual gesture to final delivery.',
      pillars: [
        {
          title: 'Visual precision',
          text: 'Editorial typography, disciplined contrast, and meticulous composition across every medium.',
        },
        {
          title: 'Motion storytelling',
          text: 'Cinematic pacing, clean editing, and motion graphics crafted to hold attention.',
        },
        {
          title: 'Technical fluency',
          text: 'Fast, accessible, mobile-first digital interfaces built without compromising visual poise.',
        },
      ],
    },
    services: {
      label: '01 — Disciplines',
      title: 'Five practices, one coherent vision.',
      subtitle:
        'From print posters to commercial film, from mobile campaigns to web platforms and ICT solutions, the studio guides ideas end to end.',
      exploreCategory: 'View works',
      items: [
        {
          id: 'graphic-design',
          index: '01',
          title: 'Graphic Design',
          tagline: 'Identities, posters & distinctive visual systems',
          description:
            'Event posters, brand marks, visual systems, and print or digital artworks anchored in strong typography and balanced art direction.',
          disciplines: ['Art direction', 'High-res posters & print', 'Logo & visual identity', 'Photo compositing'],
        },
        {
          id: 'audiovisual',
          index: '02',
          title: 'Audiovisual Production',
          tagline: 'Commercial films, editing & motion graphics',
          description:
            'End-to-end commercial video production, rhythmic editing, cinematic color grading, sound design, and crisp motion graphics tailored for every screen.',
          disciplines: ['Commercial spots', 'Editing & grading', 'Motion graphics', 'Multi-screen masters'],
        },
        {
          id: 'digital-communication',
          index: '03',
          title: 'Digital Communication',
          tagline: 'Editorial visuals & mobile-native formats',
          description:
            'Visual campaigns tailored for modern mobile channels (vertical status, square feeds, short formats), honoring interface safe zones and instant legibility.',
          disciplines: ['Visual campaigns', '9:16 & 1:1 mobile formats', 'Editorial adaptations', 'Content direction'],
        },
        {
          id: 'digital-solutions',
          index: '04',
          title: 'Digital Solutions / ICT',
          tagline: 'Custom tools, workflow automation & advisory',
          description:
            'Pragmatic digital tooling, creative and operational workflow automation, cloud service integration, and technical guidance for growing teams.',
          disciplines: ['Workflow automation', 'Systems integration', 'Digital architecture', 'ICT advisory'],
        },
        {
          id: 'web-creation',
          index: '05',
          title: 'Web Creation',
          tagline: 'Editorial websites & high-speed web experiences',
          description:
            'Interface design and front-end engineering for showcase websites, portfolios, and manageable web platforms blending luxury aesthetics with performance and SEO.',
          disciplines: ['Bespoke showcase sites', 'Editorial UI / UX', 'Performance & SEO', 'Private CMS / Admin'],
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
      label: '02 — Curated Archive',
      title: 'Selected Works',
      subtitle:
        'A curated selection of original studio productions — commercial film, posters, and mobile visual campaigns.',
      horizontalHint: 'Horizontal gallery · Scroll or filter by discipline',
      viewProject: 'Open case study',
      allProjectsCount: 'published works',
      emptyCategoryTitle: 'New pieces in preparation',
      emptyCategoryText:
        'Selected works for this discipline will be published here soon. Feel free to browse the full gallery or reach out to discuss your upcoming project.',
      viewAll: 'View all published works',
      videoBadge: 'Film & Motion',
      visualBadge: 'Visual Direction',
    },
    founder: {
      label: '03 — Creative Direction',
      name: 'Joseph Kouamé',
      role: 'Founder & Creative Director',
      headline: 'Bridging creative intuition with digital rigor.',
      bio1:
        'KAIROS STUDIO rests on a clear belief: memorable experiences happen when artistic sensitivity works hand in hand with technical command.',
      bio2:
        'From poster art direction and commercial film post-production to web architecture and digital solutions, Joseph Kouamé leads every mandate with the same devotion to cadence, clarity, and finish.',
      principles: [
        { label: 'Signature', value: 'Turning Ideas Into Experiences.' },
        { label: 'Approach', value: 'Multidisciplinary craft & hands-on execution' },
        { label: 'Standard', value: 'Editorial clarity, speed & refinement' },
      ],
      contactFounder: 'Connect with Joseph Kouamé',
    },
    skills: {
      label: '04 — Craft & Tooling',
      title: 'Capabilities Architecture',
      subtitle:
        'An integrated production pipeline connecting visual design, audiovisual post-production, and modern web engineering.',
      groups: [
        {
          index: 'I',
          title: 'Art Direction & Graphic Design',
          items: [
            'Editorial layouts & high-resolution posters',
            'Brand marks & structured visual systems',
            'Retouching & compositing (Adobe Photoshop)',
            'Vector design & logotypes (Adobe Illustrator)',
            'Print & social format adaptations',
          ],
        },
        {
          index: 'II',
          title: 'Audiovisual & Motion',
          items: [
            'Commercial & narrative editing (DaVinci Resolve)',
            'Cinematic color grading & visual cohesion',
            'Motion graphics & kinetic screen overlays',
            'Voice-over, music & sound design mixing',
            'Web & mobile video optimization',
          ],
        },
        {
          index: 'III',
          title: 'Web, ICT & Digital Systems',
          items: [
            'Responsive interfaces & editorial design systems',
            'Front-end engineering (React, TypeScript, Vite)',
            'Fluid web motion (GSAP, lightweight WebGL)',
            'Technical SEO, accessibility & web performance',
            'Secure cloud databases & workflow automation',
          ],
        },
      ],
    },
    contact: {
      label: '05 — Inquiries',
      title: 'The right moment to bring your idea into focus.',
      subtitle:
        'Tell me about your project — poster, commercial film, digital campaign, website, or ICT solution. Direct conversation, no intermediaries.',
      directHeading: 'Direct channels',
      emailLabel: 'Email',
      whatsappLabel: 'Direct WhatsApp',
      whatsappCta: 'Message on WhatsApp',
      responseNote: 'Direct conversation with Joseph Kouamé · Français & English',
      form: {
        name: 'Full name',
        namePlaceholder: 'Your name or organization',
        email: 'Email address',
        emailPlaceholder: 'you@example.com',
        phone: 'Phone / WhatsApp (optional)',
        phonePlaceholder: '+225 ...',
        service: 'Discipline',
        servicePlaceholder: 'Select a discipline',
        message: 'Project brief',
        messagePlaceholder: 'Share your goals, expected format, and creative direction...',
        submit: 'Send message',
        submitting: 'Sending...',
        successTitle: 'Message received',
        successBody: 'Thank you for reaching out. Joseph Kouamé will get back to you shortly.',
        fallbackTitle: 'Direct submission temporarily unavailable',
        fallbackBody:
          'We could not store your message right now. To make sure your request reaches the studio immediately, continue on WhatsApp with your message pre-filled.',
        fallbackButton: 'Continue on WhatsApp',
        validationName: 'Please enter your name (at least 2 characters).',
        validationEmail: 'Please enter a valid email address.',
        validationMessage: 'Please describe your inquiry in at least 10 characters.',
        rateLimitError: 'A message was just sent. Please wait a moment before sending another.',
      },
    },
    projectDetail: {
      backToWorks: 'Back to works',
      category: 'Discipline',
      client: 'Client',
      year: 'Year',
      role: 'Role',
      deliverables: 'Deliverables',
      visitLink: 'Visit project',
      galleryHeading: 'Visual plates & frames',
      videoHeading: 'Film screening',
      nextProject: 'Next project',
      prevProject: 'Previous project',
      discussSimilar: 'Discuss a similar project',
      notFoundTitle: 'Project not found',
      notFoundText: 'This project is unavailable or has not been published yet.',
      fullscreenHint: 'Click to view fullscreen',
      closeLightbox: 'Close fullscreen view',
    },
    footer: {
      signature: 'Turning Ideas Into Experiences.',
      navigation: 'Navigation',
      directContact: 'Direct contact',
      legalNotice: 'Legal Notice',
      privacyPolicy: 'Privacy Policy',
      rights: 'KAIROS STUDIO — Joseph Kouamé. All rights reserved.',
      backToTop: 'Back to top',
    },
    legal: {
      backHome: 'Back to home',
      legalNoticeTitle: 'Legal Notice',
      legalNoticeIntro: 'Publishing and hosting information for the official KAIROS STUDIO portfolio.',
      legalSections: [
        {
          heading: '1. Publisher',
          paragraphs: [
            'This website is published by KAIROS STUDIO, led by its founder and creative director Joseph Kouamé.',
            'Email: kuamejosephyakro452@gmail.com — WhatsApp: +225 07 89 50 17 05.',
          ],
        },
        {
          heading: '2. Hosting',
          paragraphs: [
            'The public portfolio is hosted via GitHub Pages (GitHub, Inc.). Contact submission and private administration rely on Supabase infrastructure.',
          ],
        },
        {
          heading: '3. Intellectual Property',
          paragraphs: [
            'Unless stated otherwise, all works featured on this portfolio (copy, graphic artworks, films, interfaces, the JK monogram, and the KAIROS STUDIO identity) remain the property of their author. Any unauthorized reproduction or distribution is prohibited.',
          ],
        },
        {
          heading: '4. Liability',
          paragraphs: [
            'KAIROS STUDIO strives to keep published content accurate and reserves the right to update or refine it at any time without prior notice.',
          ],
        },
      ],
      privacyTitle: 'Privacy Policy',
      privacyIntro: 'KAIROS STUDIO values privacy and collects only the strict minimum required to answer your inquiries.',
      privacySections: [
        {
          heading: '1. Data Collected',
          paragraphs: [
            'No advertising trackers or public user accounts are used on this portfolio. Personal data is collected solely when you voluntarily submit the contact form (name, email address, optional phone number, discipline, and message).',
          ],
        },
        {
          heading: '2. Purpose & Retention',
          paragraphs: [
            'Submitted contact information is used exclusively to respond to your inquiry and discuss your project. It is never sold or shared with third parties and is retained only as long as needed to follow up.',
          ],
        },
        {
          heading: '3. Local Preferences',
          paragraphs: [
            'Your language selection (French / English) and visual theme preference (light / dark) are stored locally in your browser (localStorage) for convenience.',
          ],
        },
        {
          heading: '4. Your Rights & Contact',
          paragraphs: [
            'You may request access, correction, or deletion of your messages at any time by writing to kuamejosephyakro452@gmail.com.',
          ],
        },
      ],
    },
  },
};
