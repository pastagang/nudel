import {
  controls,
  evalScope,
  repl,
  stack,
  evaluate,
  silence,
} from "@strudel/core";
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

export class StrudelSession {
  constructor({ onError }) {
    this.init().then(() => {
      console.log("strudel init done", this.repl);
    });
    this.patterns = {};
    this.pPatterns = {};
    this.allTransform = undefined;
    this.anonymousIndex = 0;
    this.onError = onError;
  }
  loadSamples() {
    const ds =
      "https://raw.githubusercontent.com/felixroos/dough-samples/main/";
    return Promise.all([
      samples(`${ds}/tidal-drum-machines.json`),
      samples(`${ds}/piano.json`),
      samples(`${ds}/Dirt-Samples.json`),
      samples(`${ds}/EmuSP12.json`),
      samples(`${ds}/vcsl.json`),
    ]);
  }

  async init() {
    initAudio();
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
        this.loadSamples(),
        registerSynthSounds(),
        registerSoundfonts(),
      ]);
    } catch (err) {
      this.onError(err);
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
      onSchedulerError: (e) => this.onError(`${e}`),
      onEvalError: (e) => this.onError(`${e}`),
      getTime: () => getAudioContext().currentTime,
      transpiler,
    });
    this.injectPatternMethods();
  }

  hush() {
    this.pPatterns = {};
    this.anonymousIndex = 0;
    this.allTransform = undefined;
    return silence;
  }

  // set pattern methods that use this repl via closure
  injectPatternMethods() {
    const self = this;
    Pattern.prototype.p = function (id) {
      if (typeof id === "string" && (id.startsWith("_") || id.endsWith("_"))) {
        // allows muting a pattern x with x_ or _x
        return silence;
      }
      console.log("p", id);
      if (id === "$") {
        // allows adding anonymous patterns with $:
        id = `$${self.anonymousIndex}`;
        self.anonymousIndex++;
      }
      self.pPatterns[id] = this;
      return this;
    };
    Pattern.prototype.q = function () {
      return silence;
    };
    const all = (transform) => {
      this.allTransform = transform;
      return silence;
    };
    /* const stop = () => this.repl.scheduler.stop();
    const start = () => this.repl.scheduler.start();
    const pause = () => this.repl.scheduler.pause();
    const toggle = () => this.repl.scheduler.toggle(); */
    const setCps = (cps) => this.repl.scheduler.setCps(cps);
    const setCpm = (cpm) => this.repl.scheduler.setCps(cpm / 60);
    /* const cpm = register("cpm", function (cpm, pat) {
      return pat._fast(cpm / 60 / scheduler.cps);
    }); */
    return evalScope({
      // cpm,
      all,
      hush: () => this.hush(),
      setCps,
      setcps: setCps,
      setCpm,
      setcpm: setCpm,
    });
  }

  async eval(msg, conversational = false) {
    try {
      !conversational && this.hush();
      const { body: code, docId } = msg;
      // little hack that injects the docId at the end of the code to make it available in afterEval
      /* const { pattern } =  */ await evaluate(
        //`${code}//${docId}`,
        code,
        transpiler
        // { id: '?' }
      );
      let pattern = silence;

      if (Object.keys(this.pPatterns).length) {
        let patterns = Object.values(this.pPatterns);
        pattern = stack(...patterns);
      }
      if (this.allTransform) {
        pattern = this.allTransform(pattern);
      }

      console.log("eval done", this.pPatterns);
      if (pattern) {
        //this.patterns[docId] = pattern.docId(docId); // docId is needed for highlighting
        this.patterns[docId] = pattern; // docId is needed for highlighting
        console.log("this.patterns", this.patterns);
        const allPatterns = stack(...Object.values(this.patterns));
        await this.repl.scheduler.setPattern(allPatterns, true);
      }
    } catch (err) {
      console.error(err);
      this.onError(`${err}`);
    }
  }
}
