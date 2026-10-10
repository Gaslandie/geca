// Affichage uniquement : aucune requête, aucun stockage ni changement de droits.
(() => {
  const sidebar = document.getElementById('admin-sidebar');
  const toggle = document.querySelector('.sidebar-toggle');
  if (!sidebar || !toggle) return;

  const setExpanded = (expanded) => {
    sidebar.hidden = !expanded;
    toggle.setAttribute('aria-expanded', String(expanded));
    const label = expanded ? 'Fermer le menu latéral' : 'Ouvrir le menu latéral';
    toggle.setAttribute('aria-label', label);
    toggle.title = label;
  };

  // Sans JavaScript, la navigation reste ouverte et le bouton inutilisable absent.
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    setExpanded(toggle.getAttribute('aria-expanded') !== 'true');
  });
  sidebar.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    setExpanded(false);
    toggle.focus();
  });
})();
