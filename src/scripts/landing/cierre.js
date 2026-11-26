import { createPlayer, playLogo, wait } from './player.js';

export async function animate(section, signal) {
  const logo = createPlayer(section, 'logo', signal);
  const robot = createPlayer(section, 'robot', signal);
  const wrapper = section.querySelector('#robot4wrap');

  function hideRobot() {
    wrapper.hidden = true;
    wrapper.classList.remove('initial', 'transit', 'dissappear');
  }

  signal.addEventListener('abort', hideRobot, { once: true });
  wrapper.hidden = false;
  wrapper.classList.add('initial');

  try {
    await wait(1000, signal);
    await robot.play('robotAnim1');
    await robot.play('robotAnim19');
    playLogo(logo, signal);
    wrapper.classList.add('dissappear');
    wrapper.classList.remove('initial');
    await wait(700, signal);
    wrapper.classList.add('transit');
    await wait(3500, signal);
    wrapper.classList.remove('dissappear');
    await robot.play('robotAnim20');
    wrapper.classList.add('dissappear');
  } finally {
    if (!signal.aborted) {
      await wait(800, signal);
      hideRobot();
      robot.reset();
    }
  }
}
