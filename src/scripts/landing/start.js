import { prepareChat } from './chat.js';

const sections = {
  inicio: () => import('./inicio.js'),
  atencion: () => import('./atencion.js'),
  control: () => import('./control.js'),
  cierre: () => import('./cierre.js'),
};

async function start(section, signal, chat) {
  try {
    const { animate } = await sections[section.dataset.landingSection]();
    signal?.throwIfAborted();
    await animate(section, signal, chat);
  } catch (error) {
    if (signal?.aborted) return;
    chat?.reset();
    console.error('No se pudo reproducir la animación de la sección', section.dataset.landingSection, error);
  }
}

async function finishIntro() {
  const overlay = document.querySelector('#loadingOverlay');
  if (!overlay || overlay.hidden) return;

  const dismissed = new Promise(resolve => {
    overlay.addEventListener('landing:dismissed', resolve, { once: true });
  });

  import('./loading.js')
    .then(({ animateLoading }) => animateLoading(overlay))
    .catch(error => console.error('No se pudo reproducir la introducción de Mensajex', error))
    .finally(() => overlay.dispatchEvent(new Event('landing:ready')));

  await dismissed;
}

async function initialize() {
  const hero = document.querySelector('[data-landing-section="inicio"]');
  const chat = prepareChat(hero);
  await finishIntro();

  const runs = new Map();
  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
        for (const { isIntersecting, target } of entries) {
          if (!isIntersecting) {
            runs.get(target)?.abort();
            runs.delete(target);
          } else if (!runs.has(target)) {
            const run = new AbortController();
            runs.set(target, run);
            start(target, run.signal);
          }
        }
      }, { rootMargin: '75px 0px' })
    : null;

  const reveal = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
        for (const { isIntersecting, target } of entries) {
          if (!isIntersecting) continue;
          reveal.unobserve(target);
          target.classList.add('landing-section-entering');
        }
      })
    : null;

  for (const section of document.querySelectorAll('[data-landing-section]')) {
    if (section.dataset.landingSection === 'inicio') {
      start(section, undefined, chat);
    } else {
      observer?.observe(section);
      reveal?.observe(section);
    }
  }
}

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  initialize();
}
