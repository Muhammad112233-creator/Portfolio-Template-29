import '@fontsource-variable/dm-sans';
import '@fontsource-variable/space-grotesk';
import './style.css';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createEarthScene } from './earth.js';
import { projectDetails, skillSets, translations } from './content.js';

gsap.registerPlugin(ScrollTrigger);

const body = document.body;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const sectionLinks = [...document.querySelectorAll('.scroll-index__item')];
const sectionIds = ['#hero', '#manifesto', '#parcours', '#toolkit', '#projects', '#contact'];
const cursor = document.querySelector('#cursor-follower');
const projectPreview = document.querySelector('#project-preview');
let locale = localStorage.getItem('ayla-portfolio-locale') === 'fr' ? 'fr' : 'en';
let lenis;
let earth;
let menuIsOpen = false;
let lastActiveSection = 0;

const setLanguage = (nextLocale) => {
  locale = nextLocale;
  document.documentElement.lang = locale;
  localStorage.setItem('ayla-portfolio-locale', locale);
  document.querySelectorAll('[data-copy]').forEach((element) => {
    const value = translations[locale][element.dataset.copy];
    if (typeof value === 'string') element.textContent = value;
  });
  document.querySelectorAll('[data-locale-label]').forEach((element) => {
    element.classList.toggle('is-active', element.dataset.localeLabel === locale);
  });
  const languageButton = document.querySelector('#language-toggle');
  languageButton.setAttribute('aria-label', locale === 'en' ? 'Switch language to French' : 'Passer la langue en anglais');
};

const closeMenu = () => {
  if (!menuIsOpen) return;
  menuIsOpen = false;
  body.classList.remove('menu-is-open');
  document.querySelector('#menu-toggle').setAttribute('aria-expanded', 'false');
  document.querySelector('#menu-toggle').setAttribute('aria-label', 'Open navigation menu');
  document.querySelector('#site-nav').setAttribute('inert', '');
};

const openMenu = () => {
  menuIsOpen = true;
  body.classList.add('menu-is-open');
  document.querySelector('#menu-toggle').setAttribute('aria-expanded', 'true');
  document.querySelector('#menu-toggle').setAttribute('aria-label', 'Close navigation menu');
  document.querySelector('#site-nav').removeAttribute('inert');
};

function setupNavigation() {
  const mobileNav = window.matchMedia('(max-width: 640px)').matches;
  if (mobileNav) document.querySelector('#site-nav').setAttribute('inert', '');

  document.querySelector('#language-toggle').addEventListener('click', () => {
    setLanguage(locale === 'en' ? 'fr' : 'en');
  });
  document.querySelector('#menu-toggle').addEventListener('click', () => {
    menuIsOpen ? closeMenu() : openMenu();
  });
  window.addEventListener('resize', () => {
    if (!window.matchMedia('(max-width: 640px)').matches) {
      document.querySelector('#site-nav').removeAttribute('inert');
      closeMenu();
    } else if (!menuIsOpen) {
      document.querySelector('#site-nav').setAttribute('inert', '');
    }
  }, { passive: true });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const hash = link.getAttribute('href');
      const target = document.querySelector(hash);
      if (!target) return;
      event.preventDefault();
      closeMenu();
      if (lenis) lenis.scrollTo(target, { duration: reducedMotion ? 0 : 1.35, offset: -4, lock: true });
      else target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
      history.replaceState(null, '', hash);
    });
  });
}

