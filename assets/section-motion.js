// Offline motion study. Static HTML holds all content, including the final
// counter values; this file never changes bookmark selection or the hero.
(() => {
  'use strict';
  const selectors = {
    projects: '.project-grid .project',
    experience: '.experience-list .experience-entry',
    skills: '.skills .skill-row'
  };
  const counters = Array.from(document.querySelectorAll('[data-motion-count]')).map(node => {
    const selector = selectors[node.dataset.motionCount];
    if (!selector) return null;
    const value = document.querySelectorAll(selector).length;
    node.textContent = String(value);
    return { node, value };
  }).filter(Boolean);

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
    group.finish?.();
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
        group.finish?.();
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
    group.decorate?.(timeline);
  }
  function register(trigger, targets, extra = {}) {
    if (!trigger || !targets.length) return;
    const group = { trigger, targets: Array.from(targets), done: false, ...extra };
    groups.push(group);
    trigger.dataset.sectionMotion = 'waiting';
    // Only prepare content genuinely below the fold. A restored/deep-linked
    // viewport keeps its already-visible text, without a late script hiding it.
    const rect = trigger.getBoundingClientRect();
    if (rect.height && rect.top >= innerHeight) {
      gsap.set(visibleTargets(group.targets), { opacity: .12, y: 20 });
    } else if (rect.height && rect.top < innerHeight && rect.bottom > 0) {
      if (!extra.decorate) return finish(group);
      // Decorative Contact/counter accents can start with the text intact.
      group.targets = [];
      group.done = true;
      observer?.unobserve(trigger);
      const timeline = gsap.timeline({ paused: document.hidden,
        onComplete: () => { group.finish?.(); active.delete(timeline); trigger.dataset.sectionMotion = 'complete'; }
      });
      group.animation = timeline;
      active.add(timeline);
      extra.decorate(timeline);
      trigger.dataset.sectionMotion = 'running';
      return;
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

    const facts = document.querySelector('.motion-facts');
    if (facts && counters.length) {
      counters.forEach(counter => {
        const readable = document.createElement('span');
        readable.className = 'sr-only';
        readable.textContent = String(counter.value);
        const visual = document.createElement('span');
        visual.className = 'motion-count-value';
        visual.setAttribute('aria-hidden', 'true');
        visual.textContent = String(counter.value);
        counter.node.replaceChildren(readable, visual);
        counter.visual = visual;
      });
      register(facts, facts.children, {
        finish: () => counters.forEach(counter => { counter.visual.textContent = String(counter.value); }),
        decorate: timeline => counters.forEach((counter, index) => {
          const state = { value: 0 };
          let rendered = -1;
          timeline.to(state, { value: counter.value, duration: .85, ease: 'power2.out',
            onStart: () => { counter.visual.textContent = '0'; },
            onUpdate: () => {
              const value = Math.round(state.value);
              if (value !== rendered) { counter.visual.textContent = String(value); rendered = value; }
            }
          }, .12 + index * .1);
        })
      });
    }

    const contact = document.querySelector('#contact');
    const title = contact?.querySelector('#contact-title');
    if (title) {
      const nodes = [];
      const walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) nodes.push(walker.currentNode);
      const words = [];
      nodes.forEach(node => {
        // Leave whitespace, the original <br> and the accent punctuation alone.
        if (!/[\p{L}\p{N}]/u.test(node.textContent)) return;
        const fragment = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(text => {
          if (!text || /^\s+$/.test(text)) return fragment.append(document.createTextNode(text));
          const word = document.createElement('span');
          word.className = 'contact-motion-word';
          word.append(document.createTextNode(text));
          const accent = document.createElement('span');
          accent.className = 'contact-word-accent';
          accent.setAttribute('aria-hidden', 'true');
          word.append(accent);
          words.push(word);
          fragment.append(word);
        });
        node.replaceWith(fragment);
      });
      const ambient = document.createElement('span');
      ambient.className = 'contact-motion-ambient';
      ambient.setAttribute('aria-hidden', 'true');
      for (let i = 0; i < 2; i++) {
        const orbit = document.createElement('span');
        orbit.className = 'contact-motion-orbit';
        ambient.append(orbit);
      }
      contact.prepend(ambient);
      const accents = words.map(word => word.querySelector('.contact-word-accent'));
      register(contact.querySelector('.contact-heading'), [
        contact.querySelector('.availability'), title,
        ...contact.querySelectorAll('.contact-layout > div > p, .contact-email, .contact-phone, .contact-links > a')
      ].filter(Boolean), {
        finish: () => {
          gsap.set(words, { clearProps: 'color' });
          gsap.set(accents, { scaleX: 1, opacity: .14 });
          gsap.set(ambient, { opacity: .6, clearProps: 'transform' });
          gsap.set(ambient.children, { clearProps: 'transform' });
        },
        decorate: timeline => {
          timeline.fromTo(accents, { scaleX: 0, opacity: .42 }, {
            scaleX: 1, duration: .6, stagger: .09, ease: 'power2.out'
          }, .08).fromTo(words, { color: '#f8f7f2' }, {
            color: '#d7edbc', duration: .42, stagger: .085, ease: 'power1.out'
          }, .1).to(words, { color: '#f8f7f2', duration: .6, stagger: .06 }, .65)
            .to(accents, { opacity: .14, duration: .7, stagger: .06 }, .65)
            .fromTo(ambient, { opacity: 0, y: 14 }, { opacity: .6, y: 0, duration: 1.25, ease: 'power2.out' }, .12)
            .fromTo(ambient.children, { rotation: -18, scale: .96 }, {
              rotation: 0, scale: 1, duration: 1.35, stagger: .08, ease: 'power2.out'
            }, .12);
        }
      });
    }

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
