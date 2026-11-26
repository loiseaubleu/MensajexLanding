import { wait } from './player.js';

export function setupPhoneList(phoneList, signal) {
  let blacked = false;
  const elements = Array.from(phoneList.children);
  const NUM_COUNT = elements.length;

  let centerIndex = 0;

  function generatePhoneNumber() {
    const random = Math.floor(1000000 + Math.random() * 8999000);
    return `${String(random).slice(0, 2)}-${String(random).slice(2, 6)}####`;
  }

  const numbers = elements.map(element => element.textContent);
  const original = elements.map(element => ({ text: element.textContent, className: element.className }));

  signal.addEventListener('abort', () => {
    elements.forEach((element, index) => {
      element.textContent = original[index].text;
      element.className = original[index].className;
    });
  }, { once: true });

  function after(ms, update) {
    wait(ms, signal).then(update, () => {});
  }

  function updateVisuals() {
    for (let i = 0; i < NUM_COUNT; i++) {
      const el = elements[i];
      const relativeIndex = (i - centerIndex + NUM_COUNT) % NUM_COUNT;

      el.className = `phone-number pos-${relativeIndex}`;
      el.textContent = numbers[i];

      if (relativeIndex === 0 || relativeIndex === NUM_COUNT - 1) {
        el.classList.add("faded");
      }

      if (relativeIndex === 2 || relativeIndex === 4) {
        el.classList.add("shift-small");
      } else if (relativeIndex === 3) {
        el.classList.add("shift-center", "center");
        if (blacked) {
          el.classList.add('red-glow');
          numbers[i] = "BlackList";

          after(2700, () => { el.textContent = 'BlackList'; });
          after(3500, () => el.classList.remove('red-glow'));
          blacked = false;
        } else {
          el.classList.add('active');
          after(2000, () => el.classList.remove('active'));
        }
      }
    }
  }

  function advanceList() {
    centerIndex = (centerIndex + 1) % NUM_COUNT;
    const visualTopIndex = (centerIndex + NUM_COUNT - 2) % NUM_COUNT;

    numbers[visualTopIndex] = generatePhoneNumber();
    updateVisuals();
  }
  return { advanceList, triggerBlack: () => { blacked = true; } };
}