function setupSmoothScroll() {
  if (reducedMotion) {
    lenis = new Lenis({ autoRaf: true, smoothWheel: false, syncTouch: false });
    return;
  }
  lenis = new Lenis({
    duration: 1.15,
    smoothWheel: true,
    syncTouch: false,
    wheelMultiplier: 0.92,
    touchMultiplier: 1.1,
    anchors: false,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

function setInterfaceColor(color) {
  body.dataset.interfaceColor = color;
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  metaTheme?.setAttribute('content', color === 'light' ? '#1f1d1d' : '#f5e7df');
}

function setupSectionNavigation() {
  sectionIds.forEach((id, index) => {
    const section = document.querySelector(id);
    if (!section) return;
    ScrollTrigger.create({
      trigger: section,
      start: 'top center',
      end: index === sectionIds.length - 1 ? 'max' : 'bottom center',
      onEnter: () => setActiveSection(index),
      onEnterBack: () => setActiveSection(index),
      onUpdate: (self) => {
        sectionLinks[index]?.style.setProperty('--item-progress', self.progress.toFixed(3));
      },
    });
  });
  ScrollTrigger.create({
    trigger: '#manifesto', start: 'top -38%', onEnter: () => setInterfaceColor('dark'),
    onEnterBack: () => setInterfaceColor('dark'), onLeaveBack: () => setInterfaceColor('light'),
  });
  ScrollTrigger.create({
    trigger: '#parcours', start: 'top 80px', onEnter: () => setInterfaceColor('light'),
    onEnterBack: () => setInterfaceColor('light'), onLeaveBack: () => setInterfaceColor('dark'),
  });
  ScrollTrigger.create({
    trigger: '#projects', start: 'top 80px', onEnter: () => setInterfaceColor('dark'),
    onEnterBack: () => setInterfaceColor('dark'), onLeaveBack: () => setInterfaceColor('light'),
  });
  ScrollTrigger.create({
    trigger: '#contact', start: 'top 80px', onEnter: () => setInterfaceColor('light'),
    onEnterBack: () => setInterfaceColor('light'), onLeaveBack: () => setInterfaceColor('dark'),
  });
}

function setActiveSection(index) {
  lastActiveSection = index;
  sectionLinks.forEach((link, itemIndex) => {
    const difference = Math.abs(itemIndex - index);
    link.classList.toggle('is-active', difference === 0);
    link.classList.toggle('is-neighbor', difference === 1);
    if (difference === 0) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}

function setupHeroMotion() {
  const hero = document.querySelector('#hero');
  const heroFrame = document.querySelector('.hero__frame');
  if (!hero || !earth) return;
  const mobile = window.matchMedia('(max-width: 680px)').matches;
  const duration = mobile ? 2800 : 3500;

  gsap.timeline({
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: `+=${duration}`,
      scrub: 0.7,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => earth.setProgress(self.progress),
      onLeave: () => earth.setActive(false),
      onEnterBack: () => earth.setActive(true),
    },
  })
    .to('.hero__content', { yPercent: -18, autoAlpha: 0.22, ease: 'none' }, 0.34)
    .to('.hero__topline', { y: -38, autoAlpha: 0.35, ease: 'none' }, 0.2)
    .to('.hero__frame', { borderRadius: '50px', scale: 0.94, ease: 'none' }, 0.72)
    .to('.hero__ambient', { scale: 1.3, opacity: 0.72, ease: 'none' }, 0.35);

  gsap.fromTo('.hero__title > *', { yPercent: 115, rotate: 2 }, {
    yPercent: 0, rotate: 0, duration: 1.1, stagger: 0.12, ease: 'power4.out', delay: 0.25,
  });
  gsap.fromTo('.hero__topline, .hero__intro, .hero__footer', { y: 18, autoAlpha: 0 }, {
    y: 0, autoAlpha: 1, duration: 0.9, stagger: 0.09, ease: 'power3.out', delay: 0.42,
  });
}

function splitLetters(element) {
  if (element.dataset.split === 'true') return;
  const text = element.textContent.trim();
  element.dataset.originalText = text;
  element.setAttribute('aria-label', text);
  element.innerHTML = [...text].map((letter) => `<span class="manifesto__letter" aria-hidden="true">${letter === ' ' ? '&nbsp;' : letter}</span>`).join('');
  element.dataset.split = 'true';
}

function setupManifestoMotion() {
  const container = document.querySelector('.manifesto__container');
  const text = document.querySelector('.manifesto__text');
  if (!container || !text) return;
  splitLetters(text);
  const letters = [...text.querySelectorAll('.manifesto__letter')];
  const overflow = () => Math.max(0, text.scrollWidth - window.innerWidth + window.innerWidth * 1.65);
  const travel = () => Math.max(1100, overflow());

  const horizontalMotion = gsap.to(text, {
    x: () => -Math.max(0, text.scrollWidth - window.innerWidth * 0.6),
    ease: 'none',
    scrollTrigger: {
      trigger: container,
      start: 'top top',
      end: () => `+=${travel()}`,
      scrub: 0.6,
      invalidateOnRefresh: true,
    },
  });
  ScrollTrigger.create({
    trigger: container,
    start: 'top top',
    end: () => `+=${travel()}`,
    pin: true,
    pinSpacing: true,
    invalidateOnRefresh: true,
  });

  letters.forEach((letter, index) => {
    gsap.fromTo(letter, { yPercent: (index % 2 ? 1 : -1) * 24, rotate: (index % 2 ? 1 : -1) * 3 }, {
      yPercent: 0, rotate: 0, ease: 'elastic.out(1.2, 0.48)',
      scrollTrigger: { trigger: letter, containerAnimation: horizontalMotion, start: 'left 95%', end: 'left 35%', scrub: 0.45 },
    });
  });
  gsap.to(container, {
    scaleX: 0.975, scaleY: 0.985, borderRadius: '0 0 30px 30px', ease: 'none',
    scrollTrigger: { trigger: '#parcours', start: 'top bottom', end: 'top 25%', scrub: true },
  });
}

function setupJourneyMotion() {
  const pinHeight = document.querySelector('.journey__pin-height');
  const stage = document.querySelector('.journey__stage');
  const sentences = [...document.querySelectorAll('.journey__sentence')];
  const visuals = [...document.querySelectorAll('.journey__visual')];
  const counter = document.querySelector('.journey__counter-current');
  if (!pinHeight || !stage) return;

  gsap.set(sentences, { autoAlpha: 0, yPercent: 18, scale: 0.97 });
  gsap.set(sentences[0], { autoAlpha: 1, yPercent: 0, scale: 1 });
  gsap.set(visuals, { autoAlpha: 0, scale: 0.92, yPercent: -50 });
  gsap.set(visuals[0], { xPercent: -110 });
  gsap.set(visuals[1], { xPercent: 110 });

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: pinHeight,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.85,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const active = Math.min(sentences.length - 1, Math.floor(self.progress * sentences.length));
        counter.textContent = String(active + 1).padStart(2, '0');
      },
    },
  });
  sentences.forEach((sentence, index) => {
    const at = index * 1.2;
    timeline.to(sentence, { autoAlpha: 0, yPercent: -18, scale: 1.02, duration: 0.3, ease: 'power2.in' }, at + 0.82);
    if (index + 1 < sentences.length) {
      timeline.fromTo(sentences[index + 1], { autoAlpha: 0, yPercent: 18, scale: 0.97 }, { autoAlpha: 1, yPercent: 0, scale: 1, duration: 0.38, ease: 'power3.out' }, at + 0.84);
    }
  });
  timeline.to(visuals[0], { xPercent: 0, autoAlpha: 0.88, scale: 1, duration: 0.55, ease: 'power3.out' }, 0.55);
  timeline.to(visuals[1], { xPercent: 0, autoAlpha: 0.82, scale: 1, duration: 0.55, ease: 'power3.out' }, 2.95);
  timeline.to('.journey__visual-orbit--one', { rotation: 90, scale: 1.3, opacity: 0.75, duration: 1.6, ease: 'none' }, 0.2);
  timeline.to('.journey__visual-orbit--two', { rotation: -120, scale: 0.82, opacity: 0.6, duration: 1.7, ease: 'none' }, 1.7);
  timeline.to(visuals, { autoAlpha: 0.34, scale: 1.06, duration: 0.5, ease: 'none' }, 3.55);
}

