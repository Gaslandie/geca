export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];
export const isLocale = (value: string): value is Locale =>
  locales.some((locale) => locale === value);
export const href = (locale: Locale, path = "") =>
  `/${locale}${path ? `/${path}` : ""}`;

export const identity = {
  name: "Global EcoAction",
  shortName: "GECA",
  formerName: "RENASCEDD",
  since: "2016",
  address: "Sangoyah Marché, Matoto — Conakry, Guinée",
  phone: "+224 628 40 03 87",
  phoneHref: "tel:+224628400387",
  email: "ong.geca@gmail.com",
};

// Registre fermé : une URL inconnue ne devient jamais une rubrique valide.
export const routes = [
  { path: "a-propos", fr: "Qui sommes-nous ?", en: "About us" },
  {
    path: "a-propos/mission-vision-valeurs",
    fr: "Mission, vision et valeurs",
    en: "Mission, vision and values",
  },
  {
    path: "a-propos/domaines-intervention",
    fr: "Domaines d’intervention",
    en: "Our focus areas",
  },
  { path: "equipe", fr: "Équipe", en: "Our team" },
  { path: "projets", fr: "Projets & programmes", en: "Projects & programmes" },
  { path: "projets/en-cours", fr: "Projets en cours", en: "Current projects" },
  {
    path: "projets/realises",
    fr: "Projets réalisés",
    en: "Completed projects",
  },
  {
    path: "projets/kounounkan",
    fr: "Activités génératrices de revenus à Kounounkan",
    en: "Livelihoods in Kounounkan",
  },
  {
    path: "projets/appui-social-nature",
    fr: "Appui social et protection de la nature",
    en: "Social support and nature protection",
  },
  {
    path: "projets/planification-climatique",
    fr: "Climat et planification locale",
    en: "Climate and local planning",
  },
  {
    path: "projets/protemo",
    fr: "Projet de Territoire de Moussayah",
    en: "Moussayah territory project",
  },
  { path: "actualites", fr: "Actualités", en: "News" },
  { path: "evenements", fr: "Événements", en: "Events" },
  {
    path: "ressources",
    fr: "Publications & documents",
    en: "Publications & documents",
  },
  { path: "reseaux", fr: "Réseaux", en: "Networks" },
  { path: "partenaires", fr: "Partenaires", en: "Partners" },
  { path: "nous-soutenir", fr: "Nous soutenir", en: "Support us" },
  {
    path: "devenir-partenaire",
    fr: "Devenir partenaire",
    en: "Partner with us",
  },
  { path: "contact", fr: "Contact", en: "Contact" },
  { path: "recherche", fr: "Recherche", en: "Search" },
  { path: "mentions-legales", fr: "Mentions légales", en: "Legal notice" },
  {
    path: "confidentialite",
    fr: "Politique de confidentialité",
    en: "Privacy policy",
  },
  { path: "plan-du-site", fr: "Plan du site", en: "Sitemap" },
] as const;

export type NavItem = {
  fr: string;
  en: string;
  path: string;
  children?: readonly string[];
};
export const navigation: readonly NavItem[] = [
  { fr: "Accueil", en: "Home", path: "" },
  {
    fr: "À propos",
    en: "About",
    path: "a-propos",
    children: [
      "a-propos",
      "a-propos/mission-vision-valeurs",
      "a-propos/domaines-intervention",
      "equipe",
    ],
  },
  {
    fr: "Projets & programmes",
    en: "Projects & programmes",
    path: "projets",
    children: ["projets", "projets/en-cours", "projets/realises"],
  },
  {
    fr: "Actualités",
    en: "News",
    path: "actualites",
    children: ["actualites", "evenements"],
  },
  {
    fr: "Ressources",
    en: "Resources",
    path: "ressources",
    children: ["ressources", "reseaux", "partenaires"],
  },
  { fr: "Contact", en: "Contact", path: "contact" },
];

