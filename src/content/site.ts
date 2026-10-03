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
    closeShort: "Fermer",
    show: "Afficher",
    hide: "Masquer",
    mainNav: "Navigation principale",
    donate: "Faire un don",
    donateShort: "Don",
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
    footerCredit: "Site réalisé par GassTech Solutions",
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
    closeShort: "Close",
    show: "Show",
    hide: "Hide",
    mainNav: "Main navigation",
    donate: "Donate",
    donateShort: "Donate",
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
    footerCredit: "Website by GassTech Solutions",
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

// Images définitives fournies par Gassama. Association exacte selon les noms
// des fichiers ; provenance et préparation : docs/IMAGES-DOMAINES.md.
const interventionPhotos = {
  "restauration-ecosystemes": {
    src: "/images/domaines/restauration-ecosystemes.jpg",
    alt: "Image du domaine Restauration des écosystèmes.",
  },
  "climat-resilience": {
    src: "/images/domaines/climat-resilience.jpg",
    alt: "Image du domaine Climat & résilience.",
  },
  agroecologie: {
    src: "/images/domaines/agroecologie.jpg",
    alt: "Image du domaine Agroécologie & agriculture durable.",
  },
  "ressources-naturelles": {
    src: "/images/domaines/ressources-naturelles.jpg",
    alt: "Image du domaine Ressources naturelles.",
  },
  "education-environnementale": {
    src: "/images/domaines/education-environnementale.jpg",
    alt: "Image du domaine Éducation environnementale.",
  },
  "gouvernance-communautes": {
    src: "/images/domaines/gouvernance-communautes.jpg",
    alt: "Image du domaine Gouvernance & communautés.",
  },
} satisfies Record<string, LocalPhoto>;

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

// Page contact : reformulation pour GECA, sans nouvelle promesse ni envoi réel.
export const contactPhotos = {
  landscape: {
    fr: temporaryPhotos.fields,
    en: { ...temporaryPhotos.fields, alt: "Aerial view of cultivated fields — temporary illustration, unrelated to a GECA activity." },
  },
  forest: {
    fr: temporaryPhotos.forest,
    en: { ...temporaryPhotos.forest, alt: "Tropical foliage — temporary illustration, unrelated to a GECA activity." },
  },
} satisfies Record<string, Record<Locale, LocalPhoto>>;

