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
  foundedOn: { fr: "14 décembre 2016", en: "14 December 2016" },
  renamedOn: { fr: "26 août 2026", en: "26 August 2026" },
  address: {
    fr: "Kissosso, commune de Matoto, Conakry, République de Guinée",
    en: "Kissosso, municipality of Matoto, Conakry, Republic of Guinea",
  },
  phone: "+224 628 40 03 87",
  phoneHref: "tel:+224628400387",
  email: "ong.geca@gmail.com",
};

// Précisions fournies par Gassama dans le chat du 4 octobre 2026.
export const organizationFacts = {
  fr: {
    creation: `Notre organisation a été créée le ${identity.foundedOn.fr}. Depuis le ${identity.renamedOn.fr}, RENASCEDD a adopté la nouvelle dénomination Global EcoAction (GECA), sans changement de mission, d’objectifs ni de continuité opérationnelle.`,
    location: `Son siège est à ${identity.address.fr}. L’organisation intervient dans plusieurs régions naturelles et préfectures du pays.`,
    capacities: "Notre équipe administrative et de terrain dispose de compétences en sociologie, ingénierie environnementale et agroforesterie. Elle est complétée au besoin par des consultants spécialisés.",
  },
  en: {
    creation: `Our organisation was founded on ${identity.foundedOn.en}. On ${identity.renamedOn.en}, RENASCEDD adopted the new name Global EcoAction (GECA), with no change to its mission or objectives and no interruption to its operations.`,
    location: `Its headquarters are in ${identity.address.en}. The organisation works in several natural regions and prefectures of the country.`,
    capacities: "Our administrative and field team has expertise in sociology, environmental engineering and agroforestry. It is supplemented by specialised consultants as needed.",
  },
} as const;

// Registre fermé : une URL inconnue ne devient jamais une rubrique valide.
const sectionRoutes = [
  { path: "a-propos", fr: "Qui sommes-nous ?", en: "About us" },
  {
    path: "a-propos/mission-vision-valeurs",
    fr: "Mission, vision et valeurs",
    en: "Mission, vision and values",
  },
  {
    path: "a-propos/domaines-intervention",
    fr: "Domaines d’expertise",
    en: "Areas of expertise",
  },
  { path: "equipe", fr: "Équipe", en: "Team" },
  { path: "projets", fr: "Projets & programmes", en: "Projects & programmes" },
  { path: "actualites", fr: "Actualités", en: "News" },
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
      back: "Back to the homepage",
      contact: "Contact GECA",
    },
  },
} as const;

export type LocalPhoto = {
  src: `/${string}`;
  alt: string;
  temporary?: boolean;
  contextLabel?: string;
};

export const temporaryImageLabel = "Image temporaire";

// Photos extraites des trois fichiers client fournis le 6 octobre 2026.
// Légendes, liens confirmés et illustrations de thème : docs/IMAGES-CLIENT.md.
export const clientPhotoSources = {
  "hero-gbara-champ": { src: "/images/client/hero-gbara-champ.jpg", source: "1 IMAGES.pdf", reference: "page 47", fr: "Aménagement du champ maraîcher à Gbara.", en: "Preparing the market garden in Gbara." },
  "hero-gbara-entretien": { src: "/images/client/hero-gbara-entretien.jpg", source: "1 IMAGES.pdf", reference: "page 59, figure 1", fr: "Entretien avec le groupement maraîcher de Gbara.", en: "Discussion with the market-gardening group in Gbara." },
  "hero-bassia-travail": { src: "/images/client/hero-bassia-travail.jpg", source: "1 IMAGES.pdf", reference: "page 39", fr: "Travail dans un champ maraîcher à Bassia.", en: "People working in a market garden in Bassia." },
  "hero-gbara-arrosage": { src: "/images/client/hero-gbara-arrosage.jpg", source: "1 IMAGES.pdf", reference: "page 51", fr: "Arrosage des pépinières de piment à Gbara.", en: "Watering pepper nurseries in Gbara." },
  "hero-bassia-groupe": { src: "/images/client/hero-bassia-groupe.jpg", source: "1 IMAGES.pdf", reference: "page 34", fr: "Vue de groupe dans un champ maraîcher à Bassia.", en: "Group in a market garden in Bassia." },
  "bassia-travail-champ": { src: "/images/client/bassia-travail-champ.jpg", source: "1 IMAGES.pdf", reference: "page 42", fr: "Travail collectif dans un champ maraîcher à Bassia.", en: "People working together in a market garden in Bassia." },
  "bassia-maraichage": { src: "/images/client/bassia-maraichage.jpg", source: "1 IMAGES.pdf", reference: "page 43", fr: "Plantation de jeunes plants dans un champ maraîcher à Bassia.", en: "Young seedlings being planted in a market garden in Bassia." },
  "formation-groupements": { src: "/images/client/formation-groupements.jpg", source: "1 IMAGES.pdf", reference: "page 1", fr: "Session de formation des groupements locaux en plein air.", en: "Outdoor training session for local groups." },
  "moussayah-concertation": { src: "/images/client/moussayah-concertation.jpg", source: "1 IMAGES.pdf", reference: "page 32", fr: "Réunion pour la mise en place des comités de gestion des plaintes à Moussayah.", en: "Meeting to establish grievance management committees in Moussayah." },
  "allassoyah-materiels": { src: "/images/client/allassoyah-materiels.jpg", source: "1 IMAGES.pdf", reference: "page 14", fr: "Remise de matériels agricoles aux groupements à Allassoyah.", en: "Agricultural equipment being handed over to groups in Allassoyah." },
  "gbara-visite": { src: "/images/client/gbara-visite.jpg", source: "1 IMAGES.pdf", reference: "page 6", fr: "Visite du site d’activité du groupement à Gbara.", en: "Visit to the group’s activity site in Gbara." },
  "gbara-arrosage": { src: "/images/client/gbara-arrosage.jpg", source: "1 IMAGES.pdf", reference: "page 50", fr: "Arrosage des pépinières de piment à Gbara.", en: "Watering pepper nurseries in Gbara." },
  "bassia-champ": { src: "/images/client/bassia-champ.jpg", source: "1 IMAGES.pdf", reference: "page 44", fr: "Vue du champ maraîcher de Bassia, entouré de végétation.", en: "View of the market garden in Bassia, surrounded by vegetation." },
  "gorede-saponification": { src: "/images/client/gorede-saponification.jpg", source: "IMAGES BM AGR.docx", reference: "image 12", fr: "Remise de matériels de saponification à Görèdè.", en: "Soap-making equipment being handed over in Görèdè." },
  "kolaboui-materiels": { src: "/images/client/kolaboui-materiels.jpg", source: "PIC.docx", reference: "image 8", fr: "Remise de matériels agricoles aux femmes bénéficiaires à Kolaboui.", en: "Agricultural equipment being handed over to women beneficiaries in Kolaboui." },
  "moussayah-dialogue": { src: "/images/client/moussayah-dialogue.jpg", source: "PIC.docx", reference: "image 1", fr: "Réunion de concertation à Moussayah lors de la visite de la Fédération des Parcs Naturels Régionaux de France.", en: "Consultation meeting in Moussayah during a visit by the Federation of Regional Nature Parks of France." },
  "moussayah-pepiniere": { src: "/images/client/moussayah-pepiniere.jpg", source: "PIC.docx", reference: "image 6", fr: "Pépinière à Moussayah centre 2.", en: "Plant nursery in Moussayah centre 2." },
  "moussayah-ombrieres": { src: "/images/client/moussayah-ombrieres.jpg", source: "PIC.docx", reference: "image 5", fr: "Construction d’ombrières dans une pépinière à Moussayah centre 2.", en: "Building shade structures in a nursery in Moussayah centre 2." },
  "khimbeli-consultation": { src: "/images/client/khimbeli-consultation.jpg", source: "PIC.docx", reference: "image 27", fr: "Consultation communautaire à Khimbéli.", en: "Community consultation in Khimbéli." },
  "formation-maraichage": { src: "/images/client/formation-maraichage.jpg", source: "PIC.docx", reference: "image 22", fr: "Formation aux techniques maraîchères des femmes bénéficiaires de Kolaboui et Sangarédi.", en: "Market-gardening training for women beneficiaries from Kolaboui and Sangarédi." },
  "tabekhoure-champ": { src: "/images/client/tabekhoure-champ.jpg", source: "1 IMAGES.pdf", reference: "page 56", fr: "Aménagement d’un champ maraîcher à Tabékhouré.", en: "Preparing a market garden in Tabékhouré." },
} as const;

function clientPhoto(key: keyof typeof clientPhotoSources, locale: Locale = "fr", illustrative = false) {
  const photo = clientPhotoSources[key];
  const contextLabel = illustrative ? (locale === "fr" ? "Illustration du thème" : "Thematic illustration") : undefined;
  return { src: photo.src, alt: contextLabel ? `${contextLabel} : ${photo[locale]}` : photo[locale], caption: photo[locale], contextLabel };
}

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

