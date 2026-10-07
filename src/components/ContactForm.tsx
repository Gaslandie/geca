"use client";

import { useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { contactContent, type Locale } from "@/content/site";

const subscribe = () => () => {};
const clientReady = () => true;
const serverReady = () => false;
type Preview = { name: string; email: string; organization: string; reason: string; message: string };

export function ContactForm({ locale }: { locale: Locale }) {
  const text = contactContent[locale].form;
  const ready = useSyncExternalStore(subscribe, clientReady, serverReady);
  const [preview, setPreview] = useState<Preview | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    for (const [field, minimum] of [["name", 2], ["message", 10]] as const) {
      const input = form.elements.namedItem(field) as HTMLInputElement | HTMLTextAreaElement;
      input.setCustomValidity(String(data.get(field) ?? "").trim().length < minimum ? text.invalid : "");
    }
    if (!form.reportValidity()) return;
    const reason = text.reasons.find((item) => item.value === data.get("reason"));
    if (!reason) return;
    // Prévisualisation en mémoire uniquement : aucun appel réseau ni stockage.
    setPreview({
      name: String(data.get("name")).trim(),
      email: String(data.get("email")).trim(),
      organization: String(data.get("organization") ?? "").trim(),
      reason: reason.label,
      message: String(data.get("message")).trim(),
    });
    requestAnimationFrame(() => previewRef.current?.focus());
  }

  return (
    <div className="contact-form-panel card-content">
      <form
        className="contact-form"
        aria-label={text.title}
        aria-describedby="contact-demo-note"
        onSubmit={handleSubmit}
        onReset={() => setPreview(null)}
        onChange={(event) => {
          const input = event.target;
          if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) input.setCustomValidity("");
          setPreview(null);
        }}
      >
        <p className="contact-form-title">{text.title}</p>
        <p id="contact-demo-note" className="contact-form-note">{text.demo}</p>
        <fieldset className="contact-form-fields" disabled={!ready}>
          <legend className="sr-only">{text.title}</legend>
          <p className="contact-required-note">{text.required}</p>
          <div className="contact-field">
            <label htmlFor="contact-name">{text.name} <span aria-hidden="true">*</span></label>
            <input id="contact-name" name="name" autoComplete="name" required minLength={2} maxLength={100} />
          </div>
          <div className="contact-field">
            <label htmlFor="contact-email">{text.email} <span aria-hidden="true">*</span></label>
            <input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={254} />
          </div>
          <div className="contact-field">
            <label htmlFor="contact-organization">{text.organization} <span className="contact-optional">{text.optional}</span></label>
            <input id="contact-organization" name="organization" autoComplete="organization" maxLength={160} />
          </div>
          <fieldset className="contact-reasons">
            <legend>{text.reason} <span aria-hidden="true">*</span></legend>
            {text.reasons.map((reason) => (
              <label key={reason.value} className="contact-reason">
                <input type="radio" name="reason" value={reason.value} required />
                <span>{reason.label}</span>
              </label>
            ))}
          </fieldset>
          <div className="contact-field">
            <label htmlFor="contact-message">{text.message} <span aria-hidden="true">*</span></label>
            <textarea id="contact-message" name="message" rows={4} required minLength={10} maxLength={3000} aria-describedby="contact-message-help" />
            <p id="contact-message-help" className="contact-field-help">{text.help}</p>
          </div>
          <button type="submit" className="button button-primary contact-submit">{text.submit}</button>
          <p className="contact-privacy-note">{text.privacy}</p>
        </fieldset>
        <noscript><p className="contact-form-note">{text.noScript}</p></noscript>
        {preview && (
          <div ref={previewRef} tabIndex={-1} className="contact-preview card-content" role="region" aria-label={text.preview}>
            <p className="contact-preview-title">{text.preview}</p>
            <p role="status">{text.notSent}</p>
            <dl>
              <dt>{text.name}</dt><dd>{preview.name}</dd>
              <dt>{text.email}</dt><dd>{preview.email}</dd>
              {preview.organization && <><dt>{text.organization}</dt><dd>{preview.organization}</dd></>}
              <dt>{text.reason}</dt><dd>{preview.reason}</dd>
              <dt>{text.message}</dt><dd className="contact-preview-message">{preview.message}</dd>
            </dl>
            <button type="reset" className="button button-text contact-reset">{text.reset}</button>
          </div>
        )}
      </form>
    </div>
  );
}
