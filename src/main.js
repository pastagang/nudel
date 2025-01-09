import { Session } from '@flok-editor/session';
import { nudelAlert } from './alert.js';
import { nudelConfirm } from './confirm.js';
import { createEditor, deleteEditor, currentEditors } from './editor.js';
import { applySettingsToNudel } from './settings.js';
import './style.css';

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
    if (!currentEditors.has(doc.id)) {
      createEditor(doc);
    }
  });

  currentEditors.keys().forEach((key) => {
    if (!documents.find((doc) => doc.id === key)) {
      deleteEditor(key);
    }
  });
});

export function getHydraFrame() {
  return document.getElementById('hydra');
}

export function getShaderFrame() {
  return document.getElementById('shader');
}

export function getStrudelFrame() {
  return document.getElementById('strudel');
}

export const Frame = {
  hydra: getHydraFrame(),
  shader: getShaderFrame(),
  strudel: getStrudelFrame(),
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

// error handling
const setError = (message, docId) => {
  console.error(message);
  if (!docId) {
    // todo: where to show global errors?
    return;
  }
  const slot = document.querySelector(`#slot-${docId}`);
  let errorEl = document.querySelector(`#slot-${docId} #error-${docId}`);

  if (errorEl) {
    errorEl.innerText = message;
  } else {
    slot.insertAdjacentHTML('beforeend', `<div class="error" id="error-${docId}">${message}</div>`);
  }
};
const clearError = (docId) => {
  document.querySelector(`#slot-${docId} #error-${docId}`)?.remove();
};
// clear local error when new eval comes in
session.on('eval', (msg) => clearError(msg.docId));

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
