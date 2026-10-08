"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { contactContent, identity, type Locale } from "@/content/site";
import { Container, SectionHeading } from "./ui";

const subscribe = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

// Vue du quartier, sans marqueur qui prétendrait localiser le bureau.
// Repère Kissosso consulté le 8 octobre 2026 : https://mapcarta.com/N481387482.
const mapUrl = "https://www.openstreetmap.org/export/embed.html?bbox=-13.586%2C9.625%2C-13.559%2C9.650&layer=mapnik";

export function ContactMap({ locale }: { locale: Locale }) {
  const text = contactContent[locale].map;
  const ready = useSyncExternalStore(subscribe, clientReady, serverReady);
  const [visible, setVisible] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(identity.address.fr)}`;

  useEffect(() => {
    if (visible) frame.current?.focus();
  }, [visible]);

  return (
    <section className="contact-map section" aria-label={text.title}>
      <Container>
        <SectionHeading label={contactContent[locale].visit} title={text.title} description={identity.address[locale]} />
        <div className="contact-map-frame" data-reveal="off">
          {visible ? (
            <iframe ref={frame} src={mapUrl} title={text.description} referrerPolicy="no-referrer" />
          ) : (
            <button className="button button-secondary" type="button" disabled={!ready} onClick={() => setVisible(true)}>
              {text.show}
            </button>
          )}
        </div>
        <p className="contact-map-caption" data-reveal>{text.description}</p>
        <div className="button-group" data-reveal>
          <a className="button button-primary" href={directions} target="_blank" rel="noopener noreferrer">
            {text.directions}
          </a>
        </div>
      </Container>
    </section>
  );
}
