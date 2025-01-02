import {
  controls,
  evalScope,
  repl,
  stack,
  evaluate,
  silence,
} from "@strudel/core";
import { Framer } from "@strudel/draw";
import { registerSoundfonts } from "@strudel/soundfonts";
import { transpiler } from "@strudel/transpiler";
import {
  getAudioContext,
  initAudio,
  registerSynthSounds,
  samples,
  webaudioOutput,
} from "@strudel/webaudio";

controls.createParam("docId");

export class StrudelSession {
  constructor({ onError, onHighlight, onUpdateMiniLocations }) {
    this.init();
    this.patterns = {};
    this.pPatterns = {};
    this.allTransform = undefined;
    this.anonymousIndex = 0;
    this.onError = onError;
    this.onHighlight = onHighlight;
    this.onUpdateMiniLocations = onUpdateMiniLocations;
    this.enableAutoAnalyze = true;
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

    // why do we need to await this stuff here?
    this.core = await import("@strudel/core");
    this.mini = await import("@strudel/mini");
    this.webaudio = await import("@strudel/webaudio");
    this.draw = await import("@strudel/draw");

    await evalScope(
      this.core,
      this.mini,
      this.webaudio,
      this.draw,
      import("@strudel/tonal"),
      import("@strudel/soundfonts"),
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
      onSchedulerError: (e) => this.onError(`${e}`),
      getTime: () => getAudioContext().currentTime,
      transpiler,
    });
    this.injectPatternMethods();

    this.initHighlighting();
  }

  initHighlighting() {
    let lastFrame /* : number | null  */ = null;
    this.framer = new Framer(
      () => {
        const phase = this.repl.scheduler.now();
        if (lastFrame === null) {
          lastFrame = phase;
          return;
        }
        if (!this.repl.scheduler.pattern) {
          return;
        }
        // queries the stack of strudel patterns for the current time
        const allHaps = this.repl.scheduler.pattern.queryArc(
          Math.max(lastFrame, phase - 1 / 10), // make sure query is not larger than 1/10 s
          phase
        );
        // filter out haps that are not active right now
        const currentFrame = allHaps.filter(
          (hap) => phase >= hap.whole.begin && phase <= hap.endClipped
        );
        // iterate over each strudel doc
        Object.keys(this.patterns).forEach((docId) => {
          // filter out haps belonging to this document (docId is set in eval)
          const haps =
            currentFrame.filter((h) => h.value.docId === docId) || [];
          this.onHighlight(docId, phase || 0, haps);
        });
      },
      (err) => {
        console.error("[strudel] draw error", err);
      }
    );
    this.framer.start(); // tbd allow disabling highlighting
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
    const { body: code, docId } = msg;
    try {
      !conversational && this.hush();
      // little hack that injects the docId at the end of the code to make it available in afterEval
      let { pattern, meta } = await evaluate(
        code,
        transpiler
        // { id: '?' }
      );

      this.onUpdateMiniLocations(docId, meta?.miniLocations || []);

      // let pattern = silence;
      if (Object.keys(this.pPatterns).length) {
        let patterns = Object.values(this.pPatterns);
        pattern = stack(...patterns);
      }
      if (this.allTransform) {
        pattern = this.allTransform(pattern);
      }

      // fft wiring
      if (this.enableAutoAnalyze) {
        pattern = pattern.fmap((value) => {
          if (value.analyze == undefined) {
            value.analyze = "flok-master";
          }
          return value;
        });
      }

      if (!pattern) {
        return;
      }
      //console.log("evaluated patterns", this.pPatterns);
      this.patterns[docId] = pattern.docId(docId); // docId is needed for highlighting
      //console.log("this.patterns", this.patterns);
      const allPatterns = stack(...Object.values(this.patterns));

      await this.repl.scheduler.setPattern(allPatterns, true);

      //console.log("afterEval", meta);
    } catch (err) {
      console.error(err);
      this.onError(`${err}`, docId);
    }
  }
}