export const interfaceText = {
  fr: {
    skip: "Aller au contenu",
    home: "Accueil",
    menu: "Menu",
    close: "Fermer le menu",
    mainNav: "Navigation principale",
    donate: "Faire un don",
    search: "Rechercher",
    language: "Choisir la langue",
    openSection: "Ouvrir la rubrique",
    footerDescription:
      "Une ONG guinéenne engagée pour des écosystèmes vivants et des communautés résilientes.",
    navigation: "Découvrir",
    resources: "S’engager & s’informer",
    contact: "Nous contacter",
    socials: "Réseaux sociaux · liens à venir",
    rights: "Tous droits réservés.",
    construction: {
      label: "Bientôt ici",
      title: "Cette rubrique est en préparation.",
      description:
        "Nous travaillons actuellement sur cette partie du nouveau site de Global EcoAction.",
      back: "Retour à l’accueil",
      contact: "Contacter GECA",
    },
  },
  en: {
    skip: "Skip to content",
    home: "Home",
    menu: "Menu",
    close: "Close menu",
    mainNav: "Main navigation",
    donate: "Donate",
    search: "Search",
    language: "Select language",
    openSection: "Open section",
    footerDescription:
      "A Guinean NGO working for thriving ecosystems and resilient communities.",
    navigation: "Discover",
    resources: "Get involved & learn",
    contact: "Contact us",
    socials: "Social media · links coming soon",
    rights: "All rights reserved.",
    construction: {
      label: "Coming soon",
      title: "This section is being prepared.",
      description:
        "We are currently working on this part of the new Global EcoAction website.",
      back: "Visit the French homepage",
      contact: "Contact GECA",
    },
  },
} as const;

export type LocalPhoto = {
  src: `/${string}`;
  alt: string;
  temporary?: boolean;
};

export const temporaryImageLabel = "Image temporaire";

// Photos d’illustration autorisées par Gassama le 3 octobre 2026.
// Sources et licences : docs/IMAGES-TEMPORAIRES.md. À remplacer par les photos GECA.
const temporaryPhotos = {
  forest: {
    src: "/images/temporary/forest.jpg",
    alt: "Feuillage tropical — image temporaire d’illustration, sans lien avec une action de GECA.",
    temporary: true,
  },
  planting: {
    src: "/images/temporary/planting.jpg",
    alt: "Mains gantées plantant un jeune plant — image temporaire d’illustration, sans lien avec une action de GECA.",
    temporary: true,
  },
  fields: {
    src: "/images/temporary/fields.jpg",
    alt: "Vue aérienne de champs cultivés — image temporaire d’illustration, sans lien avec une action de GECA.",
    temporary: true,
  },
  climate: {
    src: "/images/temporary/climate.jpg",
    alt: "Sol fissuré et végétation clairsemée — image temporaire d’illustration, sans lien avec une action de GECA.",
    temporary: true,
  },
  water: {
    src: "/images/temporary/water.jpg",
    alt: "Cascade entourée de végétation — image temporaire d’illustration, sans lien avec une action de GECA.",
    temporary: true,
  },
  community: {
    src: "/images/temporary/community.jpg",
    alt: "Mains réunies en signe d’entraide — image temporaire d’illustration, sans lien avec une action ou des membres de GECA.",
    temporary: true,
  },
} satisfies Record<string, LocalPhoto>;
export type Project = {
  slug: string;
  title: string;
  zone: string;
  period: string;
  partner: string;
  status: "current" | "completed";
  description: string;
  photo?: LocalPhoto;
};

// Contenu de maquette fourni par le brief. Zones et résumés à relire par GECA.
export const projects: readonly Project[] = [
  {
    slug: "kounounkan",
    photo: temporaryPhotos.forest,
    title:
      "Activités génératrices de revenus autour du futur Parc national des plateaux de Kounounkan",
    zone: "Plateaux de Kounounkan",
    period: "2025–2026",
    partner: "Banque mondiale",
    status: "current",
    description:
      "Accompagner les communautés dans le développement d’activités économiques liées à la préservation de leur territoire.",
  },
  {
    slug: "appui-social-nature",
    photo: temporaryPhotos.planting,
    title: "Projet d’appui social et protection de la nature",
    zone: "Guinée · zone à préciser",
    period: "2025–2026",
    partner: "Fondation ALCOA",
    status: "current",
    description:
      "Associer l’accompagnement des communautés à la protection des ressources naturelles.",
  },
  {
    slug: "planification-climatique",
    photo: temporaryPhotos.fields,
    title:
      "Intégration du changement climatique dans la planification locale en Basse-Guinée",
    zone: "Basse-Guinée",
    period: "2024–2025",
    partner: "ANAFIC",
    status: "completed",
    description:
      "Accompagner les collectivités pour intégrer les enjeux climatiques à leurs priorités de développement.",
  },
  {
    slug: "protemo",
    photo: temporaryPhotos.fields,
    title: "Projet de Territoire de Moussayah — PROTEMO",
    zone: "Moussayah",
    period: "2023–2024",
    partner: "Ambassade de France en Guinée et Sierra Leone",
    status: "completed",
    description:
      "Soutenir une dynamique territoriale qui relie protection de l’environnement et développement communautaire.",
  },
];