// Source prioritaire : docs/TEXTES-AUTHENTIQUES-CLIENT.md, reçu le 4 octobre 2026.
// Les descriptions françaises reprennent les huit phrases intégrales du client.
// Les titres sont des repères courts ; l’anglais est une traduction fidèle.
const expertiseAreas: readonly {
  id: string;
  photo?: LocalPhoto;
  fr: { title: string; description: string; detail: string };
  en: { title: string; description: string; detail: string };
}[] = [
  {
    id: "ressources-naturelles",
    photo: interventionPhotos["ressources-naturelles"],
    fr: { title: "Gestion durable des ressources naturelles", description: "Gestion durable des ressources naturelles : forêts, sols et eau.", detail: "Notre action associe la préservation des forêts, la restauration des terres dégradées et la protection des ressources en eau. Elle s’appuie sur l’implication des communautés et la gouvernance locale pour relier la protection des écosystèmes à l’amélioration des conditions de vie." },
    en: { title: "Sustainable natural resource management", description: "Sustainable management of natural resources: forests, soils and water.", detail: "Our work combines forest conservation, the restoration of degraded land and the protection of water resources. It draws on community involvement and local governance to connect ecosystem protection with improved living conditions." },
  },
  {
    id: "restauration-ecosystemes",
    photo: interventionPhotos["restauration-ecosystemes"],
    fr: { title: "Restauration des écosystèmes", description: "Restauration des écosystèmes et reboisement communautaire.", detail: "Nous associons les communautés à la restauration des sites dégradés et à la mise en place de pépinières. Le reboisement contribue à lutter contre l’érosion, à protéger les ressources en eau et à renforcer la biodiversité, tout en étant lié à des activités génératrices de revenus." },
    en: { title: "Ecosystem restoration", description: "Ecosystem restoration and community reforestation.", detail: "We involve communities in restoring degraded sites and establishing nurseries. Reforestation helps combat erosion, protect water resources and strengthen biodiversity, while being linked to income-generating activities." },
  },
  {
    id: "climat-resilience",
    photo: interventionPhotos["climat-resilience"],
    fr: { title: "Changement climatique", description: "Adaptation et atténuation des effets du changement climatique à l’échelle locale.", detail: "Nous relions la restauration écologique et les pratiques agricoles adaptées au climat au renforcement des capacités locales. La sensibilisation, la formation et le suivi accompagnent aussi l’intégration du changement climatique et de l’inclusion sociale dans les Plans de Développement Local." },
    en: { title: "Climate change", description: "Adaptation to and mitigation of the effects of climate change at the local level.", detail: "We connect ecological restoration and climate-adapted farming practices with local capacity building. Awareness raising, training and monitoring also support the integration of climate change and social inclusion into Local Development Plans." },
  },
  {
    id: "agroecologie",
    photo: clientPhoto("bassia-maraichage"),
    fr: { title: "Agroécologie et agriculture durable", description: "Agroécologie, agriculture durable et accompagnement des producteurs.", detail: "Nous accompagnons les producteurs et les groupements dans des pratiques agricoles durables et adaptées au climat. Notre expérience comprend l’agroforesterie, le maraîchage et la production de plants fruitiers, en lien avec l’amélioration des conditions économiques et de la sécurité alimentaire." },
    en: { title: "Agroecology and sustainable agriculture", description: "Agroecology, sustainable agriculture and support for producers.", detail: "We support producers and groups in sustainable, climate-adapted farming practices. Our experience includes agroforestry, market gardening and fruit seedling production, linked to improved economic conditions and food security." },
  },
  {
    id: "education-environnementale",
    photo: clientPhoto("formation-groupements"),
    fr: { title: "Éducation environnementale", description: "Éducation environnementale, sensibilisation et formation communautaire.", detail: "Nous associons l’éducation environnementale au renforcement des capacités des communautés et des acteurs locaux. Les actions de sensibilisation et de formation portent notamment sur le changement climatique et l’inclusion sociale, en lien avec la participation aux décisions et à la planification locale." },
    en: { title: "Environmental education", description: "Environmental education, awareness raising and community training.", detail: "We combine environmental education with capacity building for communities and local stakeholders. Awareness raising and training address climate change and social inclusion in particular, alongside participation in local decision-making and planning." },
  },
  {
    id: "gouvernance-communautes",
    photo: clientPhoto("moussayah-concertation"),
    fr: { title: "Gouvernance environnementale", description: "Gouvernance environnementale, concertation territoriale et médiation entre acteurs.", detail: "Notre approche participative favorise le dialogue entre communautés, autorités locales et partenaires. L’expérience de PROTEMO comprend un cadre de concertation, une cartographie des acteurs et une charte du territoire, pour articuler préservation des ressources naturelles et développement local." },
    en: { title: "Environmental governance", description: "Environmental governance, territorial consultation and mediation between stakeholders.", detail: "Our participatory approach encourages dialogue between communities, local authorities and partners. Our PROTEMO experience includes a consultation framework, stakeholder mapping and a territorial charter to connect natural resource conservation with local development." },
  },
  {
    id: "appui-communautes",
    photo: { ...interventionPhotos["gouvernance-communautes"], alt: "Illustration réutilisée pour le domaine Appui aux communautés affectées." },
    fr: { title: "Appui aux communautés affectées", description: "Appui aux communautés affectées par les projets miniers et de développement, notamment sur les droits, la gestion foncière et la prévention des conflits.", detail: "Nous contribuons à renforcer la participation citoyenne et la défense des droits des communautés, notamment au sein du CODEC. Notre expérience comprend également un appui financier et technique aux femmes agricultrices affectées par l’exploitation minière, associé à une agriculture adaptée au climat." },
    en: { title: "Support for affected communities", description: "Support for communities affected by mining and development projects, particularly regarding rights, land management and conflict prevention.", detail: "We help strengthen civic participation and the defence of community rights, notably within CODEC. Our experience also includes financial and technical support for women farmers affected by mining, combined with climate-adapted agriculture." },
  },
  {
    id: "revenus-resilience",
    photo: clientPhoto("allassoyah-materiels"),
    fr: { title: "Revenus et résilience socio-économique", description: "Développement d’activités génératrices de revenus et renforcement de la résilience socio-économique.", detail: "Nous relions la restauration écologique au développement d’activités économiques locales. L’accompagnement comprend la structuration des groupements et l’appui technique aux activités génératrices de revenus, avec une expérience du maraîchage, des pépinières à vocation économique et du stockage des productions agricoles." },
    en: { title: "Income and socio-economic resilience", description: "Development of income-generating activities and strengthening of socio-economic resilience.", detail: "We connect ecological restoration with the development of local economic activities. Support includes organising groups and providing technical assistance for income-generating activities, with experience in market gardening, commercially oriented nurseries and agricultural produce storage." },
  },
];

export function getInterventionAreas(locale: Locale) {
  return expertiseAreas.map((area) => ({
    id: area.id,
    ...area[locale],
    photo: area.photo && (locale === "fr" ? area.photo : {
      ...area.photo,
      alt: Object.values(clientPhotoSources).find((photo) => photo.src === area.photo?.src)?.en
        ?? `Image for the ${area.en.title} area of expertise.`,
    }),
  }));
}

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
    fr: clientPhoto("tabekhoure-champ"),
    en: clientPhoto("tabekhoure-champ", "en"),
  },
  forest: {
    fr: clientPhoto("moussayah-pepiniere"),
    en: clientPhoto("moussayah-pepiniere", "en"),
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
    map: {
      title: "Géolocalisation",
      description: "Carte du quartier de Kissosso.",
      show: "Afficher la carte",
      directions: "Ouvrir l’itinéraire",
    },
    closingLabel: identity.name,
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
    map: {
      title: "Location",
      description: "Map of the Kissosso neighbourhood.",
      show: "Show the map",
      directions: "Get directions",
    },
    closingLabel: identity.name,
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
  status: "current" | "completed" | null;
  description: string;
  photo?: LocalPhoto;
};

