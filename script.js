// Progressive enhancement: all résumé content and links work without JavaScript.
(() => {
  // Basic navigation is initialized inline after the header, without a network dependency.
  const navigation = document.querySelector('#navigation');
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
