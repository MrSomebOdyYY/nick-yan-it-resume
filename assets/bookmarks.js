// Each page is ordinary résumé content until its bookmark controls are ready.
(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const openById = new Map();

  function element(tag, className) {
    const node = document.createElement(tag);
    node.className = className;
    return node;
  }

  function arrow(direction, label) {
    const button = element('button', 'bookmark-' + direction);
    button.type = 'button';
    button.setAttribute('aria-label', label);
    const path = direction === 'prev' ? 'M14 6l-6 6 6 6' : 'M10 6l6 6-6 6';
    button.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="' +
      path + '" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    return button;
  }

  function enableMouseDrag(rail) {
    // Touch and trackpads use the browser’s native horizontal scrolling.
    let origin;
    let dragged = false;
    rail.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      origin = { x: event.clientX, left: rail.scrollLeft };
      dragged = false;
    });
    rail.addEventListener('pointermove', event => {
      if (!origin || !event.buttons || rail.scrollWidth <= rail.clientWidth) return;
      const distance = event.clientX - origin.x;
      if (!dragged && Math.abs(distance) < 6) return;
      dragged = true;
      rail.setPointerCapture(event.pointerId);
      rail.scrollTo({ left: origin.left - distance, behavior: 'instant' });
    });
    rail.addEventListener('pointerup', () => { origin = null; });
    rail.addEventListener('pointercancel', () => { origin = null; dragged = false; });
    rail.addEventListener('click', event => {
      if (dragged && event.detail > 0) {
        event.preventDefault();
        event.stopPropagation();
      }
      dragged = false;
    }, true);
  }

  function makeBookmarkWash(sheet) {
    const wash = element('span', 'bookmark-wash');
    wash.setAttribute('aria-hidden', 'true');
    sheet.prepend(wash);
    let ripple;
    function settle() {
      sheet.classList.add('bookmark-filled');
      ripple?.cancel();
      ripple = undefined;
    }
    reducedMotion.addEventListener('change', () => {
      if (reducedMotion.matches && ripple) settle();
    });
    return function paint(tab, click) {
      if (ripple) {
        ripple.onfinish = null;
        ripple.cancel();
      }
      if (reducedMotion.matches || !wash.animate) {
        settle();
        return;
      }
      const bounds = wash.getBoundingClientRect();
      // A keyboard activation starts directly underneath its bookmark.
      const pointerX = click?.detail ? click.clientX : tab.left + tab.width / 2;
      const x = Math.max(0, Math.min(bounds.width, pointerX - bounds.left));
      const y = click?.detail ? Math.min(0, Math.max(-64, click.clientY - bounds.top)) : 0;
      const radius = Math.ceil(Math.hypot(Math.max(x, bounds.width - x), bounds.height - y)) + 1;
      const circle = size => `circle(${size}px at ${x}px ${y}px)`;
      ripple = wash.animate([
        { clipPath: circle(0), backgroundColor: 'var(--book-wave)' },
        { clipPath: circle(radius), backgroundColor: 'var(--book-wave)', offset: .76 },
        { clipPath: circle(radius), backgroundColor: 'var(--book-fill)' }
      ], { duration: 400, easing: 'cubic-bezier(.3,.05,.3,1)', fill: 'both' });
      ripple.onfinish = settle;
    };
  }

  function makeBook(book) {
    const name = book.dataset.book;
    const pages = Array.from(book.querySelectorAll(':scope > [data-tab-label]'));
    if (!pages.length) return;
    const controls = element('div', 'bookmark-controls');
    const rail = element('div', 'bookmark-rail');
    rail.setAttribute('role', 'tablist');
    rail.setAttribute('aria-label', name);
    const arrows = element('div', 'bookmark-arrows');
    const prev = arrow('prev', 'Previous bookmark in ' + name);
    const next = arrow('next', 'Next bookmark in ' + name);
    arrows.append(prev, next);
    controls.append(rail, arrows);
    const sheet = element('div', 'bookmark-pages');
    pages[0].before(controls, sheet);
    const paint = makeBookmarkWash(sheet);
    const tabs = pages.map((page, index) => {
      page.id ||= name.toLowerCase() + '-page-' + (index + 1);
      const tab = element('button', 'bookmark-tab');
      tab.type = 'button';
      tab.id = 'tab-' + page.id;
      tab.textContent = page.dataset.tabLabel;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', page.id);
      page.classList.add('bookmark-page');
      page.setAttribute('role', 'tabpanel');
      page.setAttribute('aria-labelledby', tab.id);
      page.tabIndex = 0;
      rail.append(tab);
      sheet.append(page);
      return tab;
    });
    let active = -1;
    function select(index, { animate = false, focus = false, remember = false, click } = {}) {
      if (active !== index) {
        active = index;
        tabs.forEach((tab, i) => {
          tab.tabIndex = i === index ? 0 : -1;
          tab.setAttribute('aria-selected', String(i === index));
          pages[i].hidden = i !== index;
        });
        prev.disabled = index === 0;
        next.disabled = index === pages.length - 1;
      }
      if (focus) tabs[index].focus({ preventScroll: true });
      // Move only the tab strip; turning a page should never scroll the document.
      const tab = tabs[index].getBoundingClientRect();
      if (animate) paint(tab, click);
      const strip = rail.getBoundingClientRect();
      if (tab.left < strip.left || tab.right > strip.right) {
        rail.scrollBy({ left: (tab.left + tab.right - strip.left - strip.right) / 2,
          behavior: animate && !reducedMotion.matches ? 'smooth' : 'instant' });
      }
      if (remember && location.hash !== '#' + pages[index].id) {
        history.replaceState(history.state, '', '#' + pages[index].id);
      }
    }
    pages.forEach((page, i) => {
      openById.set(page.id, () => select(i));
      tabs[i].addEventListener('click', click => select(i, { animate: true, remember: true, click }));
    });
    function step(index, click) {
      select(index, { animate: true, remember: true, focus: true, click });
    }
    rail.addEventListener('keydown', event => {
      const count = tabs.length;
      const destinations = { ArrowLeft: (active + count - 1) % count,
        ArrowRight: (active + 1) % count, Home: 0, End: count - 1 };
      if (!Object.hasOwn(destinations, event.key)) return;
      event.preventDefault();
      step(destinations[event.key]);
    });
    prev.addEventListener('click', click => step(active - 1, click));
    next.addEventListener('click', click => step(active + 1, click));
    enableMouseDrag(rail);
    book.classList.add('bookmark-book');
    const initial = pages.findIndex(page => '#' + page.id === location.hash);
    select(initial < 0 ? 0 : initial);
  }

  document.querySelectorAll('[data-book]').forEach(makeBook);
  // On reload Edge can restore the old document offset after the panels are built.
  // Let native restoration finish, then align an off-screen bookmarked page once.
  const initialHash = location.hash;
  if (openById.has(initialHash.slice(1))) {
    window.addEventListener('pageshow', event => {
      if (event.persisted) return;
      requestAnimationFrame(() => {
        if (location.hash !== initialHash) return;
        const page = document.getElementById(initialHash.slice(1));
        const bounds = page.getBoundingClientRect();
        const header = document.querySelector('.site-header').getBoundingClientRect();
        if (bounds.top >= innerHeight || bounds.bottom <= header.bottom) {
          page.scrollIntoView({ block: 'start', behavior: 'instant' });
        }
      });
    }, { once: true });
  }
  // Reveal a linked page before native fragment navigation positions the viewport.
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href^="#"]');
    if (link) openById.get(link.hash.slice(1))?.();
  });
  window.addEventListener('hashchange', () => {
    const id = location.hash.slice(1);
    const page = document.getElementById(id);
    if (page?.hidden && openById.has(id)) {
      openById.get(id)();
      page.scrollIntoView({ block: 'start' });
    }
  });
})();