function buildSkillWheel(id, items) {
  const wheel = document.querySelector(id);
  const count = items.length;
  items.forEach((item, index) => {
    const angle = -90 + (360 / count) * index;
    const radian = (angle * Math.PI) / 180;
    const isMobile = window.matchMedia('(max-width: 640px)').matches;
    const x = Math.cos(radian) * (isMobile ? 44 : 39.5);
    const y = Math.sin(radian) * (isMobile ? 30 : 22);
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'tool-card';
    card.style.setProperty('--x', `${x}vw`);
    card.style.setProperty('--y', `${y}vh`);
    card.style.setProperty('--card-color', item.color);
    card.setAttribute('aria-label', `${item.title}. Select to see a note.`);
    card.setAttribute('aria-pressed', 'false');
    card.innerHTML = `
      <span class="tool-card__inner">
        <span class="tool-card__face tool-card__face--front">
          <span class="tool-card__index">${String(index + 1).padStart(2, '0')} <i>/ 08</i></span>
          <span class="tool-card__symbol" aria-hidden="true">${item.mark}</span>
          <span class="tool-card__title">${item.title}</span>
          <span class="tool-card__hint" aria-hidden="true">↗</span>
        </span>
        <span class="tool-card__face tool-card__face--back">
          <span class="tool-card__back-mark" aria-hidden="true">${item.mark}</span>
          <span class="tool-card__note">${item.note}</span>
          <span class="tool-card__back-title">${item.title}</span>
        </span>
      </span>`;
    card.addEventListener('click', () => {
      const isFlipped = card.classList.toggle('is-flipped');
      card.setAttribute('aria-pressed', String(isFlipped));
      document.querySelectorAll('.tool-card').forEach((other) => {
        if (other !== card) {
          other.classList.remove('is-flipped');
          other.setAttribute('aria-pressed', 'false');
        }
      });
    });
    wheel.append(card);
  });
}

