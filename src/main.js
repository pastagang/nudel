import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { EditorState, Prec } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { yCollab } from 'y-codemirror.next';
import { Session } from '@flok-editor/session';
import { flashField, evalKeymap, remoteEvalFlash } from '@flok-editor/cm-eval';
import { UndoManager } from 'yjs';
import { highlightExtension, highlightMiniLocations, updateMiniLocations } from '@strudel/codemirror';
import { strudelTheme } from './theme';
import { autocompletion } from '@codemirror/autocomplete';

import './style.css';
import { applySettingsToNudel, getSettings } from './settings.js';
import { vim } from '@replit/codemirror-vim';

export const editorViews = new Map();

const flokBasicSetup = (doc) => {
  const text = doc.getText();
  const undoManager = new UndoManager(text);
  const web = true;

  return [
    flashField(),
    highlightExtension,
    remoteEvalFlash(doc),
    Prec.high(evalKeymap(doc, { web, defaultMode: 'document' })),
    yCollab(text, doc.session.awareness, {
      undoManager,
      showLocalCaret: true,
      scrollIntoView: false,
    }),
  ];
};

const currentEditors = new Map();

const supportedTargets = ['strudel', 'hydra', 'shader'];

const createEditor = (doc) => {
  // console.log('createEditor', doc);
  if (!['1', '2', '3', '4', '5', '6', '7', '8'].includes(doc.id)) {
    console.warn(`ignoring doc with id "${doc.id}". only slot1 and slot2 is allowed rn..`);
    return;
  }

  const stopKeys = ['Ctrl-.', 'Alt-.'];
  const state = EditorState.create({
    doc: doc.content,
    extensions: [
      basicSetup,
      strudelTheme,
      flokBasicSetup(doc),
      javascript(),
      getSettings().vimMode ? vim() : [],
      autocompletion({ override: [] }),
      // todo: reconfigure on change, search "reconfigure(" in the strudel repo
      getSettings().lineWrapping ? EditorView.lineWrapping : [],
      Prec.highest(
        keymap.of([
          ...stopKeys.map((key) => ({
            key,
            run: () => {
              doc.evaluate('$: silence', { from: null, to: null });
              return true;
            },
          })),
        ]),
      ),
    ],
  });

  const slotsEl = document.querySelector('.slots');

  slotsEl.insertAdjacentHTML(
    'beforeend',
    `<div class="slot" id="slot-${doc.id}">
      <header>
        <select class="target">
          ${supportedTargets.map((target) => `<option value="${target}">${target}</option>`).join('\n')}
        </select>
        <button class="run">▶run</button>
      </header>
    <div class="editor"></div>
  </div>`,
  );

  const editorEl = document.querySelector(`#slot-${doc.id} .editor`);
  const view = new EditorView({
    state,
    parent: editorEl,
  });
  editorViews.set(doc.id, view);

  const targetEl = document.querySelector(`#slot-${doc.id} .target`);
  if (!supportedTargets.includes(doc.target)) {
    targetEl.insertAdjacentHTML('beforeend', `<option value="${doc.target}">? ${doc.target} ?</option>`);
    console.warn(`unsupported target "${doc.target}" in doc "${doc.id}". evaluations will be ignored`);
  }
  targetEl.value = doc.target;

  targetEl.addEventListener('change', (e) => {
    doc.target = e.target.value;
  });
  doc.session.on(`change-target:${doc.id}`, () => {
    targetEl.value = doc.target;
  });

  const runButton = document.querySelector(`#slot-${doc.id} .run`);
  runButton.addEventListener('click', () => {
    doc.evaluate(doc.content, { from: 0, to: doc.content.length });
  });

  currentEditors.set(doc.id, { state });
};

function deleteEditor(id) {
  editorViews.delete(id);
  currentEditors.delete(id);
  document.querySelector(`#slot-${id}`).remove();
}

const session = new Session('pastagang', {
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
// we need to access these variables from the iframe:
window.editorViews = editorViews;
window.highlightMiniLocations = highlightMiniLocations; // we cannot import this for some reason
window.updateMiniLocations = updateMiniLocations; // we cannot import this for some reason

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

session.initialize();
applySettingsToNudel();
