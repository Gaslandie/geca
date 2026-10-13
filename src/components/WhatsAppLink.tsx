import { supportActions, type Locale } from "@/content/site";

export function WhatsAppLink({ locale }: { locale: Locale }) {
  return <nav aria-label={locale === "fr" ? "Contact rapide" : "Quick contact"}><a className="whatsapp-floating" href={supportActions.whatsappHref} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" aria-label={locale === "fr" ? "Contacter GECA sur WhatsApp (nouvel onglet)" : "Contact GECA on WhatsApp (new tab)"}>
    <svg aria-hidden="true" viewBox="0 0 32 32" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M27 15.6A11 11 0 0 1 10.6 25L5 27l1.8-5.7A11 11 0 1 1 27 15.6Z" /><path d="M12 10c-.8 0-2 1.2-2 2.7 0 3.5 5.2 8.3 8.4 8.3 1.6 0 3-1.2 3-2l-3.6-1.7-1.2 1.1c-1.9-.8-3.3-2.1-4-3.9l1-1.1L12 10Z" /></svg>
  </a></nav>;
}