export const contactContent = {
  fr: {
    metadata: "Contactez Global EcoAction en Guinée pour échanger sur un projet, un partenariat ou nos actions pour la nature et les communautés.",
    breadcrumb: "Fil d’Ariane",
    label: "Parlons ensemble",
    title: "Une idée pour agir ensemble ?",
    description: "Un projet, un partenariat ou une question ? Parlons de ce que nous pouvons construire ensemble pour la nature et les communautés en Guinée.",
    landscape: "Des paysages à préserver",
    forest: "Une nature vivante",
    details: "Les coordonnées de GECA",
    visit: "Nous trouver",
    call: "Nous appeler",
    write: "Nous écrire",
    closingLabel: "Global EcoAction · Guinée",
    closingTitle: "Ensemble, faisons grandir un avenir durable.",
    closingDescription: "Restaurer la nature, renforcer les communautés : chaque échange peut être le début d’une action commune.",
    form: {
      title: "Parlez-nous de votre idée",
      demo: "Formulaire de démonstration : vous pouvez prévisualiser votre message. Aucun envoi n’est effectué.",
      required: "Les champs marqués d’un * sont obligatoires.",
      name: "Nom complet",
      email: "Adresse e-mail",
      organization: "Organisation",
      optional: "(facultatif)",
      reason: "Vous souhaitez…",
      reasons: [
        { value: "partnership", label: "Proposer un partenariat" },
        { value: "project", label: "Échanger sur un projet" },
        { value: "other", label: "Poser une question ou nous contacter" },
      ],
      message: "Votre message",
      help: "Présentez votre idée en quelques mots. Entre 10 et 3 000 caractères.",
      submit: "Prévisualiser mon message",
      privacy: "Cette démonstration n’enregistre pas votre saisie. N’indiquez pas de mot de passe ni de donnée sensible.",
      invalid: "Merci de compléter ce champ avec un texte, pas seulement des espaces.",
      preview: "Aperçu de votre message",
      notSent: "Votre message n’a pas été envoyé. Pour contacter GECA, utilisez l’e-mail ou le téléphone indiqué sur cette page.",
      reset: "Effacer ma saisie",
      noScript: "Activez JavaScript pour essayer la prévisualisation, ou contactez GECA par e-mail ou par téléphone.",
    },
  },
  en: {
    metadata: "Contact Global EcoAction in Guinea to discuss a project, a partnership or our work for nature and communities.",
    breadcrumb: "Breadcrumb",
    label: "Let’s talk",
    title: "An idea to take action together?",
    description: "A project, a partnership or a question? Let’s explore what we can build together for nature and communities in Guinea.",
    landscape: "Landscapes to protect",
    forest: "Living nature",
    details: "GECA contact details",
    visit: "Find us",
    call: "Call us",
    write: "Email us",
    closingLabel: "Global EcoAction · Guinea",
    closingTitle: "Together, let’s grow a sustainable future.",
    closingDescription: "Restoring nature, strengthening communities: every conversation can be the start of a shared action.",
    form: {
      title: "Tell us about your idea",
      demo: "Demo form: you can preview your message. Nothing is sent.",
      required: "Fields marked with an * are required.",
      name: "Full name",
      email: "Email address",
      organization: "Organisation",
      optional: "(optional)",
      reason: "You would like to…",
      reasons: [
        { value: "partnership", label: "Propose a partnership" },
        { value: "project", label: "Discuss a project" },
        { value: "other", label: "Ask a question or get in touch" },
      ],
      message: "Your message",
      help: "Describe your idea in a few words. Between 10 and 3,000 characters.",
      submit: "Preview my message",
      privacy: "This demo does not save your input. Do not include passwords or sensitive information.",
      invalid: "Please enter some text, not just spaces.",
      preview: "Message preview",
      notSent: "Your message has not been sent. To contact GECA, use the email address or phone number on this page.",
      reset: "Clear my input",
      noScript: "Enable JavaScript to try the preview, or contact GECA by email or phone.",
    },
  },
} as const;

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
    introduction:
      "En Guinée, nous agissons avec les communautés pour restaurer les terres dégradées, protéger les forêts et la biodiversité. Grâce au reboisement, à l’agroécologie et au renforcement des capacités, nous contribuons à améliorer les conditions de vie.",
    photo: temporaryPhotos.forest,
    primary: "Découvrir nos projets",
    secondary: "Devenir partenaire",
    video: {
      src: "/videos/geca-forest.mp4",
      poster: "/videos/geca-forest-poster.jpg",
      pause: "Mettre la vidéo en pause",
      pauseLabel: "Pause",
      play: "Lire la vidéo",
      playLabel: "Lire",
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
        id: "restauration-ecosystemes",
        photo: interventionPhotos["restauration-ecosystemes"],
        title: "Restauration des écosystèmes",
        description:
          "Restaurer les terres dégradées, protéger les forêts et la biodiversité grâce au reboisement et aux pépinières communautaires.",
      },
      {
        id: "climat-resilience",
        photo: interventionPhotos["climat-resilience"],
        title: "Climat & résilience",
        description:
          "S’adapter au changement climatique et réduire ses effets sur les communautés.",
      },
      {
        id: "agroecologie",
        photo: interventionPhotos.agroecologie,
        title: "Agroécologie & agriculture durable",
        description:
          "Accompagner les producteurs vers des pratiques qui préservent les sols.",
      },
      {
        id: "ressources-naturelles",
        photo: interventionPhotos["ressources-naturelles"],
        title: "Ressources naturelles",
        description:
          "Encourager une gestion durable de l’eau, des terres et des forêts.",
      },
      {
        id: "education-environnementale",
        photo: interventionPhotos["education-environnementale"],
        title: "Éducation environnementale",
        description:
          "Sensibiliser, transmettre et former pour donner à chacun les moyens d’agir.",
      },
      {
        id: "gouvernance-communautes",
        photo: interventionPhotos["gouvernance-communautes"],
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
      { value: "84", label: "collectivités accompagnées" },
      { value: "40", unit: "ha", label: "de sites dégradés restaurés" },
      { value: "2016", label: "année de création de GECA" },
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
    description:
      "Découvrez nos dernières actualités, nos activités sur le terrain et les événements à venir.",
    cta: "Voir toutes les actualités",
    placeholderLabel: "Contenu en préparation",
    items: [
      {
        title: "Au plus près des communautés",
        description:
          "Nos prochaines nouvelles du terrain seront à découvrir ici.",
        path: "actualites",
        category: "Sur le terrain",
        photo: temporaryPhotos.planting,
      },
      {
        title: "Partager les savoirs, faire grandir l’action",
        description:
          "Retrouvez bientôt nos initiatives de sensibilisation et de formation.",
        path: "actualites",
        category: "Vie de l’association",
        photo: temporaryPhotos.community,
      },
    ],
    event: {
      label: "Prochain événement",
      title: "Un prochain rendez-vous pour agir ensemble.",
      date: "Date et lieu à venir",
      description: "Restez connectés pour ne rien manquer de nos prochains événements.",
      cta: "Découvrir les événements",
      motto: "Des communautés plus résilientes, une nature préservée.",
      photo: {
        src: "/images/temporary/event-leaf.jpg",
        alt: "Gouttes d’eau sur une feuille verte — image temporaire d’illustration, sans lien avec un événement GECA.",
        temporary: true,
      },
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

// À propos : développements éditoriaux des informations client déjà présentes.
// Provenance et limites : docs/CONTENU-CLIENT.md. Traduction EN à relire par GECA.
export const aboutContent = {
  fr: {
    metadata: "Découvrez Global EcoAction, ONG guinéenne créée en 2016, anciennement RENASCEDD : notre histoire, notre mission et notre approche avec les communautés.",
    breadcrumb: "Fil d’Ariane",
    pageName: "À propos",
    label: "Qui sommes-nous ?",
    title: "La nature et les communautés, un avenir commun.",
    introduction: homeContent.about.description,
    photo: temporaryPhotos.fields,
    photoLabel: "Les territoires au cœur de notre engagement",
    sinceLabel: "Engagés depuis",
    sinceDescription: "Une ONG guinéenne, ancrée dans les réalités de ses territoires.",
    location: "Conakry · Guinée",
    explore: "Découvrir notre histoire",
    history: {
      label: "Notre histoire",
      title: "De RENASCEDD à Global EcoAction.",
      paragraphs: [
        "Notre organisation a été créée en 2016. Anciennement RENASCEDD, elle porte aujourd’hui le nom de Global EcoAction, ou GECA. Basée à Conakry, elle agit en Guinée pour relier protection de l’environnement et développement communautaire.",
        "Notre engagement repose sur une conviction : préserver les ressources naturelles et améliorer les conditions de vie sont deux objectifs qui avancent ensemble. Les terres, les forêts et la biodiversité font partie du quotidien des communautés ; leur avenir se construit avec elles.",
      ],
      convictionLabel: "Notre conviction",
      conviction: "Faire de la protection de l’environnement un moteur de développement et d’amélioration des conditions de vie.",
    },
    purpose: {
      label: "Notre cap",
      title: "Restaurer aujourd’hui. Construire demain.",
      description: "Un même engagement pour des écosystèmes vivants et des communautés capables de préparer leur avenir.",
      missionLabel: "Notre mission",
      missionTitle: "Restaurer la nature, renforcer les communautés.",
      mission: "Restaurer les terres dégradées, protéger les forêts et la biodiversité, et accompagner les communautés face au changement climatique. Le reboisement, l’agroécologie et le renforcement des capacités sont des moyens complémentaires pour agir.",
      visionLabel: "Notre ambition",
      visionTitle: "Des territoires résilients, inclusifs et durables.",
      vision: "Contribuer à des territoires où la protection de l’environnement soutient le développement local. Des territoires où les femmes, les jeunes et les producteurs disposent des moyens de participer à la gestion durable des ressources naturelles.",
    },
    approach: {
      label: homeContent.approach.label,
      title: homeContent.approach.title,
      description: homeContent.approach.description,
      photo: temporaryPhotos.planting,
      photoLabel: "Faire grandir les actions locales",
      items: [
        { title: "Partir des réalités locales", description: "Les besoins des communautés et les ressources du territoire orientent les actions. GECA place les populations au cœur de la gestion durable de leur environnement." },
        { title: "Partager les savoir-faire", description: "La sensibilisation, l’éducation environnementale et la formation donnent aux femmes, aux jeunes et aux producteurs des moyens concrets d’agir." },
        { title: "Inscrire les actions dans la durée", description: "Pépinières communautaires, pratiques agroécologiques et gouvernance locale : nous relions les actions de restauration aux capacités des personnes qui les font vivre." },
      ],
    },
    domains: {
      label: homeContent.domains.label,
      title: "Des actions qui se complètent.",
      description: "De la restauration des écosystèmes au développement local, nos six domaines d’intervention relient la nature et les communautés.",
      items: homeContent.domains.items.map(({ title, description }) => ({ title, description })),
    },
    closing: {
      label: "Agissons ensemble",
      title: "Un avenir durable se construit à plusieurs.",
      description: "Vous partagez cet engagement pour la nature et les communautés ? Échangeons sur votre idée, votre territoire ou les possibilités de travailler ensemble.",
      contact: "Parlons de votre idée",
      home: "Retour à l’accueil",
    },
  },
  en: {
    metadata: "Meet Global EcoAction, a Guinean NGO founded in 2016, formerly RENASCEDD: our story, mission and approach alongside communities.",
    breadcrumb: "Breadcrumb",
    pageName: "About us",
    label: "Who we are",
    title: "Nature and communities, a shared future.",
    introduction: "Global EcoAction (GECA), formerly RENASCEDD, is a Guinean NGO founded in 2016. We work alongside communities to restore ecosystems, protect biodiversity and improve living conditions.",
    photo: { ...temporaryPhotos.fields, alt: "Aerial view of cultivated fields — temporary illustration, unrelated to a GECA activity." },
    photoLabel: "Local landscapes at the heart of our work",
    sinceLabel: "Committed since",
    sinceDescription: "A Guinean NGO rooted in the realities of its local communities and landscapes.",
    location: "Conakry · Guinea",
    explore: "Discover our story",
    history: {
      label: "Our story",
      title: "From RENASCEDD to Global EcoAction.",
      paragraphs: [
        "Our organisation was founded in 2016. Formerly RENASCEDD, it is now known as Global EcoAction, or GECA. Based in Conakry, it works in Guinea to connect environmental protection with community development.",
        "Our work is guided by a conviction: protecting natural resources and improving living conditions go hand in hand. Land, forests and biodiversity are part of communities’ daily lives; their future must be built together.",
      ],
      convictionLabel: "Our conviction",
      conviction: "Make environmental protection a driver of development and better living conditions.",
    },
    purpose: {
      label: "Our direction",
      title: "Restore today. Build for tomorrow.",
      description: "A shared commitment to thriving ecosystems and communities with the means to shape their future.",
      missionLabel: "Our mission",
      missionTitle: "Restore nature, strengthen communities.",
      mission: "Restore degraded land, protect forests and biodiversity, and support communities facing climate change. Reforestation, agroecology and capacity building are complementary ways to take action.",
      visionLabel: "Our ambition",
      visionTitle: "Resilient, inclusive and sustainable places.",
      vision: "Help build places where environmental protection supports local development. Places where women, young people and producers have the means to participate in the sustainable management of natural resources.",
    },
    approach: {
      label: "Our approach",
      title: "Alongside communities. At every step.",
      description: "By strengthening the capacities of women, young people and producers, GECA contributes to more resilient, inclusive and sustainable places.",
      photo: { ...temporaryPhotos.planting, alt: "Gloved hands planting a seedling — temporary illustration, unrelated to a GECA activity." },
      photoLabel: "Helping local action grow",
      items: [
        { title: "Start with local realities", description: "Community needs and local resources guide our actions. GECA places people at the heart of the sustainable management of their environment." },
        { title: "Share practical knowledge", description: "Awareness raising, environmental education and training give women, young people and producers practical ways to take action." },
        { title: "Build for the long term", description: "Community nurseries, agroecological practices and local governance: we connect restoration work with the skills of the people who sustain it." },
      ],
    },
    domains: {
      label: "Our focus areas",
      title: "Actions that work together.",
      description: "From ecosystem restoration to local development, our six focus areas connect nature and communities.",
      items: [
        { title: "Ecosystem restoration", description: "Restore degraded land, protect forests and biodiversity through reforestation and community nurseries." },
        { title: "Climate & resilience", description: "Adapt to climate change and reduce its effects on communities." },
        { title: "Agroecology & sustainable agriculture", description: "Support producers in adopting practices that protect soils." },
        { title: "Natural resources", description: "Encourage sustainable management of water, land and forests." },
        { title: "Environmental education", description: "Raise awareness, share knowledge and train people to take action." },
        { title: "Governance & communities", description: "Strengthen environmental governance and local development with communities." },
      ],
    },
    closing: {
      label: "Take action together",
      title: "A sustainable future is a shared endeavour.",
      description: "Do you share this commitment to nature and communities? Let’s talk about your idea, your local area or opportunities to work together.",
      contact: "Let’s discuss your idea",
      home: "Back to the homepage",
    },
  },
} as const;

// Catalogue : mêmes projets et statuts que le brief ; aucune déduction de statut par date.
// Traductions proposées, périodes et partenaires à confirmer avant publication.
export const projectTranslationsEn: Record<string, Pick<Project, "title" | "zone" | "partner" | "description">> = {
  kounounkan: {
    title: "Income-generating activities around the future Kounounkan Plateaux National Park",
    zone: "Kounounkan Plateaux",
    partner: "World Bank",
    description: "Support communities in developing economic activities linked to the protection of their local area.",
  },
  "appui-social-nature": {
    title: "Social support and nature protection project",
    zone: "Guinea · location to be confirmed",
    partner: "ALCOA Foundation",
    description: "Combine support for communities with the protection of natural resources.",
  },
  "planification-climatique": {
    title: "Integrating climate change into local planning in Lower Guinea",
    zone: "Lower Guinea",
    partner: "ANAFIC",
    description: "Support local authorities in including climate issues in their development priorities.",
  },
  protemo: {
    title: "Moussayah Territory Project — PROTEMO",
    zone: "Moussayah",
    partner: "Embassy of France in Guinea and Sierra Leone",
    description: "Support local development that connects environmental protection with community development.",
  },
};

// Page unique : textes FR repris de l’accueil ; traductions sans ajout factuel.
export const portfolioContent = {
  fr: {
    breadcrumb: "Fil d’Ariane",
    label: homeContent.hero.description,
    title: homeContent.projects.label,
    metadata: homeContent.projects.description,
    introduction: homeContent.projects.description,
    catalogLabel: homeContent.projects.label,
    catalogTitle: homeContent.projects.title,
    notice: "Périodes, statuts et partenaires à confirmer par GECA avant publication.",
    statuses: { current: homeContent.projects.statusCurrent, completed: homeContent.projects.statusCompleted },
    count: homeContent.projects.count,
    region: "Territoire",
    period: "Période",
    partner: homeContent.projects.partner,
    objective: "L’objectif du projet",
    photo: homeContent.projects.photo,
    closingLabel: homeContent.cta.label,
    closingTitle: homeContent.cta.partnerTitle,
    closingDescription: homeContent.cta.partnerText,
    contact: interfaceText.fr.contact,
    about: "À propos",
  },
  en: {
    breadcrumb: "Breadcrumb",
    label: "Restore ecosystems · Strengthen communities",
    title: "Projects & programmes",
    metadata: "Discover the initiatives we carry out with communities and our partners.",
    introduction: "Discover the initiatives we carry out with communities and our partners.",
    catalogLabel: "Projects & programmes",
    catalogTitle: "On the ground, change takes root.",
    notice: "Periods, statuses and partners to be confirmed by GECA before publication.",
    statuses: { current: "Ongoing", completed: "Completed" },
    count: "projects shown",
    region: "Location",
    period: "Period",
    partner: "With",
    objective: "The project’s objective",
    photo: "GECA project photo",
    closingLabel: "Take action",
    closingTitle: "Do you have a project in Guinea?",
    closingDescription: "Let’s build solutions together that serve local areas and communities.",
    contact: interfaceText.en.contact,
    about: "About us",
  },
} as const;

export function getPortfolioProjects(locale: Locale): readonly Project[] {
  if (locale === "fr") return projects;
  return projects.map((project) => ({
    ...project,
    ...projectTranslationsEn[project.slug],
    photo: project.photo ? {
      ...project.photo,
      alt: "Temporary illustration, unrelated to a GECA project or its location.",
    } : undefined,
  }));
}

// Développement éditorial des six domaines du brief, sans nouveaux résultats annoncés.
export const interventionContent = {
  fr: {
    metadata: "Les six domaines d’intervention de Global EcoAction : restauration des écosystèmes, climat, agroécologie, ressources naturelles, éducation et gouvernance locale.",
    breadcrumb: "Fil d’Ariane",
    about: "À propos",
    label: "Nature & communautés",
    title: "Nos domaines d’intervention",
    introduction: "Protéger la nature et améliorer les conditions de vie avancent ensemble. En Guinée, GECA relie six domaines complémentaires pour accompagner les communautés vers des territoires plus durables.",
    contents: "Explorer nos six domaines",
    priorities: "Nos priorités",
    back: "Revenir aux domaines",
    closing: {
      label: "Des domaines à l’action",
      title: "Ensemble, donnons vie à ces engagements.",
      description: "Découvrez les projets présentés par GECA ou échangeons sur les besoins de votre territoire. Chaque action commence par une réalité locale et une volonté commune.",
      projects: "Découvrir nos projets",
      contact: "Échanger avec GECA",
    },
  },
  en: {
    metadata: "Global EcoAction’s six focus areas: ecosystem restoration, climate, agroecology, natural resources, environmental education and local governance.",
    breadcrumb: "Breadcrumb",
    about: "About us",
    label: "Nature & communities",
    title: "Our focus areas",
    introduction: "Protecting nature and improving living conditions go hand in hand. In Guinea, GECA connects six complementary areas to support communities in building more sustainable places.",
    contents: "Explore our six focus areas",
    priorities: "Our priorities",
    back: "Back to focus areas",
    closing: {
      label: "From priorities to action",
      title: "Together, bring these commitments to life.",
      description: "Explore the projects presented by GECA or talk to us about the needs of your local area. Every action starts with local realities and a shared commitment.",
      projects: "Explore our projects",
      contact: "Talk to GECA",
    },
  },
} as const;

type DomainId = (typeof homeContent.domains.items)[number]["id"];
type InterventionDetail = { body: string; priorities: readonly string[] };

const interventionDetails: Record<Locale, Record<DomainId, InterventionDetail>> = {
  fr: {
    "restauration-ecosystemes": {
      body: "Les forêts et les terres vivantes abritent la biodiversité et soutiennent la vie des communautés. Pour GECA, leur restauration associe la protection de la nature à la participation des populations. Le reboisement et les pépinières communautaires font partie de cette démarche : faire grandir les arbres, mais aussi les capacités locales qui permettent d’en prendre soin.",
      priorities: ["Restaurer les terres dégradées par le reboisement.", "Soutenir les pépinières communautaires et les savoir-faire locaux.", "Relier la protection des forêts à celle de la biodiversité."],
    },
    "climat-resilience": {
      body: "Face au changement climatique, les communautés ont besoin de moyens pour s’adapter et préserver leurs conditions de vie. La résilience, c’est cette capacité à faire face aux difficultés et à se relever. GECA relie cet enjeu à la restauration des écosystèmes, à la gestion des ressources et au renforcement des capacités locales.",
      priorities: ["Renforcer la compréhension des enjeux climatiques.", "Accompagner l’adaptation aux réalités des territoires.", "Relier la protection des écosystèmes à la résilience des communautés."],
    },
    agroecologie: {
      body: "Produire tout en préservant les sols, l’eau et la biodiversité : c’est le sens de l’agroécologie. GECA place l’accompagnement des producteurs au cœur de ce domaine. La transmission des connaissances et les pratiques agricoles durables contribuent à rapprocher les besoins des populations de la protection des terres dont elles dépendent.",
      priorities: ["Accompagner les producteurs vers des pratiques agroécologiques.", "Préserver les sols et les ressources nécessaires à l’agriculture.", "Partager les savoir-faire pour une agriculture durable."],
    },
    "ressources-naturelles": {
      body: "L’eau, les terres et les forêts sont des ressources essentielles au quotidien. Leur gestion durable consiste à répondre aux besoins d’aujourd’hui tout en préservant leur avenir. GECA place les populations au cœur de cette responsabilité, en reliant la protection de l’environnement aux réalités et aux besoins du développement local.",
      priorities: ["Encourager une gestion durable de l’eau, des terres et des forêts.", "Renforcer la place des communautés dans la gestion des ressources.", "Associer préservation de la nature et besoins locaux."],
    },
    "education-environnementale": {
      body: "Comprendre son environnement aide à mieux le protéger. La sensibilisation, l’éducation et la formation donnent aux personnes des repères pour agir dans leur quotidien. GECA relie le partage des connaissances au renforcement des capacités des femmes, des jeunes et des producteurs, pour que chacun puisse prendre part à la protection de la nature.",
      priorities: ["Sensibiliser aux liens entre environnement et conditions de vie.", "Transmettre les connaissances et les savoir-faire utiles pour agir.", "Renforcer les capacités des femmes, des jeunes et des producteurs."],
    },
    "gouvernance-communautes": {
      body: "Les décisions sur l’environnement concernent les personnes qui vivent avec ses ressources. La gouvernance environnementale, c’est la manière de prendre ces décisions et d’organiser l’action collective. GECA encourage une place active des communautés pour relier protection de la nature, participation locale et amélioration des conditions de vie.",
      priorities: ["Placer les populations au cœur de la gestion de leur environnement.", "Renforcer la participation et les capacités d’action locales.", "Faire de la protection de l’environnement un moteur du développement local."],
    },
  },
  en: {
    "restauration-ecosystemes": {
      body: "Forests and healthy land support biodiversity and community life. For GECA, restoring them connects nature protection with local participation. Reforestation and community nurseries are part of this approach: growing trees while building the local skills needed to care for them.",
      priorities: ["Restore degraded land through reforestation.", "Support community nurseries and local knowledge.", "Connect forest protection with biodiversity conservation."],
    },
    "climat-resilience": {
      body: "Communities need ways to adapt to climate change and protect their living conditions. Resilience means being able to face difficulties and recover. GECA connects this challenge with ecosystem restoration, resource management and stronger local capacities.",
      priorities: ["Build understanding of climate challenges.", "Support adaptation suited to local realities.", "Connect ecosystem protection with community resilience."],
    },
    agroecologie: {
      body: "Producing food while protecting soils, water and biodiversity is at the heart of agroecology. GECA places support for producers at the centre of this work. Sharing knowledge and encouraging sustainable farming practices helps connect people’s needs with the protection of the land they depend on.",
      priorities: ["Support producers in adopting agroecological practices.", "Protect soils and the resources agriculture relies on.", "Share practical knowledge for sustainable farming."],
    },
    "ressources-naturelles": {
      body: "Water, land and forests are essential to everyday life. Managing them sustainably means meeting today’s needs while protecting their future. GECA places communities at the heart of this responsibility, linking environmental protection with the realities and needs of local development.",
      priorities: ["Encourage sustainable management of water, land and forests.", "Strengthen the role of communities in resource management.", "Connect nature conservation with local needs."],
    },
    "education-environnementale": {
      body: "Understanding our environment helps us protect it. Awareness raising, education and training give people practical knowledge to act in their daily lives. GECA connects knowledge sharing with stronger capacities for women, young people and producers, so that everyone can take part in protecting nature.",
      priorities: ["Raise awareness of the links between the environment and living conditions.", "Share knowledge and practical skills for action.", "Build the capacities of women, young people and producers."],
    },
    "gouvernance-communautes": {
      body: "Environmental decisions affect the people who live with local resources. Environmental governance is how these decisions are made and collective action is organised. GECA encourages communities to play an active role, connecting nature protection, local participation and better living conditions.",
      priorities: ["Place people at the heart of managing their environment.", "Strengthen local participation and the capacity to act.", "Make environmental protection a driver of local development."],
    },
  },
};

export function getInterventionAreas(locale: Locale) {
  return homeContent.domains.items.map((item, index) => ({
    ...item,
    ...aboutContent[locale].domains.items[index],
    ...interventionDetails[locale][item.id],
    photo: locale === "fr" ? item.photo : {
      ...item.photo,
      alt: `Image for the ${aboutContent.en.domains.items[index].title} focus area.`,
    },
  }));
}
