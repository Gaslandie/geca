(() => {
  'use strict';
  const input = document.querySelector('[data-photo-preview-input]');
  const panel = document.querySelector('[data-photo-preview-panel]');
  const image = document.querySelector('[data-photo-preview-image]');
  const status = document.getElementById('photo-preview-status');
  const cancel = document.querySelector('[data-photo-preview-cancel]');
  const currentPhoto = document.querySelector('[data-photo-current]');
  if (!input || !panel || !image || !status || !cancel) return;

  let url = null;
  let generation = 0;
  const release = () => {
    image.hidden = true;
    image.removeAttribute('src');
    if (url) URL.revokeObjectURL(url);
    url = null;
  };
  const clear = () => {
    generation++;
    release();
    panel.hidden = true;
    if (currentPhoto) currentPhoto.hidden = false;
    status.textContent = '';
    status.classList.remove('is-error');
    input.setCustomValidity('');
    input.removeAttribute('aria-invalid');
  };
  const fail = message => {
    release();
    panel.hidden = false;
    if (currentPhoto) currentPhoto.hidden = false;
    status.textContent = message;
    status.classList.add('is-error');
    input.setCustomValidity(message);
    input.setAttribute('aria-invalid', 'true');
  };
  const show = async () => {
    clear();
    const current = generation;
    const file = input.files?.[0];
    if (!file) return;
    panel.hidden = false;
    const extension = file.name.split('.').at(-1).toLowerCase();
    const types = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
    if (!Object.hasOwn(types, extension) || (file.type && file.type !== types[extension])
        || file.name.length > 200 || /[\x00-\x1f:\\]/.test(file.name)
        || /\.(php\d*|phtml|pht|phar|jsp|aspx?|cgi|exe|sh)(\.|$)/i.test(file.name)) {
      fail('Choisissez une photo JPEG, PNG ou WebP.');
      return;
    }
    if (!file.size || file.size > 6 * 1024 * 1024) {
      fail('La photo doit peser au maximum 6 Mo.');
      return;
    }
    status.textContent = 'Chargement de l’aperçu…';
    try {
      const bytes = new Uint8Array(await file.slice(0, 32).arrayBuffer());
      if (generation !== current) return;
      const text = (start, end) => String.fromCharCode(...bytes.slice(start, end));
      const png = [137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => bytes[index] === value);
      const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
      const webp = text(0, 4) === 'RIFF' && text(8, 12) === 'WEBP';
      if (!(types[extension] === 'image/png' && png || types[extension] === 'image/jpeg' && jpeg || types[extension] === 'image/webp' && webp)) {
        fail('Ce fichier ne correspond pas à une photo autorisée.');
        return;
      }
      const tooLarge = (width, height) => width < 1 || height < 1 || width > 6000 || height > 6000 || width * height > 12000000;
      if (png && bytes.length >= 24) {
        const header = new DataView(bytes.buffer);
        if (tooLarge(header.getUint32(16), header.getUint32(20))) {
          fail('La photo doit rester sous 12 millions de pixels et 6 000 pixels par côté.');
          return;
        }
      }
      url = URL.createObjectURL(file);
      const probe = new Image();
      probe.onload = () => {
        if (generation !== current) return;
        if (tooLarge(probe.naturalWidth, probe.naturalHeight)) {
          fail('La photo doit rester sous 12 millions de pixels et 6 000 pixels par côté.');
          return;
        }
        image.src = url;
        image.hidden = false;
        if (currentPhoto) currentPhoto.hidden = true;
        status.textContent = 'Nouvelle photo — à enregistrer.';
      };
      probe.onerror = () => {
        if (generation === current) fail('Cette photo ne peut pas être ouverte. Choisissez un autre fichier.');
      };
      probe.src = url;
    } catch {
      if (generation === current) fail('Impossible d’afficher cette photo. Choisissez un autre fichier.');
    }
  };
  input.addEventListener('change', show);
  cancel.addEventListener('click', () => {
    input.value = '';
    clear();
    status.textContent = currentPhoto ? 'Choix annulé. La photo actuelle est conservée.' : 'Le choix de la photo est annulé.';
    input.focus();
  });
  input.form?.addEventListener('reset', () => queueMicrotask(clear));
  window.addEventListener('pagehide', clear);
  window.addEventListener('pageshow', event => { if (event.persisted) show(); });
})();
