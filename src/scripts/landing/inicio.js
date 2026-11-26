import { createPlayer, playLogo, wait } from './player.js';

export async function animate(section, _signal, chat) {
  const logo = createPlayer(section, 'logo');
  const robot = createPlayer(section, 'robot');

  playLogo(logo);

  await robot.play('robotAnim0');
  await robot.play('robotanim6');

  chat.show(chat.messages[0]);
  await wait(950);
  chat.show(chat.messages[1]);
  await robot.play('robotanim8', { loop: true });
}
