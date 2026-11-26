import lottie from 'lottie-web/build/player/lottie_light.js';

const animations = new Map();

export async function wait(milliseconds, signal) {
  signal?.throwIfAborted();

  await new Promise((resolve, reject) => {
    function abort() {
      clearTimeout(timeout);
      reject(signal.reason);
    }

    const timeout = setTimeout(() => {
      signal?.removeEventListener('abort', abort);
      resolve();
    }, milliseconds);

    signal?.addEventListener('abort', abort, { once: true });
  });
}

function getAnimation(file) {
  if (!animations.has(file)) {
    const request = fetch(`/animations/${file}.json`).then(response => {
      if (!response.ok) throw new Error(`Error cargando ${file}: HTTP ${response.status}`);
      return response.json();
    }).catch(error => {
      animations.delete(file);
      throw error;
    });
    animations.set(file, request);
  }
  return animations.get(file);
}

export function createPlayer(section, name, signal) {
  const element = section.querySelector(`[data-animation="${name}"]`);
  const container = element.querySelector('[data-player]');
  let animation;

  function reset() {
    animation?.destroy();
    animation = undefined;
    element.removeAttribute('data-playing');
  }

  signal?.addEventListener('abort', reset, { once: true });

  return {
    async play(file, { loop = false, onStart } = {}) {
      signal?.throwIfAborted();
      const data = await getAnimation(file);
      signal?.throwIfAborted();
      animation?.destroy();
      animation = lottie.loadAnimation({
        container,
        renderer: 'svg',
        autoplay: false,
        loop,
        // Lottie puede modificar los datos; cada reproductor necesita su propia copia.
        animationData: structuredClone(data),
      });

      await new Promise((resolve, reject) => {
        animation.addEventListener('DOMLoaded', resolve);
        animation.addEventListener('data_failed', reject);
        animation.addEventListener('error', reject);
        animation.addEventListener('destroy', () => reject(signal?.reason));
      });
      signal?.throwIfAborted();
      element.setAttribute('data-playing', '');

      if (loop) {
        animation.play();
        return;
      }

      await new Promise((resolve, reject) => {
        animation.addEventListener('complete', resolve);
        animation.addEventListener('error', reject);
        animation.addEventListener('destroy', () => reject(signal?.reason));
        animation.play();
        onStart?.();
      });
    },
    reset,
  };
}

export async function playLogo(logo, signal) {
  try {
    await logo.play('logoanim');
  } catch (error) {
    if (signal?.aborted) return;
    logo.reset();
    console.error('No se pudo reproducir el logo de Mensajex', error);
  }
}

