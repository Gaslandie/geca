"use client";

import { useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { contactContent, identity, type Locale } from "@/content/site";
import { publicRelease } from "@/lib/deployment";

const subscribe = () => () => {};
const clientReady = () => true;
const serverReady = () => false;
const previewOnly = Boolean(process.env.NEXT_PUBLIC_BASE_PATH);
const endpoint = publicRelease ? "https://admin.globalecoaction.org/contact-public" : "http://127.0.0.1:8000/contact-public";

export function ContactForm({ locale }: { locale: Locale }) {
  const text = contactContent[locale].form;
  const ready = useSyncExternalStore(subscribe, clientReady, serverReady);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const sending = useRef(false);
  const proof = useRef<Promise<{ token: string; issued: number }> | null>(null);
  const fr = locale === "fr";
  function prepare() {
    if (previewOnly || proof.current) return;
    proof.current = fetch(endpoint + "/jeton", { credentials: "omit", headers: { Accept: "application/json" } })
      .then(async response => {
        if (!response.ok) throw new Error("token");
        const data = await response.json();
        if (typeof data.token !== "string" || data.token.length !== 64) throw new Error("token");
        return { token: data.token, issued: Date.now() };
      });
    // Échec affiché au moment de l’envoi, sans rejet non géré.
    void proof.current.catch(() => {});
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current || previewOnly) return;
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    sending.current = true;
    setBusy(true);
    setStatus("");
    try {
      prepare();
      const token = await proof.current!;
      const data = new FormData(form);
      const payload = Object.fromEntries(["name", "organization", "email", "reason", "message", "website"].map(key => [key, String(data.get(key) ?? "").trim()]));
      await new Promise(resolve => setTimeout(resolve, Math.max(0, 2300 - (Date.now() - token.issued))));
      const response = await fetch(endpoint, { method: "POST", credentials: "omit", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ ...payload, token: token.token }) });
      if (!response.ok) {
        setStatus(response.status === 429 ? (fr ? "Trop de demandes. Réessayez plus tard ou contactez-nous par e-mail." : "Too many requests. Try again later or email us.") : (fr ? "Le message n’a pas été envoyé. Vérifiez les champs ou contactez-nous par e-mail." : "The message was not sent. Check the fields or email us."));
      } else {
        const result = await response.json();
        if (result.sent !== true) throw new Error("delivery");
        setStatus(fr ? "Votre message a été envoyé à GECA." : "Your message has been sent to GECA.");
        form.reset();
      }
    } catch {
      setStatus(fr ? "L’envoi est indisponible. Vous pouvez nous écrire directement par e-mail." : "Sending is unavailable. You can email us directly.");
    } finally {
      proof.current = null;
      sending.current = false;
      setBusy(false);
    }
  }
  return <div className="contact-form-panel card-content">
    <form className="contact-form" aria-label={text.title} onSubmit={submit} onFocus={prepare}>
      <fieldset className="contact-form-fields" disabled={!ready || previewOnly}>
        <legend className="sr-only">{text.title}</legend>
        <p className="contact-required-note">{text.required}</p>
        <div className="contact-input-grid">
          <div className="contact-field"><label htmlFor="contact-name">{text.name} *</label><input id="contact-name" name="name" autoComplete="name" required minLength={2} maxLength={100} /></div>
          <div className="contact-field"><label htmlFor="contact-organization">{text.organization} {text.optional}</label><input id="contact-organization" name="organization" autoComplete="organization" maxLength={160} /></div>
          <div className="contact-field"><label htmlFor="contact-email">{text.email} *</label><input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={254} /></div>
          <div className="contact-field"><label htmlFor="contact-reason">{text.reason} *</label><select id="contact-reason" name="reason" required defaultValue=""><option value="" disabled>{fr ? "Choisir un sujet" : "Choose a subject"}</option>{text.reasons.map(reason => <option key={reason.value} value={reason.value}>{reason.label}</option>)}</select></div>
        </div>
        <div className="contact-field"><label htmlFor="contact-message">{text.message} *</label><textarea id="contact-message" name="message" rows={6} required minLength={10} maxLength={3000} aria-describedby="contact-help" /><p id="contact-help" className="contact-field-help">{text.help}</p></div>
        <div className="contact-honeypot" aria-hidden="true"><label htmlFor="contact-website">Website</label><input id="contact-website" name="website" tabIndex={-1} autoComplete="off" /></div>
        <button type="submit" className="button contact-submit" disabled={busy}>{busy ? (fr ? "Envoi en cours…" : "Sending…") : (fr ? "Envoyer le message" : "Send message")}</button>
        <p className="contact-privacy-note">{fr ? "Les informations saisies seront transmises par e-mail à GECA pour répondre à votre demande." : "Your information will be emailed to GECA to respond to your request."}</p>
      </fieldset>
      <p className="contact-send-status" role="status" aria-live="polite">{status}</p>
      {previewOnly && <p>{fr ? "L’envoi est disponible sur le site principal." : "Sending is available on the main website."}</p>}
      <noscript><p>{fr ? "Activez JavaScript pour envoyer le formulaire, ou écrivez-nous par e-mail." : "Enable JavaScript to submit the form, or email us."}</p></noscript>
      <a className="contact-email-fallback" href={`mailto:${identity.email}`}>{identity.email}</a>
    </form>
  </div>;
}
