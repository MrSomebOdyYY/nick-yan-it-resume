(() => {
  if (!('HTMLDialogElement' in window) || !HTMLDialogElement.prototype.showModal) return;

  const localAssets = new URL('assets/', document.baseURI);
  const dialog = document.createElement('dialog');
  dialog.className = 'evidence-dialog';
  dialog.setAttribute('aria-labelledby', 'evidence-dialog-title');
  dialog.innerHTML = `
    <header class="evidence-dialog-bar">
      <h2 id="evidence-dialog-title"></h2>
      <button class="evidence-close" type="button" autofocus>Close <span aria-hidden="true">×</span></button>
    </header>
    <div class="evidence-image-stage" role="region" aria-label="Image" tabindex="-1">
      <img alt="">
      <p class="evidence-image-error" role="status" hidden>The image could not be loaded.</p>
    </div>
    <footer class="evidence-dialog-footer">
      <p class="evidence-dialog-caption"></p>
      <div class="evidence-gallery-nav" role="group" aria-label="Gallery navigation" hidden>
        <button type="button" class="evidence-prev" aria-label="Previous image" title="Previous image (←)">←</button>
        <span class="evidence-position" role="status" aria-atomic="true"><span class="evidence-count"></span><span class="sr-only"></span></span>
        <button type="button" class="evidence-next" aria-label="Next image" title="Next image (→)">→</button>
      </div>
      <div class="evidence-image-controls">
        <button type="button" class="evidence-zoom" aria-pressed="false">Actual size</button>
        <a class="evidence-original" target="_blank" rel="noopener">Open original <span aria-hidden="true">↗</span><span class="sr-only"> in a new tab</span></a>
      </div>
    </footer>`;
  document.body.append(dialog);

  const title = dialog.querySelector('h2');
  const caption = dialog.querySelector('.evidence-dialog-caption');
  const close = dialog.querySelector('.evidence-close');
  const stage = dialog.querySelector('.evidence-image-stage');
  const image = stage.querySelector('img');
  const error = stage.querySelector('.evidence-image-error');
  const zoom = dialog.querySelector('.evidence-zoom');
  const original = dialog.querySelector('.evidence-original');
  const navigation = dialog.querySelector('.evidence-gallery-nav');
  const count = navigation.querySelector('.evidence-count');
  const spokenTitle = navigation.querySelector('.sr-only');
  const groupSelector = '.lab-mosaic, .proof-grid, .evidence-downloads';
  let items = [];
  let current = 0;
  let opener = null;

  function setZoom(fullSize) {
    stage.classList.toggle('actual-size', fullSize);
    stage.tabIndex = fullSize ? 0 : -1;
    zoom.setAttribute('aria-pressed', String(fullSize));
    stage.scrollTo(0, 0);
  }

  function isEvidenceLink(link) {
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return false;
    const url = new URL(link.href);
    if (url.origin !== localAssets.origin || !url.pathname.startsWith(localAssets.pathname)) return false;
    const path = url.pathname.slice(localAssets.pathname.length);
    return /^(?:evidence\/|images\/portfolio-live\.)/i.test(path) && /\.(?:png|webp|jpe?g|svg)$/i.test(path);
  }

  function showImage(index) {
    current = index;
    const link = items[index];
    const thumb = link.querySelector('img');
    const figure = link.closest('figure')?.querySelector('figcaption');
    const figureTitle = figure?.querySelector('strong')?.textContent.trim();
    const linkTitle = link.textContent.replace(/[↗↘]/g, '').trim() ||
      link.getAttribute('aria-label')?.replace(/^(Open|View) (the )?/i, '').replace(/ at full size$/i, '');
    title.textContent = (figureTitle || linkTitle || 'Project screenshot').replace(/\.$/, '');
    const alt = thumb?.alt || title.textContent;
    image.alt = alt;
    const captionText = figure?.textContent.trim() || '';
    caption.textContent = figureTitle ? captionText.slice(figureTitle.length).trim() : captionText;
    caption.hidden = !caption.textContent;
    original.href = link.href;
    stage.setAttribute('aria-label', title.textContent + ', image');
    setZoom(false);
    zoom.disabled = true;
    error.hidden = true;
    image.hidden = false;
    image.src = link.href;
    count.textContent = (index + 1) + ' of ' + items.length;
    spokenTitle.textContent = ', ' + title.textContent;
  }

  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey ||
        event.shiftKey || event.altKey || dialog.open) return;
    const link = event.target.closest('a[href]');
    if (!isEvidenceLink(link)) return;
    event.preventDefault();
    opener = link;
    const group = link.closest(groupSelector);
    items = group ? Array.from(group.querySelectorAll('a[href]')).filter(item =>
      item.closest(groupSelector) === group && isEvidenceLink(item)) : [link];
    navigation.hidden = items.length < 2;
    showImage(items.indexOf(link));
    dialog.showModal();
  });

  function step(distance) {
    showImage((current + distance + items.length) % items.length);
  }
  navigation.querySelector('.evidence-prev').addEventListener('click', () => step(-1));
  navigation.querySelector('.evidence-next').addEventListener('click', () => step(1));
  dialog.addEventListener('keydown', event => {
    if (items.length < 2 || stage.classList.contains('actual-size') || event.altKey ||
        event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    step(event.key === 'ArrowLeft' ? -1 : 1);
  });

  image.addEventListener('load', () => { zoom.disabled = false; });
  image.addEventListener('error', () => {
    image.hidden = true;
    error.hidden = false;
    zoom.disabled = true;
  });
  zoom.addEventListener('click', () => {
    const fullSize = !stage.classList.contains('actual-size');
    setZoom(fullSize);
    if (fullSize) stage.focus({ preventScroll: true });
  });
  close.addEventListener('click', () => dialog.close());
  let pressedOnBackdrop = false;
  function outsideDialog(event) {
    const box = dialog.getBoundingClientRect();
    return event.target === dialog && (event.clientX < box.left || event.clientX > box.right ||
      event.clientY < box.top || event.clientY > box.bottom);
  }
  dialog.addEventListener('pointerdown', event => { pressedOnBackdrop = outsideDialog(event); });
  dialog.addEventListener('click', event => {
    if (pressedOnBackdrop && outsideDialog(event)) dialog.close();
    pressedOnBackdrop = false;
  });
  dialog.addEventListener('close', () => {
    opener?.focus({ preventScroll: true });
    opener = null;
  });
})();
