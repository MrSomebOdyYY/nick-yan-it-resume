(() => {
  const card = document.querySelector('.hero-visual');
  const toggle = card.querySelector('.sky-toggle');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let manualSky = false;

  function setDaylight(daylight) {
    card.classList.toggle('is-daylight', daylight);
    toggle.setAttribute('aria-pressed', String(daylight));
  }
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    manualSky = true;
    setDaylight(!card.classList.contains('is-daylight'));
  });

  // Return to the landscape at daylight after viewing the work below.
  if ('IntersectionObserver' in window) {
    let seen = false;
    let left = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.intersectionRatio >= .5) {
        if (left) {
          if (!manualSky && !reduced.matches) setDaylight(true);
          observer.disconnect();
        }
        seen = true;
      } else if (seen && !entry.isIntersecting) {
        left = true;
      }
    }, { threshold: [0,.5] });
    observer.observe(card);
  }

  if (!window.gsap) return;
  gsap.matchMedia().add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
    const layers = [
      [card.querySelector('.scene-ridges'), 7, 4],
      [card.querySelector('.scene-star'), -5, -4],
      [card.querySelector('.art-label-web'), 9, 5]
    ].map(([node, dx, dy]) => ({
      x: gsap.quickTo(node, 'x', { duration: .35, ease: 'power2.out' }),
      y: gsap.quickTo(node, 'y', { duration: .35, ease: 'power2.out' }),
      dx, dy
    }));
    function move(x, y) {
      for (const layer of layers) {
        layer.x(x * layer.dx);
        layer.y(y * layer.dy);
      }
    }
    function follow(event) {
      if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
      const bounds = card.getBoundingClientRect();
      move(2 * (event.clientX - bounds.left) / bounds.width - 1,
        2 * (event.clientY - bounds.top) / bounds.height - 1);
    }
    const reset = () => move(0, 0);
    card.addEventListener('pointermove', follow);
    card.addEventListener('pointerleave', reset);
    return () => {
      card.removeEventListener('pointermove', follow);
      card.removeEventListener('pointerleave', reset);
    };
  });
})();
