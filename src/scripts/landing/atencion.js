import { prepareChat } from './chat.js';
import { createPlayer, playLogo, wait } from './player.js';

export async function animate(section, signal) {
  const logo = createPlayer(section, 'logo', signal);
  const robot = createPlayer(section, 'robot', signal);
  const phone = section.querySelector('#celular2');
  const chat = prepareChat(section, signal);

  function showPhone() {
    phone.removeAttribute('data-awaiting-animation');
  }

  signal.addEventListener('abort', showPhone, { once: true });

  playLogo(logo, signal);
  phone.setAttribute('data-awaiting-animation', '');

  try {
    await robot.play('robotAnim0');
    await robot.play('robotAnim1');
    phone.removeAttribute('data-awaiting-animation');
    await wait(1000, signal);
    await robot.play('robotAnim3');
    await robot.play('robotanim10');
    await robot.play('robotanim11', { loop: true });
    await wait(500, signal);

    for (const message of chat.messages) {
      chat.show(message);
      await wait(4000, signal);
    }

    await robot.play('robotanim12');
  } catch (error) {
    if (!signal.aborted) chat.reset();
    throw error;
  } finally {
    if (!signal.aborted) showPhone();
  }
}