function setupToolkitMotion() {
  const pinHeight = document.querySelector('.toolkit__pin-height');
  const frontWheel = document.querySelector('.toolkit__wheel--front');
  const artWheel = document.querySelector('.toolkit__wheel--art');
  const frontSubtitle = document.querySelector('.toolkit__subtitle--front');
  const artSubtitle = document.querySelector('.toolkit__subtitle--art');
  const progressBar = document.querySelector('.toolkit__progress span');
  const cardsFront = [...frontWheel.querySelectorAll('.tool-card')];
  const cardsArt = [...artWheel.querySelectorAll('.tool-card')];
  if (!pinHeight) return;

  const updateWheel = (wheel, cards, spin, opacity) => {
    wheel.style.transform = `rotate(${spin}deg)`;
    wheel.style.opacity = opacity;
    cards.forEach((card) => {
      card.style.rotate = `${-spin}deg`;
      card.style.pointerEvents = opacity > 0.8 ? 'auto' : 'none';
      card.tabIndex = opacity > 0.8 ? 0 : -1;
    });
  };
  ScrollTrigger.create({
    trigger: pinHeight,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.7,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      const p = self.progress;
      const frontExit = gsap.utils.clamp(0, 1, (p - 0.47) / 0.025);
      const artEnter = gsap.utils.clamp(0, 1, (p - 0.495) / 0.025);
      const frontOpacity = 1 - frontExit;
      updateWheel(frontWheel, cardsFront, -p * 240, frontOpacity);
      updateWheel(artWheel, cardsArt, 120 - p * 290, artEnter);
      frontWheel.setAttribute('aria-hidden', String(frontOpacity <= 0.5));
      artWheel.setAttribute('aria-hidden', String(artEnter <= 0.5));
      frontSubtitle.classList.toggle('is-active', artEnter < 0.5);
      artSubtitle.classList.toggle('is-active', artEnter >= 0.5);
      progressBar.style.transform = `scaleX(${p})`;
      document.querySelector('.toolkit__section-number').innerHTML = `${p < 0.5 ? '03' : '04'} <i>/</i> 06`;
    },
  });
  gsap.fromTo('.toolkit__header, .toolkit__meta', { y: 30, autoAlpha: 0 }, {
    y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out',
    scrollTrigger: { trigger: pinHeight, start: 'top 65%', once: true },
  });
}

