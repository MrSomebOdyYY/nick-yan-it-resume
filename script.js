// Progressive enhancement: all résumé content and links work without JavaScript.
(() => {
  document.documentElement.classList.add('js');
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#navigation');
  const closeMenu = () => {
    menuButton.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  };
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    navigation.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
  });
  navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    closeMenu();
    // Move keyboard focus to the destination after closing the full-screen sheet.
    const destination = document.querySelector(link.getAttribute('href'));
    destination?.setAttribute('tabindex', '-1');
    destination?.focus({ preventScroll: true });
  }));
  document.addEventListener('keydown', event => {
    if (menuButton.getAttribute('aria-expanded') !== 'true') return;
    if (event.key === 'Escape') { closeMenu(); menuButton.focus(); }
    if (event.key === 'Tab') {
      const last = navigation.querySelector('a:last-child');
      if (event.shiftKey && document.activeElement === menuButton) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); menuButton.focus(); }
    }
  });
  window.matchMedia('(min-width: 621px)').addEventListener('change', closeMenu);
  document.querySelector('#year').textContent = new Date().getFullYear();
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navigation.querySelectorAll('a').forEach(link => {
        if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }), { rootMargin: '-15% 0px -65% 0px' });
    document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));
  }

  // The requested GSAP engine drives the hero and Taste's dealt word-highlight moment.
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  const statement = document.querySelector('.experience-statement');
  const originalStatement = statement.textContent;
  // A real text node remains available to screen readers; decorative words are hidden from them.
  const readableStatement = document.createElement('span');
  readableStatement.className = 'sr-only';
  readableStatement.textContent = originalStatement;
  statement.replaceChildren(readableStatement, ...originalStatement.split(' ').map((word, index, words) => {
    const span = document.createElement('span');
    span.className = 'word';
    span.setAttribute('aria-hidden', 'true');
    span.textContent = word + (index < words.length - 1 ? '\u00a0' : '');
    return span;
  }));
  let entered = false;
  media.add('(prefers-reduced-motion: no-preference)', () => {
    if (!entered) {
      entered = true;
      const intro = gsap.timeline({defaults:{ease:'power3.out',duration:.8}});
      intro.from('.title-line > span', {yPercent:105,stagger:.08,clearProps:'transform'}, 0)
        .from('.hero-enter', {y:12,opacity:0,stagger:.06,duration:.6,clearProps:'transform,opacity'}, .2)
        .from('.hero-visual', {scale:.98,duration:1,clearProps:'transform'}, 0)
        .from('.circuit-path', {strokeDasharray:450,strokeDashoffset:450,duration:1.05,clearProps:'strokeDasharray,strokeDashoffset'}, .1);
    }
    gsap.fromTo(statement.querySelectorAll('.word'), {color:'#75877c'}, {
      color:'#183e35',stagger:.12,ease:'none',duration:.3,
      scrollTrigger:{trigger:statement,start:'top 85%',end:'bottom 45%',scrub:true}
    });
  });
  // Native disclosures change layout; keep the statement's scroll positions accurate.
  document.querySelectorAll('details').forEach(detail => detail.addEventListener('toggle', () => ScrollTrigger.refresh()));
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('beforeprint', () => media.revert());
})();
