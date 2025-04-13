import { getWeather } from './climate.js';

export const MANTRAS = ['make another flok client'];

const CONDITIONAL_MANTRAS = [
  {
    condition: () => getWeather().mantraName,
    mantras: ['pastagang'],
  },
  {
    condition: () => getWeather().invertedColors,
    mantras: ['ʎluo ǝpoɔ pɐq'],
  },
  {
    condition: () => getWeather().noNudel,
    mantras: [
      'these will never show up in nudel',
      "so if you're reading this, chances are you want to edit the mantras",
      "which means you're editing not just in nudel, but also nudel itself!",
      'thank you!',
      'go ahead and edit the mantras now!',
    ],
  },
  {
    condition: () => getWeather().kaleidoscope,
    mantras: ['thou shalt not use kaleidescope'],
  },
];

export function getConditionalMantras() {
  let mantras = [];
  for (let i in CONDITIONAL_MANTRAS) {
    if (CONDITIONAL_MANTRAS[i].condition()) {
      mantras = mantras.concat(CONDITIONAL_MANTRAS[i].mantras);
    }
  }
  return mantras;
}
