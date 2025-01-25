import { Session } from '@flok-editor/session';
import { nudelAlert } from './alert.js';
import { applySettingsToNudel, getSettings } from './settings.js';
import { PastaMirror } from './editor.js';
import { clearInlineErrors, displayInlineErrors } from './error.js';
import './style.css';
import { getStdSource } from './export.js';

export const pastamirror = new PastaMirror();
window.editorViews = pastamirror.editorViews;

export const session = new Session('pastagang', {
  // changed this part to what flok.cc uses
  hostname: 'flok.cc',
  port: '', //parseInt(port),
  isSecure: true,
});
window.session = session;

/* session.on("change", (...args) => console.log("change", ...args));
session.on("message", (msg) => console.log("message", msg)); */

session.on('sync', () => {
  // If session is empty, create two documents
  if (session.getDocuments().length === 0) {
    session.setActiveDocuments([
      { id: '1', target: 'strudel' },
      { id: '2', target: 'strudel' },
      { id: '3', target: 'strudel' },
      { id: '4', target: 'strudel' },
    ]);
  }
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
  session._pubSubClient.subscribe(`session:pastagang:chat`, (args) => pastamirror.chat(args.message));
});
session.on('pubsub:close', () => {
  // untested
  setError('Disconnected from Server...');
  // unsub session:pastagang:chat here?
});

export const Frame = {
  hydra: document.getElementById('hydra'),
  shader: document.getElementById('shader'),
  strudel: document.getElementById('strudel'),
  kabesalat: document.getElementById('kabelsalat'),
};

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

let showGlobalError = (message) => {
  let errorEl = document.querySelector(`#global-error`);
  if (errorEl) {
    errorEl.innerText = message;
  } else {
    document.body.insertAdjacentHTML('beforeend', `<div id="global-error">${message}</div>`);
  }
};

let showLocalError = (docId, message) => {
  const slot = document.querySelector(`#slot-${docId}`);
  let errorEl = document.querySelector(`#slot-${docId} #error-${docId}`);
  if (errorEl) {
    errorEl.innerText = message;
  } else {
    slot.insertAdjacentHTML('beforeend', `<div class="error" id="error-${docId}">${message}</div>`);
  }
};

// error handling
const setError = (message, docId) => {
  console.error(message);
  if (!docId) {
    showGlobalError(message);
    return;
  }
  // messages will either be string or InlineErrorMessage
  if (typeof message != 'string') {
    displayInlineErrors(docId, message);
    return;
  }
  showLocalError(docId, message);
};
const clearLocalError = (docId) => {
  document.querySelector(`#slot-${docId} #error-${docId}`)?.remove();
  clearInlineErrors(docId);
};
const clearGlobalError = () => {
  document.querySelector(`#global-error`)?.remove();
};
// clear local error when new eval comes in
session.on('eval', (msg) => clearLocalError(msg.docId));

window.addEventListener('message', (event) => {
  if (event.origin !== window.location.origin) {
    return;
  }
  if (event.data.type === 'onError') {
    const [err, docId] = event.data.msg;
    setError(err, docId);
  }
});

session.initialize();
applySettingsToNudel();

// is in development mode?
export function isDevelopmentEnvironment() {
  return window.location.hostname === 'localhost';
}

// Reveal all development elements in development
if (isDevelopmentEnvironment()) {
  const elements = document.querySelectorAll('.development');
  elements.forEach((el) => el.classList.remove('development'));
}

//=======================================================================================
// Hello. If you've come here to re-enable paste, then please think carefully.
// Paste has been disabled as an experiment, to see if it affects various things.
//
// - Perhaps disabling paste can lower the overall quality and cleanliness of our code
//   ... which might help to lower standards, and encourage more people to make stuff.
//           It could help people to worry less, and "just type".
//
// - Paste allows people to force certain things to exist for a long time.
//   ... which can give too much power to keen individuals.
//          Let's disable paste for a while, to see if it encourages new trends to form.
//
// - Paste can be a crutch for me during learning.
//   ... I learn much better when I have to manually type things out.
//           Perhaps disabling paste can help me and others to learn better.
//
// - If paste is an option, we'll be tempted to build tools and languages that rely on it.
//    ... I think we should build tools that are optimised for manual typing.
//
// - By disabling paste, we prioritise being in the moment, and creating with others in the open.
//=======================================================================================
addEventListener(
  'paste',
  (e) => {
    if (getSettings().pastingMode) return;
    e.preventDefault();
    nudelAlert(
      '<h2>pasting is disabled</h2><p>to enable pasting, turn on <strong>PASTING MODE</strong> in the settings.</p>',
    );
  },
  { passive: false, capture: true },
);

// add / remove panes
document.getElementById('add-pane-button').addEventListener('click', () => {
  if (!session) return;
  const documents = session.getDocuments();
  const newDocs = [
    ...documents.map((doc) => ({ id: doc.id, target: doc.target })),
    { id: String(documents.length + 1), target: 'strudel' },
  ];
  session.setActiveDocuments(newDocs);
});
document.getElementById('remove-pane-button').addEventListener('click', () => {
  if (!session) return;
  const documents = session.getDocuments();
  session.setActiveDocuments([...documents.map((doc) => ({ id: doc.id, target: doc.target })).slice(0, -1)]);
});
