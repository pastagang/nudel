import { EditorView, basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorState, Prec } from "@codemirror/state";
import { yCollab } from "y-codemirror.next";
import { Session } from "@flok-editor/session";
import { flashField, evalKeymap, remoteEvalFlash } from "@flok-editor/cm-eval";
import { UndoManager } from "yjs";

import "./style.css";

// strudel
import { controls, evalScope, repl, stack, evaluate } from "@strudel/core";
// import { Framer } from "@strudel/draw";
import { registerSoundfonts } from "@strudel/soundfonts";
import { transpiler } from "@strudel/transpiler";
import {
  getAudioContext,
  initAudio,
  registerSynthSounds,
  samples,
  webaudioOutput,
} from "@strudel/webaudio";

const audioReady = initAudio().then(() => {
  console.log("audio ready");
});
const onError = (err) => {
  console.error(err);
};

async function loadSamples() {
  const ds = "https://raw.githubusercontent.com/felixroos/dough-samples/main/";
  return Promise.all([
    samples(`${ds}/tidal-drum-machines.json`),
    samples(`${ds}/piano.json`),
    samples(`${ds}/Dirt-Samples.json`),
    samples(`${ds}/EmuSP12.json`),
    samples(`${ds}/vcsl.json`),
  ]);
}

class StrudelSession {
  constructor() {
    this.init().then(() => {
      console.log("strudel init done", this.repl);
    });
    this.patterns = {};
  }
  async init() {
    await evalScope(
      import("@strudel/core"),
      import("@strudel/mini"),
      import("@strudel/tonal"),
      import("@strudel/soundfonts"),
      import("@strudel/webaudio"),
      controls
    );
    try {
      await Promise.all([
        loadSamples(),
        registerSynthSounds(),
        registerSoundfonts(),
      ]);
    } catch (err) {
      onError(err);
    }

    this.repl = repl({
      defaultOutput: webaudioOutput,
      afterEval: (options) => {
        // assumes docId is injected at end end as a comment
        /* const docId = options.code.split("//").slice(-1)[0];
      if (!docId) return;
      const miniLocations = options.meta?.miniLocations;
      updateDocumentsContext(docId, { miniLocations }); */
      },
      beforeEval: () => {},
      onSchedulerError: (e) => onError(`${e}`),
      onEvalError: (e) => onError(`${e}`),
      getTime: () => getAudioContext().currentTime,
      transpiler,
    });
  }
  async eval(msg) {
    try {
      const { body: code, docId } = msg;
      // little hack that injects the docId at the end of the code to make it available in afterEval
      //const pattern = await this._repl.evaluate(`${code}//${docId}`);
      const { pattern } = await evaluate(
        //`${code}//${docId}`,
        code,
        transpiler
        // { id: '?' }
      );
      if (pattern) {
        //this.patterns[docId] = pattern.docId(docId); // docId is needed for highlighting
        this.patterns[docId] = pattern; // docId is needed for highlighting
        console.log("this.patterns", this.patterns);
        const allPatterns = stack(...Object.values(this.patterns));
        await this.repl.scheduler.setPattern(allPatterns, true);
      }
    } catch (err) {
      console.error(err);
      this._onError(`${err}`);
    }
  }
}

const strudel = new StrudelSession();

let patterns = {};
//

const flokBasicSetup = (doc) => {
  const text = doc.getText();
  const undoManager = new UndoManager(text);
  const web = true;

  return [
    flashField(),
    remoteEvalFlash(doc),
    Prec.high(evalKeymap(doc, { web })),
    yCollab(text, doc.session.awareness, { undoManager }),
  ];
};

const createEditor = (doc) => {
  console.log("createEditor", doc);
  if (!["slot1", "slot2"].includes(doc.id)) {
    console.warn(
      `ignoring doc with id "${doc.id}". only slot1 and slot2 is allowed rn..`
    );
    return;
  }
  const state = EditorState.create({
    doc: doc.content,
    extensions: [
      basicSetup,
      flokBasicSetup(doc),
      javascript(),
      EditorView.lineWrapping,
      oneDark,
    ],
  });

  const editorEl = document.querySelector(`#${doc.id} .editor`);
  const view = new EditorView({
    state,
    parent: editorEl,
  });

  const targetEl = document.querySelector(`#${doc.id} .target`);
  targetEl.value = doc.target;

  targetEl.addEventListener("change", (e) => {
    doc.target = e.target.value;
  });
  doc.session.on(`change-target:${doc.id}`, () => {
    targetEl.value = doc.target;
  });

  return [state, view];
};

const handleMessage = (msg) => {
  console.log("message", msg);
  try {
    const pattern = evaluate(msg.body);
    console.log("pattern");
    patterns[msg.docId] = pattern;
  } catch (err) {
    console.error(`eval error: ${err.message}`);
  }
};

const handleEvalHydra = (msg) => {
  console.log("eval:hydra", msg);
  // evaluate hydra code here...
};

const session = new Session("default", {
  // changed this part to what flok.cc uses
  hostname: "flok.cc",
  port: "", //parseInt(port),
  isSecure: true,
});
window.session = session;

session.on("change", (...args) => console.log("change", ...args));
session.on("message", handleMessage);
session.on("eval:hydra", handleEvalHydra);
session.on("eval:strudel", (msg) => strudel.eval(msg));

session.on("sync", () => {
  // If session is empty, create two documents
  if (session.getDocuments().length === 0) {
    session.setActiveDocuments([
      { id: "slot1", target: "strudel" },
      { id: "slot2", target: "hydra" },
    ]);
  }

  // Create editors for each document
  session.getDocuments().map((doc) => createEditor(doc));
});

session.initialize();
