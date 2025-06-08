import { validate } from 'csstree-validator';
import { InlineErrorMessage, setError } from './error.js';

function clamp(v, min, max) {
  if (v < min) return min;
  if (v > max) return max;
  return v;
}

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

  const strudel = window.strudel;
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

export function initCss(session) {
  const cssHoles = document.querySelectorAll('.css-hole');
  const cssHolesMap = new Map();
  const cssVariablesElement = document.querySelector('#css-variables');

  cssHoles.forEach((v) => {
    const id = v.id.slice('css-hole-'.length);
    cssHolesMap.set(id, v);
  });

  session.on('eval:css', (msg) => {
    const errors = validate(msg.body);

    errors
      .map((it) => new InlineErrorMessage(it.line, `${'-'.repeat(it.column)}^\n${it.message}`))
      .forEach((it) => setError(it, msg.docId));

    if (msg.body.includes('--fft')) {
      requestAnimationFrame(updateFftVariableInCss);
    }
    const cssHole = cssHolesMap.get(msg.docId);
    cssHole.textContent = getSettings().cssEnabled ? msg.body : "";
  });

  // this is not very performant probably (sooory)
  // maybe we could only do this when we need it
  function updateFftVariableInCss() {
    const data = fft();
    cssVariablesElement.textContent = `:root {
      --fft: ${data};
    }`;
    requestAnimationFrame(updateFftVariableInCss);
  }
}
