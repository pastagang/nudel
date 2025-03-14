import { Session } from '@flok-editor/session';
import { getStdSource } from './export.js';
import { pastamirror, Frame } from './main.js';
import { clearGlobalError, setError, clearLocalError } from './error.js';
import { getSettings, getUserColorFromUserHue } from './settings.js';
import { subscribeToChat, unsubscribeFromChat } from './chat.js';
import { getCurrentMantra } from './random.js';

const PASTAGANG_ROOM_NAME = 'pastagang3';

/** @type {Session | null} */
let _session = null;

export function getRoomName() {
  const settings = getSettings();
  if (!settings.customRoomEnabled) return PASTAGANG_ROOM_NAME;
  return settings.customRoomName;
}

export function getSession() {
  if (!_session) {
    _session = makeSession();
  }
  return _session;
}

export function refreshSession() {
  pastamirror.currentEditors.keys().forEach((key) => pastamirror.deleteEditor(key));
  _session = makeSession();
  return _session;
}

function makeSession() {
  if (_session) {
    _session.destroy();
  }

  const roomName = getRoomName();
  const session = new Session(roomName, {
    hostname: 'flok.cc',
    isSecure: true,
  });

  session.on('sync', () => {
    // If session is empty, create two documents
    const documents = session.getDocuments();
    if (documents.length === 0) {
      session.setActiveDocuments([{ id: '1', target: 'strudel' }]);
      session.setActiveDocuments([{ id: '2', target: 'strudel' }]);
      session.setActiveDocuments([{ id: '3', target: 'strudel' }]);
      session.setActiveDocuments([{ id: '4', target: 'strudel' }]);
    }

    // const playButton = document.getElementById('about-yes-button');
    // if (playButton) {
    //   playButton.classList.remove('loading');
    // }
  });

  session.on('change', (documents) => {
    documents.map((doc) => {
      if (!pastamirror.currentEditors.has(doc.id)) {
        pastamirror.createEditor(doc);
      }
    });

    pastamirror.currentEditors.keys().forEach((key) => {
      if (!documents.find((doc) => doc.id === key)) {
        pastamirror.deleteEditor(key);
      }
    });
  });

  session.on('pubsub:open', () => {
    clearGlobalError();
    // session._pubSubClient seems to take a while to be defined..
    // this might or might not be a good place to make sure its ready
    // the event might call multiple times so... do i need to unsub???
    subscribeToChat();
  });
  session.on('pubsub:close', () => {
    // untested
    setError('Disconnected from Server...');
    // unsub session:pastagang:chat here?
    // lets try (?)
    unsubscribeFromChat();
  });

  // hydra
  session.on('eval:hydra', (msg) => {
    msg.body += '\n\n\n' + getStdSource();
    Frame.hydra?.contentWindow.postMessage({ type: 'eval', msg });
  });
  // shader
  session.on('eval:shader', (msg) => Frame.shader?.contentWindow.postMessage({ type: 'eval', msg }));
  // strudel
  session.on('eval:strudel', (msg) => {
    msg.body += '\n\n\n' + getStdSource();
    return Frame.strudel?.contentWindow.postMessage({ type: 'eval', msg });
  });
  // kabelsalat
  session.on('eval:kabelsalat', (msg) => Frame.kabelsalat?.contentWindow.postMessage({ type: 'eval', msg }));

  // clear local error when new eval comes in
  session.on('eval', (msg) => clearLocalError(msg.docId));

  session.initialize();

  const settings = getSettings();
  session.user = getCurrentMantra();
  session.userColor = getUserColorFromUserHue(settings.userHue);

  return session;
}
