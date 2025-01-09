import { EditorView, minimalSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { EditorState, Prec } from '@codemirror/state';
import { bracketMatching } from '@codemirror/language';
import { keymap, lineNumbers } from '@codemirror/view';
import { yCollab } from 'y-codemirror.next';
import { Session } from '@flok-editor/session';
import { flashField, evalKeymap, remoteEvalFlash } from '@flok-editor/cm-eval';
import { UndoManager } from 'yjs';
import { highlightExtension, highlightMiniLocations, updateMiniLocations } from '@strudel/codemirror';
import { strudelTheme } from './theme';
import { autocompletion, closeBrackets } from '@codemirror/autocomplete';
import { applySettingsToNudel, getSettings } from './settings.js';
import { vim } from '@replit/codemirror-vim';
import { Compartment } from '@codemirror/state';
import './style.css';
import { nudelConfirm } from './confirm.js';
import { nudelAlert } from './alert.js';

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

// dynamic codemirror extensions
const extensions = {
  lineWrapping: (on) => (on ? EditorView.lineWrapping : []),
  lineNumbers: (on) => (on ? lineNumbers() : []),
  closeBrackets: (on) => (on ? closeBrackets() : []),
};
const compartments = Object.fromEntries(Object.keys(extensions).map((key) => [key, new Compartment()]));
const reconfigureExtension = (key, value, view) => {
  console.log('reconfigureExtension', key, value);
  view.dispatch({
    effects: compartments[key].reconfigure(extensions[key](value)),
  });
};
const initialSettings = Object.keys(compartments).map((key) =>
  compartments[key].of(extensions[key](getSettings()[key])),
);
console.log('initialSettings', initialSettings);
export const updateExtensions = (settings, appliedSettings) => {
  const keys = Object.keys(extensions);
  console.log('keys', keys);
  for (let index in keys) {
    const key = keys[index];
    for (let [_, view] of editorViews) {
      if (settings[key] !== appliedSettings[key]) {
        console.log('reconfigure', key, settings[key]);
        reconfigureExtension(key, settings[key], view);
      }
    }
  }
};

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
      minimalSetup,
      strudelTheme,
      flokBasicSetup(doc),
      javascript(),
      getSettings().vimMode ? vim() : [],
      autocompletion({ override: [] }),
      bracketMatching({ brackets: '()[]{}<>' }),
      ...initialSettings,
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

  const side = parseInt(doc.id) % 2 == 0 ? 'right' : 'left';

  slotsEl.insertAdjacentHTML(
    'beforeend',
    `<div class="slot ${side}" id="slot-${doc.id}">
      <header>
        <select class="target">
          ${supportedTargets.map((target) => `<option value="${target}">${target}</option>`).join('\n')}
        </select>
        <button class="run">▶run</button>
      </header>
    <div class="editor"></div>
  </div>`,
  );

  const tabsEl = document.querySelector(`.tabs .${side}`);
  tabsEl.insertAdjacentHTML(
    'beforeend',
    `<button class="tab ${side}" id="tab-${doc.id}">
            ${doc.id} ${doc.target}
      </button>`,
  );

  document.querySelector(`#tab-${doc.id}`).addEventListener('click', () => {
    tabsEl.querySelectorAll('.tab').forEach((tab) => {
      tab.classList.remove('active');
    });
    document.querySelector(`#tab-${doc.id}`).classList.add('active');
    editorViews.get(doc.id)?.focus();

    slotsEl.querySelectorAll(`.slot.${side}`).forEach((slot) => {
      slot.classList.remove('active');
    });
    slotsEl.querySelector(`#slot-${doc.id}`).classList.add('active');
  });

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

const mcPlantButton = document.querySelector('#mcplant-button');
mcPlantButton.addEventListener('click', async () => {
  const result = await nudelConfirm('eat a mcplant');
  if (result) {
    nudelAlert('You eat the McPlant. It tastes just like a real burger.');
  }
});

session.initialize();
applySettingsToNudel();
