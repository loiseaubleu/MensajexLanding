import { createPlayer, wait } from './player.js';

// Give each clip its own limit so slow downloads don't consume the whole intro.
const clipTimeout = 15000;
const intro = ['robotAnim1', 'robotanim2', 'robotAnim3', 'robotAnim4_1'];

function showProgress(overlay) {
  const circle = overlay.querySelector('.loading-circle');
  const label = overlay.querySelector('.loading-percentage');
  const startedAt = performance.now();

  return new Promise(resolve => {
    function update(now) {
      const percentage = Math.min(100, Math.floor((now - startedAt) / 20));
      label.textContent = `${percentage}%`;
      circle.style.setProperty('--loading-angle', `${percentage * 3.6}deg`);

      if (percentage < 100 && !overlay.hidden) {
        requestAnimationFrame(update);
      } else {
        resolve();
      }
    }

    requestAnimationFrame(update);
  });
}

async function playClip(robot, clip, options) {
  let timeout;
  const deadline = new Promise((_, reject) => {
    timeout = window.setTimeout(() => reject(new Error(`El clip ${clip} demoró demasiado`)), clipTimeout);
  });

  try {
    await Promise.race([robot.play(clip, options), deadline]);
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function animateLoading(overlay) {
  if (overlay.hidden) return;
  overlay.dispatchEvent(new Event('landing:intro-started'));
  const robot = createPlayer(overlay, 'robot');

  await Promise.all([playClip(robot, 'robotAnim0'), showProgress(overlay)]);
  await wait(400);

  for (const clip of intro) {
    if (overlay.hidden) return;
    await playClip(robot, clip);
  }

  if (overlay.hidden) return;
  let exit;
  await playClip(robot, 'robotanim4_2', {
    onStart: () => { exit = pushRing(overlay); },
  });
  await exit;
}

async function pushRing(overlay) {
  // Around frame 60 the robot leans into the push.
  await wait(550);
  if (overlay.hidden) return;

  const scene = overlay.querySelector('.loading-scene');
  const exit = scene.animate(
    [{ transform: 'translateX(0)' }, { transform: 'translateX(calc(50vw + 50% + 1px))' }],
    { duration: 1450, easing: 'ease-in', fill: 'forwards' },
  );
  await exit.finished;
}
