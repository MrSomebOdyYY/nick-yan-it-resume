(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const gsap = window.gsap;
  if (!gsap || !('IntersectionObserver' in window) || reduce.matches) return;

  const groups = [];
  const active = new Set();
  let stopped = false;
  let observer;
  const visibleTargets = targets => targets.filter(node => node && !node.closest('[hidden]'));
  const clear = targets => {
    gsap.set(targets, { clearProps: 'transform,opacity' });
    targets.forEach(node => node.classList.remove('section-motion-running'));
  };
  function finish(group) {
    group.done = true;
    observer?.unobserve(group.trigger);
    if (group.animation) {
      group.animation.progress(1).kill();
      active.delete(group.animation);
    }
    clear(group.targets);
    group.trigger.dataset.sectionMotion = 'complete';
  }
  function finishAll() {
    if (stopped) return;
    stopped = true;
    observer?.disconnect();
    groups.forEach(finish);
  }
  function reveal(group) {
    if (group.done || stopped) return;
    group.done = true;
    observer.unobserve(group.trigger);
    const targets = visibleTargets(group.targets);
    if (!targets.length || reduce.matches) return finish(group);
    targets.forEach(node => node.classList.add('section-motion-running'));
    const timeline = gsap.timeline({
      paused: document.hidden,
      onComplete: () => {
        clear(targets);
        group.trigger.dataset.sectionMotion = 'complete';
        active.delete(timeline);
      }
    });
    group.animation = timeline;
    active.add(timeline);
    group.trigger.dataset.sectionMotion = 'running';
    timeline.fromTo(targets, { opacity: .12, y: 20 }, {
      opacity: 1, y: 0, duration: .68, stagger: .085, ease: 'power3.out'
    }, 0);
  }
  function register(trigger, targets) {
    if (!trigger || !targets.length) return;
    const group = { trigger, targets: Array.from(targets), done: false };
    groups.push(group);
    trigger.dataset.sectionMotion = 'waiting';
    // Only prepare content genuinely below the fold. A restored/deep-linked
    // viewport keeps its already-visible text, without a late script hiding it.
    const rect = trigger.getBoundingClientRect();
    if (rect.height && rect.top >= innerHeight) {
      gsap.set(visibleTargets(group.targets), { opacity: .12, y: 20 });
    } else if (rect.height && rect.top < innerHeight && rect.bottom > 0) {
      return finish(group);
    }
    observer.observe(trigger);
  }

  try {
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const group = groups.find(item => item.trigger === entry.target);
        if (group) reveal(group);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });

    // The existing scroll-linked Experience statement owns its .word spans.
    // Bookmark sheets/washes keep their own animation; only inner text enters.
    document.querySelectorAll('.projects .section-heading, .about .section-heading').forEach(heading => {
      register(heading, heading.children);
    });
    const experienceTitle = document.querySelector('#experience-title');
    if (experienceTitle) register(experienceTitle, [experienceTitle]);
    document.querySelectorAll('.project-copy').forEach(copy => {
      register(copy, copy.querySelectorAll(':scope > p, :scope > h3, :scope > .tags, :scope > details'));
    });
    document.querySelectorAll('.experience-entry, .skill-row').forEach(entry => register(entry, entry.children));
    const education = document.querySelector('.education');
    if (education) register(education, education.children);

    const contact = document.querySelector('#contact');
    if (contact) register(contact.querySelector('.contact-heading'), contact.querySelectorAll(
      '.availability, #contact-title, .contact-layout > div > p, .contact-email, .contact-phone, .contact-links > a'
    ));

    // A keyboard user never has to wait for the text surrounding a focused link.
    document.addEventListener('focusin', event => {
      groups.forEach(group => {
        if (group.trigger.contains(event.target) || group.targets.some(node => node.contains(event.target))) finish(group);
      });
    });
    document.addEventListener('click', event => {
      const controls = event.target.closest('.bookmark-controls');
      if (!controls) return;
      const book = controls.closest('[data-book]');
      groups.filter(group => book?.contains(group.trigger)).forEach(finish);
    }, true);
    document.addEventListener('keydown', event => {
      const controls = event.target.closest('.bookmark-controls');
      if (controls && ['ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter', ' '].includes(event.key)) {
        const book = controls.closest('[data-book]');
        groups.filter(group => book?.contains(group.trigger)).forEach(finish);
      }
      if (event.key !== 'Tab') return;
      groups.filter(group => group.trigger.getBoundingClientRect().top < innerHeight).forEach(finish);
    }, true);
    document.addEventListener('visibilitychange', () => {
      active.forEach(animation => document.hidden ? animation.pause() : animation.resume());
    });
    reduce.addEventListener('change', () => { if (reduce.matches) finishAll(); });
    window.addEventListener('beforeprint', finishAll);
    window.addEventListener('pagehide', finishAll, { once: true });
  } catch {
    // An enhancement failure must not strand content at its preparation values.
    finishAll();
  }
})();
