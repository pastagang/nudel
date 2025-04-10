import HydraRenderer from 'hydra-synth';

import { getWeather } from './timedEvents/weather.js';
import { getNudelHour, NUDEL_HOUR_IN_A_NUDEL_DAY } from './timedEvents/time.js';

export class HydraSession {
  constructor({ onError, canvas, onHighlight }) {
    this.initialized = false;
    this.onError = onError;
    this.canvas = canvas;
    this.onHighlight = onHighlight;
    this.init();
  }

  resize() {
    if (this.initialized) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this._hydra?.setResolution(window.innerWidth, window.innerHeight);
    }
  }

  async init() {
    if (this.initialized) return;

    try {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this._hydra = new HydraRenderer({
        // @ts-expect-error
        canvas: this.canvas,
        enableAudio: false,
      });
      this._hydra.synth.time = getMilliSecondsSinceNudelDayStart() / 1000;
    } catch (error) {
      console.error(error);
      this.onError(`${error}`);
      return;
    }

    window.H = this._hydra;
    const HydraSource = this._hydra.s?.[0].constructor;
    const GlslSource = osc().constructor;

    // Enable using strudel style mini-patterns for argument control on Hydra.
    // strudel needs to be loaded first, otherwise this will cause warnings, and rendering will not
    // include the mini-pattern.
    // Inspired by
    // - https://github.com/atfornes/Hydra-strudel-extension/blob/51a93496b1b05ea00c08d1dec10e046aa3769c93/hydra-strudel.js#L72
    // - https://github.com/tidalcycles/strudel/blob/26cc7e2920e32ec01bf22e1dae8ced716462a158/packages/hydra/hydra.mjs#L50
    window.P = (pattern) => {
      return () => {
        if (window.parent.strudel == undefined) return 1;
        // parse using the strudel mini parser
        const reified = window.parent.strudel.mini.minify(pattern);

        const now = window.parent.strudel.core.getTime();

        // query the current value
        const arc = reified.queryArc(now, now);
        return arc[0].value;
      };
    };

    // initialized a streaming canvas with the strudel draw context canvas
    // this allows us to use the strudel output
    HydraSource.prototype.initStrudel = function () {
      throw Error("Sorry 's0.initStrudel' has been temporarily renamed to 'useStrudelCanvas(s0)'");
      // if (window.parent.strudel == undefined) return;
      // const canvas = window.parent.strudel.draw.getDrawContext().canvas;
      // canvas.style.display = 'none';
      // this.init({ src: canvas });
    };

    window.useStrudelCanvas = (s) => {
      // throw Error("'useStrudelCanvas(s0)' has been renamed to 's0.initStrudel'");
      if (window.parent.strudel == undefined) return;
      const canvas = window.parent.strudel.draw.getDrawContext().canvas;
      canvas.style.display = 'none';
      s.init({ src: canvas });
    };

    const contexts = {};

    if (window.parent.getWeather().noSamples) {
      HydraSource.prototype.initImage = () => {
        throw Error('no samples today (images are samples)');
      };
      HydraSource.prototype.initVideo = () => {
        throw Error('no samples today (videos are samples)');
      };
    }

    // Patching initCam
    // so we can override the default camera index with a setting
    const originCam = HydraSource.prototype.initCam;
    HydraSource.prototype.initCam = function (index, params) {
      const self = this;
      const settings = parent.getSettings();
      const chosenIndex = index != null ? index : settings.cameraIndex !== 'none' ? settings.cameraIndex : 0;

      return originCam.bind(this)(chosenIndex, params);
    };

    // Patching initScreen
    // to only init screen once
    const originScreen = HydraSource.prototype.initScreen;
    let screenIsInit = false;
    HydraSource.prototype.initScreen = function () {
      if (!screenIsInit) {
        originScreen.bind(this)();
      }
      screenIsInit = true;
    };

    HydraSource.prototype.initCanvas = function (width = 1000, height = 1000) {
      throw Error("Sorry 'initCanvas' has been temporarily disabled");
      // if (contexts[this.label] == undefined) {
      //   const canvas = new OffscreenCanvas(width, height);
      //   const ctx = canvas.getContext('2d');
      //   contexts[this.label] = ctx;
      // }

      // const ctx = contexts[this.label];
      // const canvas = ctx.canvas;
      // if (canvas.width !== width && canvas.height !== height) {
      //   canvas.width = width;
      //   canvas.height = height;
      // } else {
      //   ctx.clearRect(0, 0, width, height);
      // }
      // this.init({ src: canvas });
      // return ctx;
    };

    const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

    // Enables Hydra to use Strudel frequency data
    // with `.scrollX(() => fft(1,0)` it will influence the x-axis, according to the fft data
    // first number is the index of the bucket, second is the number of buckets to aggregate the number too
    window.fft = (
      ...args
      // index, //: number,
      // buckets = 8, //: number = 8,
      // optionsArg, //: string | { min?: number; max?: number; scale?: number; analyzerId?: string; },
    ) => {
      let index = 1;
      let buckets = 8;
      let optionsArg = {};

      // if (typeof args[0] === 'string') {
      //   optionsArg = { analyzerId: args[0] };
      // } else {
      index = args[0] ?? 0;
      buckets = args[1] ?? 1;
      optionsArg = args[2] ?? {};
      // }

      const options = typeof optionsArg === 'string' ? { analyzerId: optionsArg } : optionsArg;
      const analyzerId = options?.analyzerId ?? 'flok-master';
      const min = options?.min ?? -150;
      const scale = options?.scale ?? 1;
      const max = options?.max ?? 0;

      const strudel = window.parent?.strudel;
      // Strudel is not initialized yet, so we just return a default value
      if (strudel?.webaudio?.analysers == undefined) return 0.5;

      // If display settings are not enabled, we just return a default value
      // if (!(this._displaySettings.enableFft ?? true)) return 0.5;

      // Enable auto-analyze
      strudel.enableAutoAnalyze = true;

      // If the analyzerId is not defined, we just return a default value
      if (strudel.webaudio.analysers[analyzerId] == undefined) {
        return 0.5;
      }

      const freq = strudel.webaudio.getAnalyzerData('frequency', analyzerId); // as Array<number>;
      const bucketSize = freq.length / buckets;

      // inspired from https://github.com/tidalcycles/strudel/blob/a7728e3d81fb7a0a2dff9f2f4bd9e313ddf138cd/packages/webaudio/scope.mjs#L53
      const normalized = freq.map((it /*: number*/) => {
        const norm = clamp((it - min) / (max - min), 0, 1);
        return norm * scale;
      });

      return normalized.slice(bucketSize * index, bucketSize * (index + 1)).reduce((a, b) => a + b, 0) / bucketSize;
    };

    const hydraOut = GlslSource.prototype.out;
    GlslSource.prototype.out = function (_output) {
      let afterTransform = this;
      const weather = getWeather();
      if (weather.kaleidoscope) {
        const amount = 2 + Math.floor((getNudelHour() % NUDEL_HOUR_IN_A_NUDEL_DAY) / 3);
        afterTransform = afterTransform.kaleid(amount);
      }
      if (weather.pixelated) {
        const pixel = (getNudelHour() % NUDEL_HOUR_IN_A_NUDEL_DAY) + 30;
        afterTransform = afterTransform.pixelate(pixel, pixel);
      }
      hydraOut.bind(afterTransform)(_output);
    };

    /**
     * This whole block is only to work around problems in the rendering pipeline of hydra like this:
     * https://github.com/hydra-synth/hydra-synth/issues/150
     * It will stop hydra, and re-init it.
     * It will cause a black canvas immediatly, once the problem is fixed, hydra will work again
     *
     * Idealy we would not cause black screens, but could somehow ignore the problematic code, but
     * that might be a problem Hydra needs to tackle
     */
    const self = this;
    for (let i = 0; i < this._hydra.o.length; i++) {
      const originTick = this._hydra.o[i]?.tick;
      const _hydra = this._hydra;
      function nudelHydraOutputTick(args) {
        try {
          originTick.bind(_hydra.o[i])(args);
        } catch (e) {
          console.error('Error in Hydra tick, hard refresshing the iframe!');
          console.error(e);
          self.onError(`Hydra crashed with ${e.message.slice(0, 50)}\n restarted hydra`, self.lastDocId);
          window.location.reload();
        }
      }
      this._hydra.o[i].tick = nudelHydraOutputTick.bind(this._hydra.o[i]);
    }

    this.initialized = true;
    console.log('Hydra initialized');
  }

  async eval(msg, conversational = false) {
    if (!this.initialized) await this.init();
    const { body: code, docId } = msg;
    this.lastDocId = docId;

    try {
      await eval?.(`(async () => {
        ${code}
      })()`);
    } catch (error) {
      console.error(error);
      this.onError(`${error}`, docId);
    }
  }
}