function setupProjectPreview() {
  const previewImage = projectPreview.querySelector('img');
  const previewCaption = projectPreview.querySelector('.project-preview__caption');
  const dialog = document.querySelector('#project-dialog');
  const dialogImage = dialog.querySelector('.project-dialog__image');
  const dialogEyebrow = dialog.querySelector('.project-dialog__eyebrow');
  const dialogTitle = dialog.querySelector('#dialog-title');
  const dialogDescription = dialog.querySelector('.project-dialog__description');
  const dialogYear = dialog.querySelector('.project-dialog__year');
  let pointerX = window.innerWidth * 0.5;
  let pointerY = window.innerHeight * 0.5;
  let raf = 0;
  let activeProject = null;

  const movePreview = (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (!raf) raf = requestAnimationFrame(() => {
      projectPreview.style.setProperty('--x', `${pointerX + 28}px`);
      projectPreview.style.setProperty('--y', `${pointerY + 22}px`);
      raf = 0;
    });
  };

  document.querySelectorAll('.project-link').forEach((button) => {
    const project = projectDetails[button.dataset.project];
    if (!project) return;
    button.addEventListener('pointerenter', () => {
      activeProject = project;
      if (!finePointer) return;
      previewImage.src = project.image;
      previewImage.alt = project.alt;
      previewCaption.textContent = project.title;
      projectPreview.classList.add('is-visible');
    });
    button.addEventListener('pointermove', movePreview, { passive: true });
    button.addEventListener('pointerleave', () => {
      activeProject = null;
      projectPreview.classList.remove('is-visible');
    });
    button.addEventListener('focus', () => {
      activeProject = project;
      previewImage.src = project.image;
      previewImage.alt = project.alt;
      previewCaption.textContent = project.title;
      projectPreview.classList.add('is-visible');
    });
    button.addEventListener('blur', () => projectPreview.classList.remove('is-visible'));
    button.addEventListener('click', () => {
      dialogImage.src = project.image;
      dialogImage.alt = project.alt;
      dialogEyebrow.textContent = project.discipline;
      dialogTitle.textContent = project.title;
      dialogDescription.textContent = project.description;
      dialogYear.textContent = project.year;
      if (!dialog.open) dialog.showModal();
      document.body.classList.add('dialog-is-open');
    });
  });

  dialog.querySelector('.project-dialog__close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => document.body.classList.remove('dialog-is-open'));
  dialog.addEventListener('cancel', () => document.body.classList.remove('dialog-is-open'));

  if (finePointer && !reducedMotion) {
    const cursorX = gsap.quickTo(cursor, 'x', { duration: 0.32, ease: 'power3' });
    const cursorY = gsap.quickTo(cursor, 'y', { duration: 0.32, ease: 'power3' });
    window.addEventListener('pointermove', (event) => {
      cursorX(event.clientX);
      cursorY(event.clientY);
    }, { passive: true });
    document.querySelectorAll('a, button').forEach((element) => {
      element.addEventListener('pointerenter', () => cursor.classList.add('is-hot'));
      element.addEventListener('pointerleave', () => cursor.classList.remove('is-hot'));
    });
    document.querySelectorAll('.project-link').forEach((element) => {
      element.addEventListener('pointerenter', () => {
        cursor.classList.add('is-project');
        cursor.querySelector('.cursor-follower__label').textContent = 'view';
      });
      element.addEventListener('pointerleave', () => {
        cursor.classList.remove('is-project');
        cursor.querySelector('.cursor-follower__label').textContent = 'open';
      });
    });
    window.addEventListener('pointerleave', () => cursor.classList.remove('is-hot', 'is-project'));
  }
}

function setupProjectMotion() {
  const pinHeight = document.querySelector('.projects__pin-height');
  const title = document.querySelector('.projects__heading');
  const links = [...document.querySelectorAll('.project-link')];
  if (!pinHeight) return;
  gsap.set(title, { autoAlpha: 0, y: 26 });
  gsap.set(links, { autoAlpha: 0, y: 34 });
  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: pinHeight,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.75,
      invalidateOnRefresh: true,
    },
  });
  timeline.to(title, { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power3.out' }, 0.12);
  links.forEach((link, index) => {
    const start = 0.3 + index * 0.52;
    timeline.to(link, { autoAlpha: 1, y: 0, duration: 0.38, ease: 'power3.out' }, start);
  });
  timeline.fromTo('.projects__bottom', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 2.35);
  gsap.fromTo('.projects__meta', { y: -14, autoAlpha: 0 }, {
    y: 0, autoAlpha: 1, duration: 0.65, ease: 'power3.out',
    scrollTrigger: { trigger: pinHeight, start: 'top 70%', once: true },
  });
}

function setupNextMotion() {
  const pinHeight = document.querySelector('.next-section__pin-height');
  const stage = document.querySelector('.next-section__stage');
  const intro = document.querySelector('.next-section__intro');
  const wave = document.querySelector('.next-section__wave');
  const textPath = document.querySelector('#wave-text-path');
  const wavePath = document.querySelector('#wave-path');
  const orb = document.querySelector('#wave-orb');
  const footer = document.querySelector('#footer-content');
  const waveLength = wavePath.getTotalLength();
  if (!pinHeight) return;

  gsap.set(wave, { xPercent: 8, autoAlpha: 0, scale: 0.88 });
  gsap.set(footer, { clipPath: 'circle(0% at 50% 50%)', autoAlpha: 0 });
  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: pinHeight,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.85,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const progress = self.progress;
        const offset = progress * 6;
        textPath.setAttribute('startOffset', `${offset}%`);
        const point = wavePath.getPointAtLength(waveLength * Math.max(0, Math.min(1, progress)));
        orb.setAttribute('cx', point.x.toFixed(1));
        orb.setAttribute('cy', point.y.toFixed(1));
        if (progress > 0.67) footer.removeAttribute('inert');
        else footer.setAttribute('inert', '');
      },
    },
  });
  timeline.to(intro, { autoAlpha: 0, scale: 0.91, y: -42, duration: 0.32, ease: 'power2.in' }, 0.22);
  timeline.to(wave, { autoAlpha: 1, xPercent: -8, scale: 1, duration: 0.5, ease: 'power2.out' }, 0.44);
  timeline.to(wave, { xPercent: -22, scale: 1.06, duration: 1.15, ease: 'none' }, 0.8);
  timeline.to(footer, { clipPath: 'circle(115% at 50% 50%)', autoAlpha: 1, duration: 0.9, ease: 'power2.inOut' }, 1.48);
  timeline.to(wave, { autoAlpha: 0.45, yPercent: -18, duration: 0.45 }, 1.9);
}

