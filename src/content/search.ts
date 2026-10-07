import { teamContent, teamMembers, clientPhotoSources, aboutContent, contactContent, getInterventionAreas, getPortfolioProjects, homeContent, href, identity, interfaceText, interventionContent, missionVisionContent, organizationFacts, partnershipContent, portfolioContent, routes, territorialExperience, type Locale } from "./site";
import type { SearchDocument } from "@/lib/search";

// Liste exclusivement publique, construite au rendu serveur. Jamais de fichier interne.
export function getSearchDocuments(locale: Locale): SearchDocument[] {
  const documents: SearchDocument[] = [];
  const add = (path: string, title: string, category: string, text: string, anchor = "") => {
    if (path && !routes.some((route) => route.path === path)) return;
    documents.push({ title, category, text, href: `${href(locale, path)}${anchor ? `#${anchor}` : ""}` });
  };
  const about = aboutContent[locale], mission = missionVisionContent[locale];
  const areas = interventionContent[locale], portfolio = portfolioContent[locale];
  const partner = partnershipContent[locale], contact = contactContent[locale];
  for (const route of routes) {
    if (route.path === "recherche") continue;
    add(route.path, route[locale], "Page", route[locale]);
  }
  add("", interfaceText[locale].home, identity.name, locale === "fr" ? `${homeContent.hero.title} ${homeContent.hero.titleSecondLine} ${homeContent.hero.introduction}` : interfaceText.en.footerDescription);
  add("a-propos", about.history.title, about.pageName, `${Object.values(organizationFacts[locale]).join(" ")} ${about.history.paragraphs.join(" ")} ${about.history.conviction}`, "notre-histoire");
  add("a-propos", about.approach.title, about.pageName, about.approach.items.map((item) => `${item.title} ${item.description}`).join(" "));
  for (const area of getInterventionAreas(locale)) add("a-propos/domaines-intervention", area.title, areas.title, `${area.description} ${area.detail}`, area.id);
  for (const key of ["mission", "vision"] as const) add("a-propos/mission-vision-valeurs", mission[key].title, mission.title, `${mission[key].summary} ${mission[key].paragraphs.join(" ")}`, `notre-${key}`);
  for (const value of mission.values) add("a-propos/mission-vision-valeurs", value.title, mission.valuesLabel, `${value.summary} ${value.detail}`, "nos-valeurs");
  for (const project of getPortfolioProjects(locale)) add("projets", project.title, portfolio.title, `${project.description} ${project.zone} ${project.period} ${project.partner}`, `projet-${project.slug}`);
  for (const member of teamMembers) add("equipe", member.name, teamContent[locale].pageTitle, member.role[locale], member.id);
  const experience = territorialExperience[locale];
  add("projets", experience.title, portfolio.title, `${experience.introduction} ${experience.achievements.join(" ")}`, "experience-kounounkan-moussayah");
  add("devenir-partenaire", partner.strengthsTitle, locale === "fr" ? "Partenariat" : "Partnership", `${partner.positioning} ${partner.strengths.join(" ")}`);
  add("contact", contact.title, interfaceText[locale].contact, `${contact.description} ${identity.address[locale]} ${identity.phone} ${identity.email}`);
  add("mentions-legales", locale === "fr" ? "Crédits photo" : "Photo credits", identity.name, Object.values(clientPhotoSources).map((photo) => photo[locale]).join(" "), "credits-photo");
  if (locale === "fr") {
    add("", `${homeContent.impact.title} ${homeContent.impact.titleSecondLine}`, homeContent.impact.label, `${homeContent.impact.stats.map((stat) => `${stat.value} ${stat.label}`).join(" · ")} ${homeContent.impact.achievements.join(" ")}`, "impact-title");
    add("", homeContent.partners.title, homeContent.partners.label, homeContent.partners.items.map((item) => item.name).join(" "), "partners-title");
    for (const item of homeContent.news.items) add("", item.title, homeContent.news.label, item.description, "news-title");
  }
  return documents;
}
