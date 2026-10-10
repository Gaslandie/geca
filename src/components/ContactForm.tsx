"use client";

import { useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { contactContent, type Locale } from "@/content/site";
import { assetPath } from "@/lib/assets";

const subscribe = () => () => {};
const clientReady = () => true;
const serverReady = () => false;
type Preview = { name: string; email: string; organization: string; reason: string; message: string };
type Field = keyof Preview;
const fields: readonly Field[] = ["name", "email", "organization", "reason", "message"];

export function ContactForm({ locale }: { locale: Locale }) {
  const text = contactContent[locale].form;
  const ready = useSyncExternalStore(subscribe, clientReady, serverReady);
  const [preview, setPreview] = useState<Preview | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [messageLength, setMessageLength] = useState(0);

  function focusField(field: Field) {
    (formRef.current?.elements.namedItem(field) instanceof RadioNodeList
      ? formRef.current.querySelector<HTMLInputElement>('[name="reason"]')
      : formRef.current?.elements.namedItem(field) as HTMLElement | null)?.focus();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const values = Object.fromEntries(fields.map((field) => [field, typeof data.get(field) === "string" ? String(data.get(field)) : ""])) as Preview;
    const email = form.elements.namedItem("email") as HTMLInputElement;
    const invalid: Partial<Record<Field, string>> = {};
    if (values.name.trim().length < 2 || values.name.length > 100) invalid.name = text.errors.name;
    if (!values.email || values.email.length > 254 || email.validity.typeMismatch) invalid.email = text.errors.email;
    if (values.organization.length > 160) invalid.organization = text.errors.organization;
    const reason = text.reasons.find((item) => item.value === data.get("reason"));
    if (!reason) invalid.reason = text.errors.reason;
    if (values.message.trim().length < 10 || values.message.length > 3000) invalid.message = text.errors.message;
    for (const field of fields.filter((field) => field !== "reason")) {
      (form.elements.namedItem(field) as HTMLInputElement | HTMLTextAreaElement).setCustomValidity(invalid[field] ?? "");
    }
    setErrors(invalid);
    if (Object.keys(invalid).length || !reason) {
      setPreview(null);
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }
    // Prévisualisation en mémoire uniquement : aucun appel réseau ni stockage.
    setPreview({
      name: values.name.trim(),
      email: values.email.trim(),
      organization: values.organization.trim(),
      reason: reason.label,
      message: values.message.trim(),
    });
    requestAnimationFrame(() => previewRef.current?.focus());
  }

  return (
    <div className="contact-form-panel card-content">
      <form
        ref={formRef}
        noValidate
        method="post"
        action={assetPath("/api/contact")}
        className="contact-form"
        aria-label={text.title}
        aria-describedby="contact-demo-note"
        onSubmit={handleSubmit}
        onReset={() => {
          setPreview(null);
          setErrors({});
          setMessageLength(0);
          for (const input of formRef.current?.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input, textarea") ?? []) input.setCustomValidity("");
          requestAnimationFrame(() => focusField("name"));
        }}
        onChange={(event) => {
          const input = event.target;
          if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
            input.setCustomValidity("");
            setErrors((current) => {
              const next = { ...current };
              delete next[input.name as Field];
              return next;
            });
            if (input.name === "message") setMessageLength(input.value.length);
          }
          setPreview(null);
        }}
      >
        <p className="contact-form-title">{text.title}</p>
        <p id="contact-demo-note" className="contact-form-note">{text.demo}</p>
        {Object.keys(errors).length > 0 && <div ref={errorRef} className="contact-error-summary" role="alert" tabIndex={-1} aria-labelledby="contact-errors-title">
          <h2 id="contact-errors-title">{text.errorTitle}</h2>
          <ul>{fields.filter((field) => errors[field]).map((field) => <li key={field}>
            <a href={`#contact-${field === "reason" ? "reason-partnership" : field}`} onClick={(event) => { event.preventDefault(); focusField(field); }}>{errors[field]}</a>
          </li>)}</ul>
        </div>}
        <fieldset className="contact-form-fields" disabled={!ready}>
          <legend className="sr-only">{text.title}</legend>
          <p className="contact-required-note">{text.required}</p>
          <div className="contact-field">
            <label htmlFor="contact-name">{text.name} <span aria-hidden="true">*</span></label>
            <input id="contact-name" name="name" autoComplete="name" required minLength={2} maxLength={100} aria-invalid={errors.name ? true : undefined} aria-describedby={errors.name ? "contact-name-error" : undefined} />
            {errors.name && <p id="contact-name-error" className="contact-field-error">{errors.name}</p>}
          </div>
          <div className="contact-field">
            <label htmlFor="contact-email">{text.email} <span aria-hidden="true">*</span></label>
            <input id="contact-email" name="email" type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} required maxLength={254} aria-invalid={errors.email ? true : undefined} aria-describedby={errors.email ? "contact-email-error" : undefined} />
            {errors.email && <p id="contact-email-error" className="contact-field-error">{errors.email}</p>}
          </div>
          <div className="contact-field">
            <label htmlFor="contact-organization">{text.organization} <span className="contact-optional">{text.optional}</span></label>
            <input id="contact-organization" name="organization" autoComplete="organization" maxLength={160} aria-invalid={errors.organization ? true : undefined} aria-describedby={errors.organization ? "contact-organization-error" : undefined} />
            {errors.organization && <p id="contact-organization-error" className="contact-field-error">{errors.organization}</p>}
          </div>
          <fieldset className="contact-reasons" aria-invalid={errors.reason ? true : undefined} aria-describedby={errors.reason ? "contact-reason-error" : undefined}>
            <legend>{text.reason} <span aria-hidden="true">*</span></legend>
            {text.reasons.map((reason) => (
              <label key={reason.value} className="contact-reason">
                <input id={`contact-reason-${reason.value}`} type="radio" name="reason" value={reason.value} required />
                <span>{reason.label}</span>
              </label>
            ))}
            {errors.reason && <p id="contact-reason-error" className="contact-field-error">{errors.reason}</p>}
          </fieldset>
          <div className="contact-field">
            <label htmlFor="contact-message">{text.message} <span aria-hidden="true">*</span></label>
            <textarea id="contact-message" name="message" rows={4} required minLength={10} maxLength={3000} aria-invalid={errors.message ? true : undefined} aria-describedby={`contact-message-help contact-message-count${errors.message ? " contact-message-error" : ""}`} />
            <p id="contact-message-help" className="contact-field-help">{text.help}</p>
            <p id="contact-message-count" className="contact-field-help">{messageLength.toLocaleString(locale)} / {Number(3000).toLocaleString(locale)} {text.characters}</p>
            {errors.message && <p id="contact-message-error" className="contact-field-error">{errors.message}</p>}
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
            <div className="button-group">
              <button type="button" className="button button-secondary" onClick={() => focusField("message")}>{text.edit}</button>
              <button type="reset" className="button button-text contact-reset">{text.reset}</button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
