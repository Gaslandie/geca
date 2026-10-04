import { missionVisionContent, type Locale } from "@/content/site";
import { SectionHeading } from "./ui";

export function PhotoCredits({ locale }: { locale: Locale }) {
  const text = missionVisionContent[locale];
  return (
    <section id="credits-photo" className="photo-credits" aria-label={locale === "fr" ? "Crédits photo" : "Photo credits"}>
      <SectionHeading label={text.title} title={locale === "fr" ? "Crédits photo" : "Photo credits"} />
      <ul className="photo-credits-list" role="list">
        {(["mission", "vision"] as const).map((key) => {
          const photo = text[key].photo;
          return (
            <li className="mission-value-card card-content" key={key}>
              <h3>{photo.caption}</h3>
              <p><a href={photo.source}>{key === "mission" ? "Rachel the tireless tree planter, Kenya photo 2" : "Fouta Djallon"}</a> — {photo.author}</p>
              <p><a href={photo.licenseUrl}>{photo.license}</a></p>
              <p>{text.photoChanges}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