// Références authentiques du 4 octobre 2026 : docs/TEXTES-AUTHENTIQUES-CLIENT.md.
// Quatre statuts du brief initial conservés ; null signifie aucun statut fourni.
export const projects: readonly Project[] = [
  {
    slug: "kounounkan",
    photo: clientPhoto("gorede-saponification"),
    zone: "Plateaux de Kounounkan",
    status: "current",
    title: "Accompagner la mise en œuvre des activités génératrices de revenus (AGR) en périphérie du futur Parc national des plateaux de Kounounkan",
    period: "2025-2026",
    description: "Amélioration des conditions économiques et de la sécurité alimentaire, structuration des groupements, appui technique aux AGR, gestion des plaintes et prévention des VBG.",
    partner: "Banque mondiale",
  },
  {
    slug: "appui-social-nature",
    photo: clientPhoto("kolaboui-materiels"),
    zone: "Guinée · zone à préciser",
    status: "current",
    title: "Projet d’appui social et protection de la nature",
    period: "2025-2026",
    description: "Appui financier et technique aux femmes agricultrices affectées par l’exploitation minière, agriculture adaptée au climat, éducation environnementale et restauration écologique.",
    partner: "Fondation ALCOA",
  },
  {
    slug: "planification-climatique",
    photo: temporaryPhotos.fields,
    zone: "Basse-Guinée",
    status: "completed",
    title: "Sensibilisation des acteurs locaux (élus, OSC, femmes et jeunes) sur l'intégration du changement climatique dans la planification locale dans la région de la Basse-Guinée",
    period: "2024-2025",
    description: "Sensibilisation, formation et suivi pour l’intégration du changement climatique et de l’inclusion sociale dans les Plans de Développement Local (PDL) de 84 collectivités.",
    partner: "ANAFIC",
  },
  {
    slug: "protemo",
    photo: clientPhoto("moussayah-dialogue", "fr", true),
    zone: "Moussayah",
    status: "completed",
    title: "Projet de Territoire de Moussayah - PROTEMO",
    period: "2023-2024",
    description: "Développement territorial participatif conciliant gouvernance environnementale, opportunités économiques et préservation des ressources naturelles.",
    partner: "Ambassade de France en Guinée et Sierra Leone",
  },
  {
    slug: "reboisement-communautaire",
    photo: clientPhoto("moussayah-pepiniere", "fr", true),
    zone: "Boffa, Kindia, Forécariah, Mamou et Faranah",
    status: null,
    title: "Reboisement communautaire de 550 000 arbres",
    period: "2019, 2020 et 2021",
    description: "Le projet de reboisement communautaire à grande échelle, mis en œuvre sur trois ans dans les régions de Boffa, Kindia, Forécariah, Mamou et Faranah, a permis la plantation de 550 000 arbres : 35 000 en 2019, 365 000 en 2020 et 150 000 en 2021.\n\nLe projet visait à restaurer les terres dégradées, lutter contre l’érosion, protéger les écosystèmes et les ressources en eau, renforcer la biodiversité et contribuer à la séquestration du carbone. Réalisé avec l’implication des communautés locales, il devait également favoriser la création d’activités génératrices de revenus liées aux produits forestiers et à l’écotourisme.",
    partner: "Reforest’Action",
  },
  {
    slug: "piscca",
    photo: clientPhoto("moussayah-ombrieres", "fr", true),
    zone: "Moussayah",
    status: null,
    title: "Lutte contre la dégradation de l’environnement pour un développement durable dans la sous-préfecture de Moussayah - Projet Innovant des Sociétés Civiles et Coalition d’Acteurs (PISCCA)",
    period: "2021-2022",
    description: "Renforcement de la résilience environnementale à travers le reboisement, la promotion de pratiques agricoles durables, la sensibilisation des communautés, la restauration des écosystèmes et l’amélioration de la gestion des ressources naturelles, avec une forte implication des communautés et des autorités locales.",
    partner: "Ambassade de France en Guinée et Sierra Leone",
  },
  {
    slug: "droits-communautes",
    photo: clientPhoto("khimbeli-consultation", "fr", true),
    zone: "Guinée",
    status: null,
    title: "Défense des droits des communautés impactées par des projets de développement",
    period: "Depuis 2018",
    description: "Participation au consortium Collectif des Organisations pour la Défense des Droits des communautés (CODEC), visant à renforcer la participation citoyenne et à promouvoir les droits des communautés impactées par les projets de développement en Guinée.",
    partner: "11th HOUR PROJECT",
  },
];

