import { Session } from '@flok-editor/session';
import { getStdSource } from './export.js';
import { pastamirror, Frame } from './main.js';
import { clearGlobalError, setError, clearLocalError } from './error.js';
import { getSettings, getUserColorFromUserHue } from './settings.js';
import { subscribeToChat, unsubscribeFromChat } from './chat.js';
import { getCurrentMantra } from './timedEvents/mantra.js';
import { getWeather } from '../climate.js';
import { EMOTICONS } from './random.js';
// @ts-ignore
import { PASTAGANG_ROOM_NAME } from 'https://www.pastagang.cc/pastagang.js';
import { initCss } from './css-panels.js';

export function getRoomName() {
  const params = new URLSearchParams(window.location.search);
  if (params.has('song')) return params.get('song');

  const settings = getSettings();
  if (!settings.customRoomEnabled) return PASTAGANG_ROOM_NAME;
  return settings.customRoomName;
}

/** @type {Session | null} */
let _session = null;

export function getSession() {
  if (!_session) _session = makeSession();
  return _session;
}

export function refreshSession() {
  // https://github.com/pastagang/nudel/issues/102
  const keysIterator = pastamirror.currentEditors?.keys();
  for (const key of keysIterator) {
    pastamirror.deleteEditor(key);
  }
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
    // If session is empty, create documents
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
    // https://github.com/pastagang/nudel/issues/102 ???
    const keysIterator = pastamirror.currentEditors?.keys();
    for (const key of keysIterator) {
      if (!documents.find((doc) => doc.id === key)) {
        pastamirror.deleteEditor(key);
      }
    }
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
  // js
  session.on('eval:js', (msg) => getSettings().jsEnabled ? new Function(msg.body)() : () => {});
  // css
  initCss(session);
  // hydra
  session.on('eval:hydra', (msg) => {
    msg.body += '\n\n\n' + getStdSource();
    Frame.hydra?.contentWindow.postMessage({ type: 'eval', msg });
  });
  // shader
  session.on('eval:shader', (msg) =>
    Frame.shader?.contentWindow.postMessage({
      type: 'eval',
      msg,
    }),
  );
  // strudel
  session.on('eval:strudel', (msg) => {
    msg.body += '\n\n\n' + getStdSource();
    return Frame.strudel?.contentWindow.postMessage({ type: 'eval', msg });
  });
  // kabelsalat
  session.on('eval:kabelsalat', (msg) =>
    Frame.kabelsalat?.contentWindow.postMessage({
      type: 'eval',
      msg,
    }),
  );

  // clear local error when new eval comes in
  session.on('eval', (msg) => clearLocalError(msg.docId));

  session.initialize();

  const settings = getSettings();
  session.user = getUserName();
  session.userColor = getUserColorFromUserHue(settings.userHue);

  return session;
}

export function getUserName() {
  const weather = getWeather();
  const settings = getSettings();

  let name = settings.username?.trim() ?? 'anonymous nudelfan';

  if (weather.mantraName) {
    // we can replace, because mantra and emotions are never at the same day
    name = getCurrentMantra();
  }

  if (weather.emoticons) {
    // we can replace, because mantra and emotions are never at the same day
    name = EMOTICONS[Math.floor(Math.random() * EMOTICONS.length)];
  }

  if (weather.palindromeNames) {
    name += name.split('').reverse().splice(1).join('');
  }

  if (name) return name;

  return name;
}
