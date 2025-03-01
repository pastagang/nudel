import { pastamirror } from './main.js';
import { getRoomName, getSession } from './session.js';

export function getChatSessionName() {
  return `session:${getRoomName()}:chat`;
}

export function sendChatMessage({ docId, message, from, user, color }) {
  const session = getSession();
  session._pubSubClient.publish(getChatSessionName(), {
    docId,
    message,
    user,
    from,
    color,
  });
}

export function handleChatMessage(message) {
  const view = pastamirror.editorViews.get(message.docId);
  let from = message.from;
  const pos = view.coordsAtPos(from);
  const chatContainer = document.querySelector('.chat-container');
  if (pos) {
    const messageContainer = document.createElement('div');
    messageContainer.innerText = message.message;
    const pointer_color = message.color;
    messageContainer.style = `position:fixed;top:${pos.top}px;left:${pos.left}px`;
    messageContainer.style.color = pointer_color;
    messageContainer.classList.add('rising-animation');
    messageContainer.classList.add('message-container');
    chatContainer?.appendChild(messageContainer);
    setTimeout(() => {
      messageContainer.remove();
    }, 7000);
  } else {
    console.warn('could not get line position');
  }
}

export function subscribeToChat() {
  const session = getSession();
  session._pubSubClient.subscribe(getChatSessionName(), (args) => handleChatMessage(args.message));
}

export function unsubscribeFromChat() {
  const session = getSession();
  session._pubSubClient.unsubscribe(getChatSessionName());
}
