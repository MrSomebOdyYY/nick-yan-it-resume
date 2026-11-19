// Build the gallery from the same projects and evidence as the bookmark panels.
(() => {
  const strip = document.querySelector('[data-project-strip]');
  if (!strip) return;

  const shortTitles = {
    'project-windows': 'Windows access control',
    'project-driving': 'Java driving simulation',
    'project-databases': 'Database design',
    'project-networks': 'Packet Tracer labs',
    'project-linux': 'Ubuntu web server',
    'project-portfolio': 'Portfolio website'
  };

  const gallery = document.createElement('nav');
  gallery.className = 'wrap project-strip-inner';
  gallery.setAttribute('aria-labelledby', 'project-gallery-title');
  gallery.innerHTML = `
    <div class="project-strip-heading">
      <h2 id="project-gallery-title">Project gallery</h2>
      <div class="project-strip-actions" hidden>
        <button type="button" class="strip-play" aria-controls="project-gallery-list"></button>
        <button type="button" class="strip-prev" aria-controls="project-gallery-list" aria-label="Previous project previews">←</button>
        <button type="button" class="strip-next" aria-controls="project-gallery-list" aria-label="Next project previews">→</button>
      </div>
    </div>
    <ul class="project-strip-list" id="project-gallery-list" aria-label="Project previews"></ul>`;
  const rail = gallery.querySelector('.project-strip-list');
  for (const project of document.querySelectorAll('[data-book="Projects"] article.project[id]')) {
    const evidence = project.querySelector('.project-visual img');
    if (!evidence) continue;
    const title = project.dataset.stripTitle || shortTitles[project.id] || project.querySelector('h3')?.textContent;
    if (!title) continue;
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = '#' + project.id;
    link.draggable = false;
    const image = document.createElement('img');
    image.src = evidence.getAttribute('src');
    image.width = Number(evidence.getAttribute('width')) || evidence.width;
    image.height = Number(evidence.getAttribute('height')) || evidence.height;
    image.alt = '';
    image.loading = 'lazy';
    image.decoding = 'async';
    image.draggable = false;
    const caption = document.createElement('span');
    caption.textContent = title;
    link.append(image, caption);
    item.append(link);
    rail.append(item);
  }
  if (!rail.children.length) return;
  strip.replaceChildren(gallery);

  const actions = gallery.querySelector('.project-strip-actions');
  const play = actions.querySelector('.strip-play');
  const prev = actions.querySelector('.strip-prev');
  const next = actions.querySelector('.strip-next');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let playing = !reduced.matches;
  let inView = false;
  let hovering = false;
  let frame = 0;
  let previousTime = 0;
  let position = 0;

  function maxScroll() {
    return rail.scrollWidth - rail.clientWidth;
  }
  function updateControls() {
    const max = maxScroll();
    actions.hidden = max < 2;
    play.hidden = reduced.matches;
    play.textContent = playing ? 'Pause' : 'Play';
    play.setAttribute('aria-label', playing ? 'Pause gallery motion' : 'Play gallery motion');
    prev.disabled = rail.scrollLeft <= 1;
    next.disabled = rail.scrollLeft >= max - 1;
  }
  function tick(now) {
    const seconds = previousTime ? Math.min(now - previousTime, 64) / 1000 : 0;
    previousTime = now;
    position = Math.min(maxScroll(), position + seconds * 21);
    rail.scrollLeft = position;
    if (position >= maxScroll() - 1) {
      setPlaying(false);
    } else {
      frame = requestAnimationFrame(tick);
    }
  }
  function syncPlayback() {
    cancelAnimationFrame(frame);
    previousTime = 0;
    position = rail.scrollLeft;
    if (playing && inView && !hovering && !document.hidden && !rail.contains(document.activeElement)
        && !reduced.matches && maxScroll() > 1) {
      frame = requestAnimationFrame(tick);
    }
  }
  function setPlaying(value) {
    playing = value;
    updateControls();
    syncPlayback();
  }
  function step(direction) {
    setPlaying(false);
    const edge = rail.getBoundingClientRect().left;
    const distances = Array.from(rail.children, item => item.getBoundingClientRect().left - edge);
    const delta = direction > 0
      ? distances.find(distance => distance > 2)
      : distances.reverse().find(distance => distance < -2);
    rail.scrollBy({ left: delta ?? direction * rail.clientWidth, behavior: reduced.matches ? 'instant' : 'smooth' });
  }
  prev.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));
  play.addEventListener('click', () => {
    if (!playing && rail.scrollLeft >= maxScroll() - 1) rail.scrollLeft = 0;
    setPlaying(!playing);
  });
  rail.addEventListener('scroll', () => {
    // Scrolling only changes the two endpoints; keep button labels stable during playback.
    prev.disabled = rail.scrollLeft <= 1;
    next.disabled = rail.scrollLeft >= maxScroll() - 1;
  }, { passive: true });
  rail.addEventListener('pointerenter', event => { hovering = event.pointerType === 'mouse'; syncPlayback(); });
  rail.addEventListener('pointerleave', () => { hovering = false; syncPlayback(); });
  let dragOrigin;
  let dragged = false;
  rail.addEventListener('pointerdown', event => {
    setPlaying(false);
    dragged = false;
    if (event.pointerType === 'mouse' && event.button === 0) {
      dragOrigin = { x: event.clientX, left: rail.scrollLeft };
    }
  });
  rail.addEventListener('pointermove', event => {
    if (!dragOrigin || !(event.buttons & 1)) return;
    const distance = event.clientX - dragOrigin.x;
    if (!dragged && Math.abs(distance) < 6) return;
    if (!dragged) rail.setPointerCapture(event.pointerId);
    dragged = true;
    rail.scrollLeft = dragOrigin.left - distance;
  });
  rail.addEventListener('pointerup', () => { dragOrigin = null; });
  rail.addEventListener('pointercancel', () => { dragOrigin = null; dragged = false; });
  rail.addEventListener('click', event => {
    if (dragged && event.detail) {
      event.preventDefault();
      event.stopPropagation();
    }
    dragged = false;
  }, true);
  rail.addEventListener('wheel', event => {
    if (event.deltaX || event.shiftKey) setPlaying(false);
  }, { passive: true });
  rail.addEventListener('focusin', () => setPlaying(false));
  rail.addEventListener('keydown', event => {
    const link = event.target.closest('a');
    if (!link) return;
    const items = Array.from(rail.querySelectorAll('a'));
    const i = items.indexOf(link);
    const indexes = { ArrowLeft: Math.max(0, i - 1), ArrowRight: Math.min(items.length - 1, i + 1),
      Home: 0, End: items.length - 1 };
    if (!Object.hasOwn(indexes, event.key)) return;
    event.preventDefault();
    const target = items[indexes[event.key]];
    target.focus({preventScroll: true});
    target.scrollIntoView({block: 'nearest', inline: 'nearest', behavior: reduced.matches ? 'instant' : 'smooth'});
  });

  reduced.addEventListener('change', () => setPlaying(false));
  document.addEventListener('visibilitychange', syncPlayback);
  new IntersectionObserver(entries => {
    inView = entries[0].isIntersecting;
    syncPlayback();
  }, { threshold: 0.4 }).observe(rail);
  new ResizeObserver(() => { updateControls(); syncPlayback(); }).observe(rail);
  updateControls();
})();