// Message client reçu via « MESSAGE POUR LA PAGE D'ACCUEIL.docx » le 3 octobre 2026.
// Répartition éditoriale et provenance : docs/CONTENU-CLIENT.md.
export const homeContent = {
  hero: {
    label: identity.name,
    title: "AGIR POUR",
    titleSecondLine: "UN AVENIR DURABLE",
    description: "Restaurer les écosystèmes · Renforcer les communautés",
    introduction:
      "En Guinée, nous agissons avec les communautés pour restaurer les terres dégradées, protéger les forêts et la biodiversité. Grâce au reboisement, à l’agroécologie et au renforcement des capacités, nous contribuons à améliorer les conditions de vie.",
    photo: clientPhoto("bassia-travail-champ"),
    slides: [clientPhoto("hero-bassia-travail"), clientPhoto("hero-gbara-arrosage"), clientPhoto("hero-bassia-groupe"), clientPhoto("hero-gbara-champ"), clientPhoto("hero-gbara-entretien")],
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
      `Global EcoAction (GECA), anciennement RENASCEDD, est une ONG guinéenne créée le ${identity.foundedOn.fr}. Nous agissons aux côtés des communautés pour restaurer les écosystèmes, protéger la biodiversité et améliorer les conditions de vie.`,
    cta: "À propos de GECA",
    sideLabel: "Notre signature",
    sideText: "Global EcoAction — Agir pour un avenir durable.",
    since: "Aux côtés des communautés depuis",
  },
  domains: {
    label: "Nos expertises",
    title: "Domaines d’expertise",
    cta: "Découvrir ce domaine",
    description: "Découvrez nos huit domaines d’expertise.",
    items: getInterventionAreas("fr"),
  },
  impact: {
    label: "Notre impact",
    title: "Réalisations et",
    titleSecondLine: "résultats marquants",
    photo: clientPhoto("moussayah-pepiniere", "fr", true),
    // Résultats authentiques reçus le 4 octobre 2026 ; référence dans docs/TEXTES-AUTHENTIQUES-CLIENT.md.
    stats: [
      { value: "35 000", label: "arbres plantés en 2019" },
      { value: "365 000", label: "arbres plantés en 2020" },
      { value: "150 000", label: "arbres plantés en 2021" },
      { value: "84", label: "collectivités accompagnées" },
    ],
    // RECOMMANDATIONS.docx, reçu le 6 octobre 2026 : ordre et contenu du client.
    achievements: [
      "Restauration des forêts dégradées, lutte contre l’érosion, protection des écosystèmes et des ressources en eau, renforcement de la biodiversité et contribution à la séquestration du carbone.",
      "Développement territorial participatif conciliant gouvernance environnementale, opportunités économiques et préservation des ressources naturelles.",
      "Sensibilisation, formation et suivi pour l’intégration du changement climatique et de l’inclusion sociale dans les Plans de Développement Local (PDL) de 84 collectivités.",
      "Appui financier et technique aux femmes agricultrices affectées par l’exploitation minière, agriculture adaptée au climat, éducation environnementale et restauration écologique.",
      "Amélioration des conditions économiques et de la sécurité alimentaire, structuration des groupements, appui technique aux AGR, gestion des plaintes et prévention des VBG.",
    ],
  },
  projects: {
    label: "Projets & programmes",
    title: "Sélection de références récentes",
    description:
      "Découvrez les initiatives que nous menons avec les communautés et nos partenaires.",
    current: "En cours",
    completed: "Réalisés",
    filters: "Filtrer les projets",
    statusCurrent: "En cours",
    statusCompleted: "Réalisé",
    partner: "Partenaire / bailleur :",
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
  news: {
    label: "Actualités",
    title: "La vie de GECA.",
    description:
      "Retrouvez les repères de notre organisation et les actions documentées au fil des années.",
    cta: "Voir toutes les actualités",
    items: projects.slice(0, 2).map((project) => ({
      title: project.title,
      description: project.description,
      path: `actualites/projet-${project.slug}`,
      category: "Projets & programmes",
      period: project.period,
      photo: project.photo,
    })),
  },
  partners: {
    label: "Nos partenaires",
    title: "Ensemble, nous allons plus loin.",
    description:
      "Restaurer les écosystèmes et améliorer les conditions de vie des communautés est un travail collectif. Nos collaborations avec des partenaires institutionnels, techniques et financiers accompagnent ces actions en Guinée.",
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
      {
        name: "Ministère de l’Environnement et du Développement Durable – MEDD",
        logo: {
          src: "/images/partners/medd.png",
          alt: "Logo du Ministère de l’Environnement et du Développement Durable – MEDD",
          width: 496,
          height: 127,
        },
      },
      {
        name: "Office Guinéen des Parcs Nationaux et Réserves de Faune – OGPNRF",
        logo: {
          src: "/images/partners/ogpnrf.jpg",
          alt: "Logo de l’Office Guinéen des Parcs Nationaux et Réserves de Faune – OGPNRF",
          width: 260,
          height: 271,
        },
      },
      {
        name: "11th Hour Project",
        logo: {
          src: "/images/partners/11th-hour-project.png",
          alt: "Logo de 11th Hour Project",
          width: 618,
          height: 156,
        },
      },
      {
        name: "Collectif des Organisations pour la Défense des Droits des communautés – CODEC",
        logo: {
          src: "/images/partners/codec.png",
          alt: "Logo du CODEC",
          width: 159,
          height: 113,
        },
      },
      {
        name: "CNOSCG",
        logo: {
          src: "/images/partners/cnoscg.png",
          alt: "Logo du CNOSCG",
          width: 277,
          height: 175,
        },
      },
      {
        name: "ARBORIA PROJECT",
        logo: {
          src: "/images/partners/arboria-project.jpg",
          alt: "Logo d’ARBORIA PROJECT",
          width: 1007,
          height: 482,
        },
      },
      {
        name: "Parcs naturels régionaux de France",
        logo: {
          src: "/images/partners/parcs-naturels-regionaux-france.jpg",
          alt: "Logo des Parcs naturels régionaux de France",
          width: 288,
          height: 340,
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
  discover: ["a-propos", "equipe", "projets", "actualites"],
  resources: [
    "devenir-partenaire",
    "nous-soutenir",
  ],
  legal: ["mentions-legales", "confidentialite", "plan-du-site"],
};

// Formulations validées par Gassama le 4 octobre 2026, développées à partir des textes client.
export const missionVisionContent = {
  "fr": {
    "title": "Mission, vision et valeurs",
    "label": "Notre cap",
    "introduction": "Restaurer les écosystèmes, renforcer les communautés et construire un avenir durable en Guinée.",
    "mission": {
      "label": "Ce que nous faisons",
      "title": "Notre mission",
      "summary": "Agir avec les communautés en Guinée pour restaurer les écosystèmes, protéger la biodiversité et améliorer les conditions de vie, grâce à l’agroécologie, à l’adaptation climatique et à une gestion participative des ressources naturelles.",
      "paragraphs": [
        "Notre action associe la restauration des terres dégradées, le reboisement communautaire et la gestion durable des forêts, des sols et de l’eau. L’agroécologie et l’accompagnement des producteurs relient la préservation de ces ressources aux activités dont vivent les communautés.",
        "L’éducation environnementale, la formation et la concertation territoriale complètent cette action. Elles accompagnent la participation des communautés, la gouvernance locale et le développement d’activités génératrices de revenus."
      ],
      "photo": clientPhoto("gbara-arrosage", "fr")
    },
    "vision": {
      "label": "L’avenir auquel nous contribuons",
      "title": "Notre vision",
      "summary": "Une Guinée où les écosystèmes sont préservés et restaurés, et où les communautés disposent de moyens d’existence durables et participent pleinement au développement de leurs territoires.",
      "paragraphs": [
        "Cette vision relie l’avenir des écosystèmes à celui des communautés. Elle associe la conservation de la biodiversité, la résilience climatique et le développement économique local, pour que la protection de la nature contribue à l’amélioration des conditions de vie.",
        "Elle donne une place centrale à l’inclusion sociale et à la participation aux décisions locales. Les femmes, les jeunes, les producteurs et les communautés affectées par les projets de développement sont concernés par la gestion et l’avenir de leurs territoires."
      ],
      "photo": clientPhoto("bassia-champ", "fr")
    },
    "valuesLabel": "Nos valeurs",
    "valuesTitle": "Les principes qui guident nos actions",
    "values": [
      {
        "title": "Participation communautaire",
        "summary": "Construire les actions avec les communautés et renforcer leur rôle dans les décisions.",
        "detail": "Cette participation s’appuie sur la concertation territoriale, la gouvernance locale et le renforcement des capacités. Les communautés prennent part à la gestion des ressources naturelles et aux actions qui concernent leurs territoires."
      },
      {
        "title": "Inclusion et respect des droits",
        "summary": "Prendre en compte les femmes, les jeunes et les communautés affectées par les projets de développement.",
        "detail": "L’inclusion sociale accompagne les actions de formation et de développement local. L’appui aux communautés affectées porte notamment sur les droits, la gestion foncière et la prévention des conflits."
      },
      {
        "title": "Respect de la nature",
        "summary": "Préserver la biodiversité, les forêts, les sols et l’eau.",
        "detail": "La restauration écologique, le reboisement communautaire et les pratiques agricoles durables traduisent cet engagement. Ils relient la protection des écosystèmes à une gestion durable des ressources naturelles."
      },
      {
        "title": "Concertation et coopération",
        "summary": "Favoriser le dialogue entre communautés, autorités et partenaires.",
        "detail": "La concertation territoriale et la médiation entre acteurs permettent d’aborder ensemble les enjeux locaux. Cette démarche s’inscrit dans les collaborations de GECA avec des partenaires institutionnels, techniques et financiers."
      },
      {
        "title": "Durabilité",
        "summary": "Rechercher des effets qui se maintiennent dans le temps, pour les écosystèmes et les moyens d’existence.",
        "detail": "Le renforcement des capacités, la responsabilisation communautaire et le développement d’activités génératrices de revenus participent à cette recherche. L’approche de GECA relie la résilience des communautés à la durabilité des investissements."
      }
    ],
    "projects": "Découvrir nos projets",
    "partner": "Devenir partenaire",
    "photoChanges": "Photos redimensionnées et compressées ; recadrage à l’affichage."
  },
  "en": {
    "title": "Mission, vision and values",
    "label": "Our direction",
    "introduction": "Restoring ecosystems, strengthening communities and building a sustainable future in Guinea.",
    "mission": {
      "label": "What we do",
      "title": "Our mission",
      "summary": "Work with communities in Guinea to restore ecosystems, protect biodiversity and improve living conditions through agroecology, climate adaptation and participatory natural resource management.",
      "paragraphs": [
        "Our work combines the restoration of degraded land, community reforestation and the sustainable management of forests, soils and water. Agroecology and support for producers connect the protection of these resources with the activities that sustain community livelihoods.",
        "Environmental education, training and territorial consultation complement this work. They support community participation, local governance and the development of income-generating activities."
      ],
      "photo": clientPhoto("gbara-arrosage", "en")
    },
    "vision": {
      "label": "The future we contribute to",
      "title": "Our vision",
      "summary": "A Guinea where ecosystems are protected and restored, and where communities have sustainable livelihoods and participate fully in the development of their territories.",
      "paragraphs": [
        "This vision connects the future of ecosystems with that of communities. It brings together biodiversity conservation, climate resilience and local economic development, so that protecting nature contributes to better living conditions.",
        "It places social inclusion and participation in local decisions at its heart. Women, young people, producers and communities affected by development projects have a stake in the management and future of their territories."
      ],
      "photo": clientPhoto("bassia-champ", "en")
    },
    "valuesLabel": "Our values",
    "valuesTitle": "The principles that guide our actions",
    "values": [
      {
        "title": "Community participation",
        "summary": "Develop actions with communities and strengthen their role in decision-making.",
        "detail": "This participation draws on territorial consultation, local governance and capacity building. Communities take part in natural resource management and in actions affecting their territories."
      },
      {
        "title": "Inclusion and respect for rights",
        "summary": "Take into account women, young people and communities affected by development projects.",
        "detail": "Social inclusion accompanies training and local development activities. Support for affected communities addresses rights, land management and conflict prevention in particular."
      },
      {
        "title": "Respect for nature",
        "summary": "Protect biodiversity, forests, soils and water.",
        "detail": "Ecological restoration, community reforestation and sustainable agricultural practices put this commitment into action. They connect ecosystem protection with sustainable natural resource management."
      },
      {
        "title": "Dialogue and cooperation",
        "summary": "Encourage dialogue between communities, authorities and partners.",
        "detail": "Territorial consultation and mediation between stakeholders enable local issues to be addressed together. This approach is reflected in GECA’s collaborations with institutional, technical and financial partners."
      },
      {
        "title": "Sustainability",
        "summary": "Seek lasting effects for ecosystems and livelihoods.",
        "detail": "Capacity building, community empowerment and income-generating activities contribute to this aim. GECA’s approach connects community resilience with the sustainability of investments."
      }
    ],
    "projects": "Explore our projects",
    "partner": "Become a partner",
    "photoChanges": "Photos resized and compressed; cropped for display."
  }
} as const;

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
    photo: clientPhoto("gbara-visite"),
    photoLabel: "Les territoires au cœur de notre engagement",
    sinceLabel: "Engagés depuis",
    sinceDescription: "Une ONG guinéenne, ancrée dans les réalités de ses territoires.",
    location: identity.address.fr,
    explore: "Découvrir notre histoire",
    history: {
      label: "Notre histoire",
      title: "De RENASCEDD à Global EcoAction.",
      paragraphs: [
        organizationFacts.fr.creation,
        "Notre engagement repose sur une conviction : préserver les ressources naturelles et améliorer les conditions de vie sont deux objectifs qui avancent ensemble. Les terres, les forêts et la biodiversité font partie du quotidien des communautés ; leur avenir se construit avec elles.",
      ],
      convictionLabel: "Notre conviction",
      conviction: "Faire de la protection de l’environnement un moteur de développement et d’amélioration des conditions de vie.",
      details: [
        { title: "Notre implantation", description: organizationFacts.fr.location },
        { title: "Nos capacités", description: organizationFacts.fr.capacities },
      ],
    },
    purpose: {
      label: "Notre cap",
      title: "Restaurer aujourd’hui. Construire demain.",
      description: "Un même engagement pour des écosystèmes vivants et des communautés capables de préparer leur avenir.",
      missionLabel: "Notre mission",
      missionTitle: "Restaurer la nature, renforcer les communautés.",
      mission: missionVisionContent.fr.mission.summary,
      visionLabel: "Notre ambition",
      visionTitle: "Des territoires résilients, inclusifs et durables.",
      vision: missionVisionContent.fr.vision.summary,
    },
    approach: {
      label: homeContent.approach.label,
      title: homeContent.approach.title,
      description: homeContent.approach.description,
      photo: clientPhoto("gbara-arrosage"),
      photoLabel: "Faire grandir les actions locales",
      items: [
        { title: "Partir des réalités locales", description: "Les besoins des communautés et les ressources du territoire orientent les actions. GECA place les populations au cœur de la gestion durable de leur environnement." },
        { title: "Partager les savoir-faire", description: "La sensibilisation, l’éducation environnementale et la formation donnent aux femmes, aux jeunes et aux producteurs des moyens concrets d’agir." },
        { title: "Inscrire les actions dans la durée", description: "Pépinières communautaires, pratiques agroécologiques et gouvernance locale : nous relions les actions de restauration aux capacités des personnes qui les font vivre." },
      ],
    },
    domains: {
      label: homeContent.domains.label,
      title: "Domaines d’expertise",
      description: "Découvrez nos huit domaines d’expertise.",
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
    introduction: `Global EcoAction (GECA), formerly RENASCEDD, is a Guinean NGO founded on ${identity.foundedOn.en}. We work alongside communities to restore ecosystems, protect biodiversity and improve living conditions.`,
    photo: clientPhoto("gbara-visite", "en"),
    photoLabel: "Local landscapes at the heart of our work",
    sinceLabel: "Committed since",
    sinceDescription: "A Guinean NGO rooted in the realities of its local communities and landscapes.",
    location: identity.address.en,
    explore: "Discover our story",
    history: {
      label: "Our story",
      title: "From RENASCEDD to Global EcoAction.",
      paragraphs: [
        organizationFacts.en.creation,
        "Our work is guided by a conviction: protecting natural resources and improving living conditions go hand in hand. Land, forests and biodiversity are part of communities’ daily lives; their future must be built together.",
      ],
      convictionLabel: "Our conviction",
      conviction: "Make environmental protection a driver of development and better living conditions.",
      details: [
        { title: "Where we work", description: organizationFacts.en.location },
        { title: "Our capabilities", description: organizationFacts.en.capacities },
      ],
    },
    purpose: {
      label: "Our direction",
      title: "Restore today. Build for tomorrow.",
      description: "A shared commitment to thriving ecosystems and communities with the means to shape their future.",
      missionLabel: "Our mission",
      missionTitle: "Restore nature, strengthen communities.",
      mission: missionVisionContent.en.mission.summary,
      visionLabel: "Our ambition",
      visionTitle: "Resilient, inclusive and sustainable places.",
      vision: missionVisionContent.en.vision.summary,
    },
    approach: {
      label: "Our approach",
      title: "Alongside communities. At every step.",
      description: "By strengthening the capacities of women, young people and producers, GECA contributes to more resilient, inclusive and sustainable places.",
      photo: clientPhoto("gbara-arrosage", "en"),
      photoLabel: "Helping local action grow",
      items: [
        { title: "Start with local realities", description: "Community needs and local resources guide our actions. GECA places people at the heart of the sustainable management of their environment." },
        { title: "Share practical knowledge", description: "Awareness raising, environmental education and training give women, young people and producers practical ways to take action." },
        { title: "Build for the long term", description: "Community nurseries, agroecological practices and local governance: we connect restoration work with the skills of the people who sustain it." },
      ],
    },
    domains: {
      label: "Our expertise",
      title: "Areas of expertise",
      description: "Explore our eight areas of expertise.",
      items: getInterventionAreas("en"),
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

// Traductions des sept références authentiques, sans ajout factuel ni statut déduit.
export const projectTranslationsEn: Record<string, Pick<Project, "title" | "zone" | "period" | "partner" | "description">> = {
  "kounounkan": {
    title: "Support the implementation of income-generating activities (IGAs) around the future Kounounkan Plateaux National Park",
    zone: "Kounounkan Plateaux",
    period: "2025-2026",
    partner: "World Bank",
    description: "Improving economic conditions and food security, structuring groups, providing technical support for IGAs, handling complaints and preventing gender-based violence.",
  },
  "appui-social-nature": {
    title: "Social support and nature protection project",
    zone: "Guinea · location to be confirmed",
    period: "2025-2026",
    partner: "ALCOA Foundation",
    description: "Financial and technical support for women farmers affected by mining, climate-adapted agriculture, environmental education and ecological restoration.",
  },
  "planification-climatique": {
    title: "Raising awareness among local stakeholders (elected representatives, civil society organisations, women and young people) about integrating climate change into local planning in the Lower Guinea region",
    zone: "Lower Guinea",
    period: "2024-2025",
    partner: "ANAFIC",
    description: "Awareness raising, training and monitoring to integrate climate change and social inclusion into the Local Development Plans (LDPs) of 84 local authorities.",
  },
  "protemo": {
    title: "Moussayah Territory Project - PROTEMO",
    zone: "Moussayah",
    period: "2023-2024",
    partner: "Embassy of France in Guinea and Sierra Leone",
    description: "Participatory territorial development combining environmental governance, economic opportunities and the preservation of natural resources.",
  },
  "reboisement-communautaire": {
    title: "Community reforestation with 550,000 trees",
    zone: "Boffa, Kindia, Forécariah, Mamou and Faranah",
    period: "2019, 2020 and 2021",
    partner: "Reforest’Action",
    description: "The large-scale community reforestation project, implemented over three years in the regions of Boffa, Kindia, Forécariah, Mamou and Faranah, resulted in the planting of 550,000 trees: 35,000 in 2019, 365,000 in 2020 and 150,000 in 2021.\n\nThe project aimed to restore degraded land, combat erosion, protect ecosystems and water resources, strengthen biodiversity and contribute to carbon sequestration. Carried out with the involvement of local communities, it was also intended to support the creation of income-generating activities related to forest products and ecotourism.",
  },
  "piscca": {
    title: "Combating environmental degradation for sustainable development in the sub-prefecture of Moussayah - Innovative Civil Society Projects and Coalitions of Actors (PISCCA)",
    zone: "Moussayah",
    period: "2021-2022",
    partner: "Embassy of France in Guinea and Sierra Leone",
    description: "Strengthening environmental resilience through reforestation, the promotion of sustainable agricultural practices, community awareness raising, ecosystem restoration and improved natural resource management, with strong involvement from communities and local authorities.",
  },
  "droits-communautes": {
    title: "Defending the rights of communities affected by development projects",
    zone: "Guinea",
    period: "Since 2018",
    partner: "11th HOUR PROJECT",
    description: "Participation in the consortium Collectif des Organisations pour la Défense des Droits des communautés (CODEC), which aims to strengthen civic participation and promote the rights of communities affected by development projects in Guinea.",
  },
};

// Page unique : références du client et traductions sans ajout factuel.
export const partnershipContent = {
  fr: {
    title: "Devenir partenaire",
    label: "Partenariat",
    strengthsTitle: "Atouts pour un partenariat avec un bailleur",
    strengths: [
      "Ancrage communautaire et expérience de terrain dans des contextes ruraux, environnementaux et miniers.",
      "Capacité à articuler conservation de la biodiversité, résilience climatique, inclusion sociale et développement économique local.",
      "Expérience de collaboration avec des partenaires institutionnels, techniques et financiers nationaux et internationaux.",
      "Approche participative privilégiant la gouvernance locale, la responsabilisation communautaire et la durabilité des investissements.",
    ],
    positioningTitle: "Positionnement",
    positioning: "GECA se positionne comme un partenaire de mise en œuvre capable d’accompagner des programmes associant restauration des écosystèmes, adaptation climatique, agroécologie, gouvernance territoriale et amélioration des moyens d’existence des communautés en Guinée.",
    contact: "Nous contacter",
    projects: "Découvrir nos projets",
  },
  en: {
    title: "Become a partner",
    label: "Partnership",
    strengthsTitle: "Strengths for a partnership with a funder",
    strengths: [
      "Community roots and field experience in rural, environmental and mining contexts.",
      "Ability to combine biodiversity conservation, climate resilience, social inclusion and local economic development.",
      "Experience of working with national and international institutional, technical and financial partners.",
      "A participatory approach that prioritises local governance, community empowerment and the sustainability of investments.",
    ],
    positioningTitle: "Positioning",
    positioning: "GECA positions itself as an implementing partner capable of supporting programmes that combine ecosystem restoration, climate adaptation, agroecology, territorial governance and improved livelihoods for communities in Guinea.",
    contact: "Contact us",
    projects: "Explore our projects",
  },
} as const;

export const portfolioContent = {
  fr: {
    breadcrumb: "Fil d’Ariane",
    label: homeContent.hero.description,
    title: homeContent.projects.label,
    metadata: homeContent.projects.description,
    introduction: homeContent.projects.description,
    catalogLabel: homeContent.projects.label,
    catalogTitle: homeContent.projects.title,
    notice: "Statuts des projets à confirmer par GECA.",
    statuses: { current: homeContent.projects.statusCurrent, completed: homeContent.projects.statusCompleted },
    count: homeContent.projects.count,
    region: "Territoire",
    period: "Période",
    partner: "Partenaire / bailleur",
    objective: "Objet principal",
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
    catalogTitle: "Selected recent references",
    notice: "Project statuses to be confirmed by GECA.",
    statuses: { current: "Ongoing", completed: "Completed" },
    count: "projects shown",
    region: "Location",
    period: "Period",
    partner: "Partner / funder",
    objective: "Main purpose",
    photo: "GECA project photo",
    closingLabel: "Take action",
    closingTitle: "Do you have a project in Guinea?",
    closingDescription: "Let’s build solutions together that serve local areas and communities.",
    contact: interfaceText.en.contact,
    about: "About us",
  },
} as const;

// Texte client du 4 octobre 2026 ; la traduction ne remplace pas la source française.
export const territorialExperience = {
  fr: {
    label: "Expérience territoriale",
    title: "Expérience spécifique à Kounounkan - Moussayah",
    introduction: "GECA dispose d’une expérience continue dans la zone de Kounounkan - Moussayah, où elle a combiné diagnostic territorial, conservation, restauration écologique et développement local. Cette expérience comprend notamment :",
    achievements: [
      "Une étude diagnostique des communautés riveraines de Kounounkan, réalisée sur fonds propres en 2020.",
      "La mise en place de pépinières à vocation économique, le développement de l’agroforesterie, du maraîchage et de la production de plants fruitiers.",
      "La construction d’un magasin agricole destiné au stockage et à la conservation des productions locales.",
      "Le reboisement de 50 000 plants et le développement d’activités génératrices de revenus avec deux groupements locaux dans le cadre du projet PISCCA.",
      "La mise en œuvre de PROTEMO, incluant un cadre de concertation, une cartographie des acteurs, une charte du territoire et des actions de reboisement portant sur 300 000 plants au niveau des têtes de source, cours d’eau et zones communautaires dégradées.",
    ],
  },
  en: {
    label: "Territorial experience",
    title: "Specific experience in Kounounkan - Moussayah",
    introduction: "GECA has ongoing experience in the Kounounkan - Moussayah area, where it has combined territorial assessment, conservation, ecological restoration and local development. This experience includes:",
    achievements: [
      "A diagnostic study of communities bordering Kounounkan, funded from the organisation’s own resources in 2020.",
      "The establishment of income-generating nurseries and the development of agroforestry, market gardening and fruit tree seedling production.",
      "The construction of an agricultural warehouse for storing and preserving local produce.",
      "Reforestation involving 50,000 seedlings and the development of income-generating activities with two local groups as part of the PISCCA project.",
      "The implementation of PROTEMO, including a consultation framework, stakeholder mapping, a territorial charter and reforestation activities involving 300,000 seedlings around springs, watercourses and degraded community areas.",
    ],
  },
} as const;

export function getPortfolioProjects(locale: Locale): readonly Project[] {
  if (locale === "fr") return projects;
  return projects.map((project) => {
    const source = Object.values(clientPhotoSources).find((photo) => photo.src === project.photo?.src);
    return {
      ...project,
      ...projectTranslationsEn[project.slug],
      photo: project.photo ? {
        ...project.photo,
        alt: source ? `${project.photo.contextLabel ? "Thematic illustration: " : ""}${source.en}`
          : "Temporary illustration, unrelated to a GECA project or its location.",
        contextLabel: project.photo.contextLabel ? "Thematic illustration" : undefined,
      } : undefined,
    };
  });
}

// Présentation des huit domaines authentiques, partagés avec l’accueil et À propos.
export const interventionContent = {
  fr: {
    metadata: "Les huit domaines d’expertise de Global EcoAction : ressources naturelles, restauration, climat, agroécologie, éducation, gouvernance, appui aux communautés et résilience socio-économique.",
    breadcrumb: "Fil d’Ariane",
    about: "À propos",
    label: "Nature & communautés",
    title: "Nos domaines d’expertise",
    introduction: "Découvrez nos huit domaines d’expertise.",
    overview: "Global EcoAction agit aux côtés des communautés en Guinée pour restaurer les écosystèmes, préserver la biodiversité et améliorer les conditions de vie. Nos domaines d’expertise associent gestion durable des ressources naturelles, adaptation climatique, agroécologie et développement économique local. L’éducation environnementale, la concertation territoriale et l’appui aux communautés affectées par les projets miniers et de développement complètent cette approche participative, attentive à l’inclusion sociale et à la durabilité des actions.",
    closing: {
      label: "Des domaines à l’action",
      title: "Ensemble, donnons vie à ces engagements.",
      description: "Découvrez les projets présentés par GECA ou échangeons sur les besoins de votre territoire. Chaque action commence par une réalité locale et une volonté commune.",
      projects: "Découvrir nos projets",
      contact: "Échanger avec GECA",
    },
  },
  en: {
    metadata: "Global EcoAction’s eight areas of expertise: natural resources, restoration, climate, agroecology, education, governance, community support and socio-economic resilience.",
    breadcrumb: "Breadcrumb",
    about: "About us",
    label: "Nature & communities",
    title: "Our areas of expertise",
    introduction: "Explore our eight areas of expertise.",
    overview: "Global EcoAction works alongside communities in Guinea to restore ecosystems, protect biodiversity and improve living conditions. Our areas of expertise combine sustainable natural resource management, climate adaptation, agroecology and local economic development. Environmental education, territorial consultation and support for communities affected by mining and development projects complement this participatory approach, with attention to social inclusion and lasting action.",
    closing: {
      label: "From priorities to action",
      title: "Together, bring these commitments to life.",
      description: "Explore the projects presented by GECA or talk to us about the needs of your local area. Every action starts with local realities and a shared commitment.",
      projects: "Explore our projects",
      contact: "Talk to GECA",
    },
  },
} as const;


// Portrait et identité fournis par Gassama le 7 octobre 2026.
export const teamMembers = [
  {
    id: "mohamed-makale-kaba",
    name: "Mohamed Makalé KABA",
    role: { fr: "Directeur Exécutif", en: "Executive Director" },
    photo: { src: "/images/team/mohamed-makale-kaba.jpg", width: 1300, height: 1209 },
  },
  {
    id: "daouda-toure",
    name: "Daouda TOURE",
    role: { fr: "Responsable suivi-évaluation", en: "Monitoring and Evaluation Manager" },
    photo: { src: "/images/team/daouda-toure.jpg", width: 1024, height: 1536 },
  },
  {
    id: "salifou-camara",
    name: "Salifou CAMARA",
    role: { fr: "Assistant programme", en: "Programme Assistant" },
    photo: { src: "/images/team/salifou-camara.jpg", width: 1024, height: 1536 },
  },
  {
    id: "mohamed-lamine-sacko",
    name: "Mohamed Lamine SACKO",
    role: { fr: "Comptable", en: "Accountant" },
    photo: { src: "/images/team/mohamed-lamine-sacko.jpg", width: 1086, height: 1448 },
  },
  {
    id: "mariame-djelo-diallo",
    name: "Mariame Djélo DIALLO",
    role: { fr: "Chargée de communication", en: "Communications Officer" },
    photo: { src: "/images/team/mariame-djelo-diallo.jpg", width: 1536, height: 1024 },
  },
  {
    id: "fode-baba-sylla",
    name: "Fodé Baba SYLLA",
    role: { fr: "Assistant administratif", en: "Administrative Assistant" },
    photo: { src: "/images/team/fode-baba-sylla.jpg", width: 1292, height: 1218 },
  },
  {
    id: "ibrahima-kaba",
    name: "Ibrahima KABA",
    role: { fr: "Responsable des programmes", en: "Programme Manager" },
    photo: { src: "/images/team/ibrahima-kaba.jpg", width: 1254, height: 1254 },
  },
  {
    id: "archille-delamou",
    name: "Archille DELAMOU",
    role: { fr: "Responsable logistique", en: "Logistics Manager" },
    photo: { src: "/images/team/archille-delamou.jpg", width: 1086, height: 1448 },
  },
] as const;

export const teamContent = {
  fr: { label: "Notre équipe", title: "Les femmes et les hommes de GECA", all: "Découvrir l’équipe", pageTitle: "Notre équipe" },
  en: { label: "Our team", title: "The people of GECA", all: "Meet the team", pageTitle: "Our team" },
} as const;


// Archives demandées le 7 octobre 2026. Les périodes ne sont pas des dates de publication.
export const newsContent = {
  fr: {
    title: "Actualités",
    label: "La vie de GECA",
    introduction: "De 2016 à 2026, retrouvez les repères de notre organisation et les actions documentées au fil des années.",
    archiveTitle: "Repères et actions documentés",
    archiveLabel: "Nos archives",
    notice: "Les périodes indiquées sont celles des projets, et non des dates de publication. Ces archives rassemblent les informations disponibles ; elles ne constituent pas un relevé exhaustif des actualités.",
    organization: "Vie de l’organisation",
    project: "Projets & programmes",
    projectLink: "Voir la référence du projet",
    aboutLink: "Découvrir notre histoire",
    period: "Période du projet",
    date: "Date du repère",
    partner: "Partenaire / bailleur",
    breadcrumb: "Fil d’Ariane",
    readArticle: "Lire l’article",
    backToNews: "Toutes les actualités",
    previous: "Actualité précédente",
    next: "Actualité suivante",
    articleNavigation: "Navigation entre les actualités",
    zone: "Zone d’intervention",
  },
  en: {
    title: "News",
    label: "GECA’s story",
    introduction: "From 2016 to 2026, explore milestones in our organisation’s history and documented activities over the years.",
    archiveTitle: "Milestones and documented activities",
    archiveLabel: "Our archives",
    notice: "The periods shown are project periods, not publication dates. These archives bring together the available information; they are not a complete record of news.",
    organization: "Organisation milestones",
    project: "Projects & programmes",
    projectLink: "View the project reference",
    aboutLink: "Explore our history",
    period: "Project period",
    date: "Milestone date",
    partner: "Partner / funder",
    breadcrumb: "Breadcrumb",
    readArticle: "Read the article",
    backToNews: "All news",
    previous: "Previous article",
    next: "Next article",
    articleNavigation: "Browse news articles",
    zone: "Area of intervention",
  },
} as const;

export type NewsEntry = {
  id: string;
  zone?: string;
  title: string;
  description: string;
  period: string;
  dateTime?: string;
  category: string;
  path: string;
  photo?: LocalPhoto;
  partner?: string;
};

export function getNewsEntries(locale: Locale): readonly NewsEntry[] {
  const text = newsContent[locale];
  const catalog = getPortfolioProjects(locale);
  // Ordre des périodes fournies ; aucune fin ou date de publication déduite.
  const archive = ["kounounkan", "appui-social-nature", "planification-climatique", "protemo", "piscca", "reboisement-communautaire", "droits-communautes"];
  return [
    {
      id: "nouvelle-denomination",
      title: locale === "fr" ? "RENASCEDD devient Global EcoAction" : "RENASCEDD becomes Global EcoAction",
      description: locale === "fr"
        ? `Le ${identity.renamedOn.fr}, RENASCEDD a adopté la nouvelle dénomination Global EcoAction (GECA), sans changement de mission, d’objectifs ni de continuité opérationnelle.`
        : `On ${identity.renamedOn.en}, RENASCEDD adopted the new name Global EcoAction (GECA), with no change to its mission or objectives and no interruption to its operations.`,
      period: identity.renamedOn[locale],
      dateTime: "2026-08-26",
      category: text.organization,
      path: "a-propos#notre-histoire",
    },
    ...archive.flatMap((slug) => {
      const project = catalog.find((item) => item.slug === slug);
      return project ? [{
        id: `projet-${project.slug}`,
        title: project.title,
        description: project.description,
        period: project.period,
        category: text.project,
        path: `projets#projet-${project.slug}`,
        photo: project.photo,
        partner: project.partner,
        zone: project.zone,
      }] : [];
    }),
    {
      id: "creation-organisation",
      title: locale === "fr" ? "Création de l’organisation" : "The organisation is founded",
      description: locale === "fr"
        ? `L’organisation a été créée le ${identity.foundedOn.fr}.`
        : `The organisation was founded on ${identity.foundedOn.en}.`,
      period: identity.foundedOn[locale],
      dateTime: "2016-12-14",
      category: text.organization,
      path: "a-propos#notre-histoire",
    },
  ];
}


// Pages publiques d’actualité : slugs du catalogue fermé, pas d’URL arbitraire.
export const newsArticlePath = (id: string) => `actualites/${id}`;

export function getNewsEntry(locale: Locale, id: string) {
  return getNewsEntries(locale).find((entry) => entry.id === id);
}

export const routes: readonly { path: string; fr: string; en: string }[] = [
  ...sectionRoutes,
  ...getNewsEntries("fr").map((entry) => ({
    path: newsArticlePath(entry.id),
    fr: entry.title,
    en: getNewsEntry("en", entry.id)!.title,
  })),
];

export const newsletterContent = {
  fr: {
    title: "Abonnez-vous à notre newsletter",
    description: "Soyez informé(e) de nos actualités directement par e-mail.",
    email: "Adresse e-mail",
    subscribe: "S’abonner",
    unavailable: "L’inscription à la newsletter n’est pas encore disponible sur cet aperçu.",
  },
  en: {
    title: "Subscribe to our newsletter",
    description: "Receive our news directly by email.",
    email: "Email address",
    subscribe: "Subscribe",
    unavailable: "Newsletter subscription is not yet available on this preview.",
  },
} as const;

// Introductions des pages internes : synthèses des contenus client déjà validés.
export const pageIntroductions = {
  fr: {
    "recherche": "Retrouvez les informations publiques de Global EcoAction à l’aide de la recherche du site. Vous pouvez consulter nos domaines d’expertise, nos projets et programmes, les étapes de notre histoire ou les coordonnées pour nous contacter. La loupe dans la barre de navigation ouvre la recherche et affiche les résultats au fil de votre saisie, sans conserver les mots recherchés.",
    "a-propos": `${aboutContent.fr.introduction} ${organizationFacts.fr.location}`,
    "a-propos/mission-vision-valeurs": `${missionVisionContent.fr.mission.summary} ${missionVisionContent.fr.vision.summary}`,
    "projets": "Nos projets et programmes relient la protection de la nature à l’amélioration des conditions de vie des communautés en Guinée. Reboisement communautaire, restauration des écosystèmes, agroécologie et adaptation climatique s’associent à la formation, à la concertation territoriale et au développement d’activités génératrices de revenus. À Kounounkan et Moussayah, notre expérience combine diagnostic territorial, conservation et développement local. Découvrez les initiatives menées avec les communautés et nos partenaires, leurs objectifs et leurs territoires d’intervention.",
    "devenir-partenaire": `GECA collabore avec des partenaires institutionnels, techniques et financiers nationaux et internationaux. ${partnershipContent.fr.positioning} Notre approche participative privilégie la gouvernance locale, la responsabilisation communautaire et la durabilité des investissements.`,
    "equipe": `${organizationFacts.fr.capacities} ${missionVisionContent.fr.mission.summary} Découvrez les personnes qui composent notre équipe et leurs fonctions au sein de Global EcoAction.`,
    "actualites": "La vie de Global EcoAction se construit au fil de ses engagements auprès des communautés et de ses actions pour la nature en Guinée. Retrouvez les étapes de l’histoire de notre organisation, de sa création en 2016 à l’adoption du nom Global EcoAction en 2026, ainsi que les initiatives de reboisement, d’agroécologie, d’adaptation climatique et de développement local. Chaque article permet de découvrir une étape ou une action, avec ses objectifs et ses repères dans le temps.",
    "contact": `${contactContent.fr.description} Nos échanges peuvent porter sur la restauration des écosystèmes, l’agroécologie, l’adaptation climatique ou le renforcement des capacités des communautés. Retrouvez ci-dessous nos coordonnées à Conakry pour nous contacter et discuter des possibilités de travailler ensemble.`,
    "nous-soutenir": `${missionVisionContent.fr.mission.summary} ${homeContent.cta.supportText} ${aboutContent.fr.closing.description}`,
    "mentions-legales": `${aboutContent.fr.introduction} ${organizationFacts.fr.location}`,
    "confidentialite": "Le formulaire de contact permet de préparer et de prévisualiser un message, sans envoi ni enregistrement de la saisie. Vous pouvez effacer les informations que vous avez renseignées. La recherche du site consulte uniquement les contenus publics, sans conserver les mots recherchés. Lorsque le formulaire newsletter est disponible, l’inscription se poursuit sur une page GECA. L’adresse devient active après confirmation par e-mail. La liste des abonnés est privée et chaque newsletter comprend un lien de désinscription. Pour échanger avec Global EcoAction, vous pouvez utiliser l’adresse e-mail ou le numéro de téléphone indiqués dans la rubrique Contact.",
    "plan-du-site": "Découvrez les rubriques du site de Global EcoAction : notre organisation, notre mission, nos domaines d’expertise, notre équipe et nos projets et programmes. Les actualités permettent de retrouver les étapes de notre histoire et les actions présentées sur le site. Les pages Devenir partenaire et Contact vous orientent pour échanger avec nous et envisager des actions utiles à la nature et aux communautés en Guinée.",
  },
  en: {
    "a-propos": `${aboutContent.en.introduction} ${organizationFacts.en.location}`,
    "recherche": "Find public information about Global EcoAction using the website search. Explore our areas of expertise, projects and programmes, milestones in our history or contact details. The search icon in the navigation bar opens the search panel and shows results as you type, without saving your search terms.",
    "a-propos/mission-vision-valeurs": `${missionVisionContent.en.mission.summary} ${missionVisionContent.en.vision.summary}`,
    "projets": "Our projects and programmes connect nature conservation with better living conditions for communities in Guinea. Community reforestation, ecosystem restoration, agroecology and climate adaptation go hand in hand with training, territorial consultation and income-generating activities. In Kounounkan and Moussayah, our experience combines territorial assessment, conservation and local development. Explore the initiatives carried out with communities and our partners, their objectives and the areas where they take place.",
    "devenir-partenaire": `GECA works with national and international institutional, technical and financial partners. ${partnershipContent.en.positioning} Our participatory approach prioritises local governance, community responsibility and lasting investment.`,
    "equipe": `${organizationFacts.en.capacities} ${missionVisionContent.en.mission.summary} Meet the people who make up our team and discover their roles at Global EcoAction.`,
    "actualites": "Global EcoAction’s story grows through its work alongside communities and its actions for nature in Guinea. Explore milestones in our organisation’s history, from its founding in 2016 to the adoption of the name Global EcoAction in 2026, as well as initiatives in reforestation, agroecology, climate adaptation and local development. Each article introduces a milestone or an activity, with its objectives and the period in which it took place.",
    "contact": `${contactContent.en.description} Our conversations can focus on ecosystem restoration, agroecology, climate adaptation or strengthening community capacities. Find our contact details in Conakry below to get in touch and discuss opportunities to work together.`,
    "nous-soutenir": `${missionVisionContent.en.mission.summary} Every contribution helps advance our mission. ${aboutContent.en.closing.description}`,
    "mentions-legales": `${aboutContent.en.introduction} ${organizationFacts.en.location}`,
    "confidentialite": "The contact form lets you prepare and preview a message without sending it or saving your input. You can clear the information you have entered. The website search uses only public content and does not save your search terms. When the newsletter form is available, registration continues on a GECA page. The address becomes active after email confirmation. The subscriber list is private and each newsletter includes an unsubscribe link. To get in touch with Global EcoAction, use the email address or phone number provided on the Contact page.",
    "plan-du-site": "Explore the sections of the Global EcoAction website: our organisation, mission, areas of expertise, team, and projects and programmes. The news pages present milestones in our history and activities featured on the website. The Become a partner and Contact pages help you get in touch and explore actions that serve nature and communities in Guinea.",
  },
} as const;


// English homepage: faithful translations of the current French content.
// Shared media, project translations and expertise data remain the source of truth.
export function getHomeContent(locale: Locale) {
  if (locale === "fr") return {
    ...homeContent,
    news: { ...homeContent.news, discover: "Découvrir", discoverLabel: "Découvrir les actualités" },
  };
  const translatedProjects = getPortfolioProjects(locale);
  return {
    ...homeContent,
    hero: {
      ...homeContent.hero,
      title: "ACTING FOR",
      titleSecondLine: "A SUSTAINABLE FUTURE",
      description: "Restoring ecosystems · Strengthening communities",
      introduction: "In Guinea, we work with communities to restore degraded land and protect forests and biodiversity. Through reforestation, agroecology and capacity building, we help improve living conditions.",
      primary: "Explore our projects",
      secondary: "Become a partner",
    },
    about: {
      ...homeContent.about,
      label: "Our organisation",
      title: "Who are we?",
      description: `Global EcoAction (GECA), formerly RENASCEDD, is a Guinean NGO founded on ${identity.foundedOn.en}. We work alongside communities to restore ecosystems, protect biodiversity and improve living conditions.`,
      cta: "About GECA",
    },
    domains: {
      ...homeContent.domains,
      label: "Our expertise",
      title: "Areas of expertise",
      cta: "Explore this area",
      description: "Explore our eight areas of expertise.",
      // Reuse precisely the French homepage media, even when the internal page differs.
      items: homeContent.domains.items.map((item) => ({
        ...getInterventionAreas("en").find((area) => area.id === item.id)!,
        photo: item.photo && {
          ...item.photo,
          alt: Object.values(clientPhotoSources).find((source) => source.src === item.photo?.src)?.en
            ?? `Image for the ${getInterventionAreas("en").find((area) => area.id === item.id)!.title} area of expertise.`,
        },
      })),
    },
    impact: {
      ...homeContent.impact,
      label: "Our impact",
      title: "Key achievements",
      titleSecondLine: "and results",
      stats: homeContent.impact.stats.map((stat, index) => ({
        ...stat,
        label: ["trees planted in 2019", "trees planted in 2020", "trees planted in 2021", "local authorities supported"][index],
      })),
      achievements: [
        "Restoration of degraded forests, erosion control, protection of ecosystems and water resources, strengthening of biodiversity and contribution to carbon sequestration.",
        projectTranslationsEn.protemo.description,
        projectTranslationsEn["planification-climatique"].description,
        projectTranslationsEn["appui-social-nature"].description,
        projectTranslationsEn.kounounkan.description,
      ],
    },
    projects: {
      label: "Projects & programmes",
      title: "A selection of recent references",
      description: "Explore the initiatives we carry out with communities and our partners.",
      current: "Ongoing",
      completed: "Completed",
      filters: "Filter projects",
      statusCurrent: "Ongoing",
      statusCompleted: "Completed",
      partner: "Partner / funder:",
      view: "View project",
      all: "View all projects",
      count: "projects displayed",
      photo: "GECA project photo",
    },
    news: {
      ...homeContent.news,
      label: "News",
      title: "GECA’s story.",
      description: "Explore milestones in our organisation’s history and activities documented over the years.",
      cta: "View all news",
      discover: "Explore",
      discoverLabel: "Explore the news",
      items: translatedProjects.slice(0, 2).map((project) => ({
        title: project.title, description: project.description,
        path: `actualites/projet-${project.slug}`, category: "Projects & programmes",
        period: project.period, photo: project.photo,
      })),
    },
    partners: {
      ...homeContent.partners,
      label: "Our partners",
      title: "Together, we go further.",
      description: "Restoring ecosystems and improving communities’ living conditions is a collective effort. Our collaborations with institutional, technical and financial partners support this work in Guinea.",
      // Keep the names supplied by the client; only translate the logo descriptor.
      items: homeContent.partners.items.map((partner) => ({
        ...partner, logo: { ...partner.logo, alt: `Logo: ${partner.name}` },
      })),
    },
    cta: {
      label: "Let’s take action",
      partnerTitle: "Do you have a project in Guinea?",
      partnerText: "Let’s work together on useful solutions for local areas and communities.",
      partnerButton: "Become a partner",
      supportTitle: "Would you like to support our work?",
      supportText: "Every commitment helps advance our mission.",
      supportButton: "Support us",
    },
  };
}

export const partnerCarouselText = {
  fr: { region: "Logos des partenaires", role: "carrousel", previous: "Partenaires précédents", next: "Partenaires suivants", list: "Liste des partenaires", range: (first: number, last: number, total: number) => `Partenaires ${first} à ${last} sur ${total}` },
  en: { region: "Partner logos", role: "carousel", previous: "Previous partners", next: "Next partners", list: "List of partners", range: (first: number, last: number, total: number) => `Partners ${first} to ${last} of ${total}` },
};

export const homeMetadata = {
  fr: { title: "Global EcoAction — Agir ensemble en Guinée", description: "GECA, ONG guinéenne créée en 2016, agit pour la restauration des écosystèmes, la résilience climatique et le développement communautaire." },
  en: { title: "Global EcoAction — Acting together in Guinea", description: "GECA, a Guinean NGO founded in 2016, works on ecosystem restoration, climate resilience and community development." },
} as const;
