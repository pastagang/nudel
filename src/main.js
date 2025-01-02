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

import './style.css';

const editorViews = new Map();

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

const createEditor = (doc) => {
  console.log('createEditor', doc);
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
      // TODO: add a setting for this
      // EditorView.lineWrapping,
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

  const editorEl = document.querySelector(`#slot-${doc.id} .editor`);
  const view = new EditorView({
    state,
    parent: editorEl,
  });
  editorViews.set(doc.id, view);

  const targetEl = document.querySelector(`#slot-${doc.id} .target`);
  targetEl.value = doc.target;

  targetEl.addEventListener('change', (e) => {
    doc.target = e.target.value;
  });
  doc.session.on(`change-target:${doc.id}`, () => {
    targetEl.value = doc.target;
  });

  const runButton = document.querySelector(`#slot-${doc.id} .run`);
  runButton.addEventListener('click', () => {
    doc.evaluate(doc.content);
  });
};

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

  // Create editors for each document
  session.getDocuments().map((doc) => createEditor(doc));
});

// hydra
const hydraFrame = document.getElementById('hydra');
session.on('eval:hydra', (msg) => hydraFrame.contentWindow.postMessage({ type: 'eval', msg }));

// strudel
const strudelFrame = document.getElementById('strudel');
session.on('eval:strudel', (msg) => strudelFrame.contentWindow.postMessage({ type: 'eval', msg }));

const strudelEventHandlers = {
  onHighlight: (docId, phase) => {
    // update codemirror view to highlight this frame's haps
    const view = editorViews.get(docId);
    // we need to set the haps on the window, as data sent through postMessage is serialized
    // serialized haps won't work with highlightMiniLocations
    // the strudel frame will set the needed phase and haps
    const haps = window.highlights[docId] || [];
    // console.log(window.highlights[docId]);
    highlightMiniLocations(view, phase, haps);
  },
  onError: (err, docId) => {
    console.log('onError', docId);
    console.error(err);
  },
  onUpdateMiniLocations: (docId, miniLocations) => {
    const view = editorViews.get(docId);
    updateMiniLocations(view, miniLocations);
  },
};
window.addEventListener('message', (event) => {
  if (event.origin !== window.location.origin) {
    return;
  }
  const handler = strudelEventHandlers[event.data.type];
  // console.log(event.data.type, event.data.msg);
  handler && handler(...event.data.msg);
});

session.initialize();
