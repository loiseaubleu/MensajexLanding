export function prepareChat(section, signal) {
  const list = section.querySelector('[data-chat]');
  const screen = list.parentElement;
  const messages = [...list.querySelectorAll('[data-chat-message]')];

  function reset() {
    for (const message of messages) {
      message.hidden = false;
      message.removeAttribute('data-chat-revealed');
    }
    screen.scrollTop = 0;
  }

  signal?.addEventListener('abort', reset, { once: true });
  for (const message of messages) message.hidden = true;

  return {
    messages,
    show(message) {
      message.hidden = false;
      message.setAttribute('data-chat-revealed', '');
      screen.scrollTop = screen.scrollHeight;
    },
    reset,
  };
}
