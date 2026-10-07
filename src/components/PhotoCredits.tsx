import { clientPhotoSources, missionVisionContent, teamMembers, type Locale } from "@/content/site";
import { SectionHeading } from "./ui";

export function PhotoCredits({ locale }: { locale: Locale }) {
  const text = missionVisionContent[locale];
  return (
    <section id="credits-photo" className="photo-credits" aria-label={locale === "fr" ? "Crédits photo" : "Photo credits"}>
      <SectionHeading label="Global EcoAction" title={locale === "fr" ? "Crédits photo" : "Photo credits"} />
      <p data-reveal>{locale === "fr"
        ? "Photographies issues des documents « 1 IMAGES.pdf », « PIC.docx » et « IMAGES BM AGR.docx », transmis par Gassama le 6 octobre 2026 pour utilisation sur le site. Les descriptions reprennent les légendes et les scènes visibles. Photographe et licence non précisés dans les documents."
        : "Photographs from “1 IMAGES.pdf”, “PIC.docx” and “IMAGES BM AGR.docx”, provided by Gassama on 6 October 2026 for use on the website. Descriptions follow the captions and visible scenes. Photographer and licence are not specified in the documents."}</p>
      <p data-reveal>{locale === "fr"
        ? "La mention « Illustration du thème » signale une photo choisie pour son sujet : elle n’atteste pas le projet, sa période ou les résultats présentés. Les photos des actualités en préparation n’annoncent pas un nouvel événement."
        : "The label “Thematic illustration” identifies a photo chosen for its subject: it does not document the project, its period or the results shown. Photos accompanying news in preparation do not announce a new event."}</p>
      <p data-reveal>{locale === "fr"
        ? `Portraits de ${teamMembers.map((member) => member.name).join(", ")}, transmis par Gassama le 7 octobre 2026 pour la rubrique Équipe. Photographes et licences non précisés. Redimensionnement et compression pour le site ; métadonnées retirées et recadrage à l’affichage.`
        : `Portraits of ${teamMembers.map((member) => member.name).join(", ")}, provided by Gassama on 7 October 2026 for the Team section. Photographers and licences not specified. Resized and compressed for the website; metadata removed and cropped for display.`}</p>
      <ul className="photo-credits-list" role="list">
        {Object.entries(clientPhotoSources).map(([key, photo]) => {
          return (
            <li className="mission-value-card card-content" key={key}>
              <h3>{photo[locale]}</h3>
              <p>{photo.source} — {photo.reference}</p>
              <p>{text.photoChanges}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