// Message client reçu via « MESSAGE POUR LA PAGE D'ACCUEIL.docx » le 3 octobre 2026.
// Répartition éditoriale et provenance : docs/CONTENU-CLIENT.md.
export const homeContent = {
  hero: {
    label: "GLOBAL ECOACTION · GUINÉE",
    title: "AGIR POUR",
    titleSecondLine: "UN AVENIR DURABLE",
    description: "Restaurer les écosystèmes · Renforcer les communautés",
    primary: "Découvrir nos projets",
    secondary: "Devenir partenaire",
    video: {
      src: "/videos/geca-forest.mp4",
      poster: "/videos/geca-forest-poster.jpg",
      pause: "Mettre la vidéo en pause",
      pauseShort: "Pause vidéo",
      play: "Lire la vidéo",
    },
  },
  about: {
    label: "Notre organisation",
    title: "Qui sommes-nous ?",
    description:
      "Global EcoAction (GECA), anciennement RENASCEDD, est une ONG guinéenne créée en 2016. Nous agissons aux côtés des communautés pour restaurer les écosystèmes, protéger la biodiversité et améliorer les conditions de vie.",
    cta: "À propos de GECA",
    sideLabel: "Notre signature",
    sideText: "Global EcoAction — Agir pour un avenir durable.",
    since: "Aux côtés des communautés depuis",
  },
  domains: {
    label: "Nos domaines d’intervention",
    title: "Six leviers pour un changement durable.",
    cta: "Découvrir ce domaine",
    description:
      "Des actions complémentaires, pensées pour les réalités de nos territoires.",
    items: [
      {
        photo: temporaryPhotos.forest,
        title: "Restauration des écosystèmes",
        description:
          "Restaurer les terres dégradées, protéger les forêts et la biodiversité grâce au reboisement et aux pépinières communautaires.",
      },
      {
        photo: temporaryPhotos.climate,
        title: "Climat & résilience",
        description:
          "S’adapter au changement climatique et réduire ses effets sur les communautés.",
      },
      {
        photo: temporaryPhotos.fields,
        title: "Agroécologie & agriculture durable",
        description:
          "Accompagner les producteurs vers des pratiques qui préservent les sols.",
      },
      {
        photo: temporaryPhotos.water,
        title: "Ressources naturelles",
        description:
          "Encourager une gestion durable de l’eau, des terres et des forêts.",
      },
      {
        photo: temporaryPhotos.planting,
        title: "Éducation environnementale",
        description:
          "Sensibiliser, transmettre et former pour donner à chacun les moyens d’agir.",
      },
      {
        photo: temporaryPhotos.community,
        title: "Gouvernance & communautés",
        description:
          "Renforcer la gouvernance environnementale et le développement local avec les communautés.",
      },
    ],
  },
  impact: {
    label: "Notre impact",
    title: "Des actions locales.",
    titleSecondLine: "Une portée collective.",
    photo: {
      src: "/images/temporary/impact-forest.jpg",
      alt: "Collines boisées dans la brume — image temporaire d’illustration, sans lien avec une action de GECA.",
      temporary: true,
    } satisfies LocalPhoto,
    description:
      "Chaque territoire accompagné est un pas vers un avenir plus résilient.",
    // Valeurs du brief, à valider avec les pièces justificatives avant publication.
    stats: [
      { value: "84", label: "collectivités accompagnées", icon: "communities" },
      { value: "40", unit: "ha", label: "de sites dégradés restaurés", icon: "restoration" },
      { value: "2016", label: "année de création de GECA", icon: "calendar" },
    ],
    note: "Repères de la maquette · données à valider avant publication.",
    // TODO: chiffre de 550 000 arbres à confirmer par GECA avant publication. Non affiché.
  },
  projects: {
    label: "Projets & programmes",
    title: "Sur le terrain, le changement prend racine.",
    description:
      "Découvrez les initiatives que nous menons avec les communautés et nos partenaires.",
    current: "En cours",
    completed: "Réalisés",
    filters: "Filtrer les projets",
    statusCurrent: "En cours",
    statusCompleted: "Réalisé",
    partner: "Avec",
    view: "Voir le projet",
    all: "Voir tous les projets",
    count: "projets affichés",
    photo: "Photo du projet GECA",
  },
  approach: {
    label: "Notre approche",
    title: "Avec les communautés. À chaque étape.",
    description:
      "En renforçant les capacités des femmes, des jeunes et des producteurs, GECA contribue à bâtir des territoires plus résilients, inclusifs et durables.",
    items: [
      {
        title: "Participation communautaire",
        description:
          "GECA place les populations au cœur de la gestion durable des ressources naturelles.",
      },
      {
        title: "Solutions adaptées au territoire",
        description:
          "Chaque action part des besoins locaux et des ressources du terrain.",
      },
      {
        title: "Renforcement des capacités",
        description:
          "Nous transmettons les savoir-faire pour que chacun puisse agir.",
      },
      {
        title: "Résultats durables",
        description:
          "Nous inscrivons les actions dans le temps, au-delà d’un projet.",
      },
    ],
  },
  team: {
    label: "Les femmes et les hommes de GECA",
    title: "Une équipe, un engagement commun.",
    description:
      "Les visages de notre engagement seront bientôt présentés ici.",
    cta: "Découvrir notre équipe",
    members: [
      {
        id: "member-1",
        name: "Nom du membre",
        role: "Fonction",
        photo: undefined as LocalPhoto | undefined,
      },
      {
        id: "member-2",
        name: "Nom du membre",
        role: "Fonction",
        photo: undefined as LocalPhoto | undefined,
      },
      {
        id: "member-3",
        name: "Nom du membre",
        role: "Fonction",
        photo: undefined as LocalPhoto | undefined,
      },
    ],
    photoLabel: "Photo",
  },
  news: {
    label: "Actualités & événements",
    title: "La vie de GECA.",
    cta: "Voir toutes les actualités",
    placeholderLabel: "Contenu en préparation",
    items: [
      {
        title: "Au plus près des communautés",
        description:
          "Nos prochaines nouvelles du terrain seront à découvrir ici.",
        path: "actualites",
        category: "Sur le terrain",
      },
      {
        title: "Partager les savoirs, faire grandir l’action",
        description:
          "Retrouvez bientôt nos initiatives de sensibilisation et de formation.",
        path: "actualites",
        category: "Vie de l’association",
      },
    ],
    event: {
      label: "Prochain événement",
      title: "Un prochain rendez-vous pour agir ensemble.",
      date: "Date et lieu à venir",
      cta: "Découvrir les événements",
    },
  },
  partners: {
    label: "Nos partenaires",
    title: "Ensemble, nous allons plus loin.",
    description:
      "Partenaires cités dans nos documents.",
    items: [
      {
        name: "Banque mondiale",
        logo: {
          src: "/images/partners/banque-mondiale.png",
          alt: "Logo du Groupe de la Banque mondiale",
          width: 486,
          height: 68,
        },
      },
      {
        name: "Fondation ALCOA",
        logo: {
          src: "/images/partners/alcoa-foundation.png",
          alt: "Logo de la Fondation ALCOA",
          width: 266,
          height: 133,
        },
      },
      {
        name: "ANAFIC",
        logo: {
          src: "/images/partners/anafic.png",
          alt: "Logo de l’ANAFIC — Agence Nationale de Financement des Collectivités Locales",
          width: 384,
          height: 84,
        },
      },
      {
        name: "Ambassade de France en Guinée et Sierra Leone",
        logo: {
          src: "/images/partners/ambassade-france.png",
          alt: "Logo de l’Ambassade de France en Guinée et en Sierra Leone",
          width: 1049,
          height: 806,
        },
      },
      {
        name: "Reforest’Action",
        logo: {
          src: "/images/partners/reforestaction.png",
          alt: "Logo de Reforest’Action",
          width: 1640,
          height: 593,
        },
      },
    ],
  },
  cta: {
    label: "Passons à l’action",
    partnerTitle: "Vous avez un projet en Guinée ?",
    partnerText:
      "Construisons ensemble des solutions utiles aux territoires et aux communautés.",
    partnerButton: "Devenir partenaire",
    supportTitle: "Vous souhaitez soutenir nos actions ?",
    supportText: "Chaque engagement contribue à faire avancer notre mission.",
    supportButton: "Nous soutenir",
  },
} as const;

export const footerLinks = {
  discover: ["a-propos", "equipe", "projets", "actualites", "evenements"],
  resources: [
    "ressources",
    "reseaux",
    "partenaires",
    "devenir-partenaire",
    "nous-soutenir",
  ],
  legal: ["mentions-legales", "confidentialite", "plan-du-site"],
};