function setupFooterLinks() {
  document.querySelector('#copyright-year').textContent = String(new Date().getFullYear());
  const footer = document.querySelector('#footer-content');
  const setInert = () => {
    const rect = footer.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const revealed = getComputedStyle(footer).clipPath.includes('115%');
    if (revealed) footer.removeAttribute('inert');
  };
  window.addEventListener('resize', setInert, { passive: true });
}

function setupLoader() {
  const loader = document.querySelector('#site-loader');
  const hide = () => {
    window.setTimeout(() => {
      loader.classList.add('is-hidden');
      window.setTimeout(() => loader.remove(), 1100);
    }, reducedMotion ? 180 : 720);
  };
  if (document.fonts?.ready) document.fonts.ready.then(hide);
  else window.addEventListener('load', hide, { once: true });
  window.setTimeout(() => loader.classList.add('is-hidden'), 2400);
}

function setupPreload() {
  Object.values(projectDetails).forEach((project) => {
    const image = new Image();
    image.src = project.image;
  });
}

function init() {
  setLanguage(locale);
  buildSkillWheel('#tool-wheel-front', skillSets.front);
  buildSkillWheel('#tool-wheel-art', skillSets.art);
  setupSmoothScroll();
  setupNavigation();
  setupProjectPreview();
  setupFooterLinks();
  setupPreload();

  const canvas = document.querySelector('#earth-canvas');
  try {
    earth = createEarthScene(canvas);
  } catch (error) {
    console.warn('The 3D globe could not start; showing the CSS fallback instead.', error);
    document.querySelector('.hero__globe-fallback').classList.add('is-visible');
  }

  setupHeroMotion();
  setupManifestoMotion();
  setupJourneyMotion();
  setupToolkitMotion();
  setupProjectMotion();
  setupNextMotion();
  setupSectionNavigation();
  setupLoader();
  ScrollTrigger.refresh();
}

init();
