import { createPlayer, playLogo, wait } from './player.js';
import { setupPhoneList } from './phone-list.js';

export async function animate(section, signal) {
  const logo = createPlayer(section, 'logo', signal);
  const robot = createPlayer(section, 'robot', signal);
  const list = setupPhoneList(section.querySelector('[data-component="phone-list"]'), signal);

  playLogo(logo, signal);
  await robot.play('robotanim2');
  await robot.play('robotanim13');

  while (section.isConnected) {
    await robot.play('robotanim14', { loop: true });
    for (let index = 0; index < 3; index++) {
      await wait(2000, signal);
      list.advanceList();
    }

    await wait(2000, signal);
    list.triggerBlack();
    list.advanceList();
    await robot.play('robotAnim16_17_18');
  }

  robot.reset();
}
