import { Session } from '@flok-editor/session';
import { nudelAlert } from './alert.js';
import { nudelConfirm } from './confirm.js';
import { applySettingsToNudel } from './settings.js';
import { PastaMirror } from './editor.js';
import './style.css';
import { displayEditorError, clearEditorErrors, ErrorMessage } from './error.js';

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

export const Frame = {
  hydra: document.getElementById('hydra'),
  shader: document.getElementById('shader'),
  strudel: document.getElementById('strudel'),
  kabesalat: document.getElementById('kabelsalat'),
};

// hydra
session.on('eval:hydra', (msg) =>
  Frame.hydra?.contentWindow.postMessage({
    type: 'eval',
    msg,
  }),
);

// shader
session.on('eval:shader', (msg) => Frame.shader?.contentWindow.postMessage({ type: 'eval', msg }));
// strudel
session.on('eval:strudel', (msg) => Frame.strudel?.contentWindow.postMessage({ type: 'eval', msg }));
// kabelsalat
session.on('eval:kabelsalat', (msg) => Frame.kabelsalat?.contentWindow.postMessage({ type: 'eval', msg }));

// error handling
const setError = (message, docId) => {
  console.error(message);
  if (!docId) {
    // todo: where to show global errors?
    return;
  }

  displayEditorError(docId, message);
};
// clear local error when new eval comes in
session.on('eval', (msg) => clearEditorErrors(msg.docId));

window.addEventListener('message', (event) => {
  if (event.origin !== window.location.origin) {
    return;
  }
  if (event.data.type === 'onError') {
    const [err, docId] = event.data.msg;
    setError(err, docId);
  }
});

const mcPlantButton = document.querySelector('#mcplant-button');
mcPlantButton.addEventListener('click', async () => {
  const result = await nudelConfirm('eat a mcplant');
  if (result) {
    nudelAlert('You eat the McPlant. It tastes just like a real burger.');
  }
});

session.initialize();
applySettingsToNudel();

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
/* addEventListener(
  'paste',
  (e) => {
    e.preventDefault();
    nudelAlert('Pasting is disabled until further notice for experimental purposes.');
  },
  { passive: false, capture: true },
); */
