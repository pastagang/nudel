import { getWeather } from './climate.js';

export const MANTRAS = ['do it', 'anything can happen'];

export const OLD_MANTRAS = [
  'mantras repeat',
  'we love repetition',
  'thanks yaxu',
  'normalise sharing scrappy fiddles',
  'let code die',
  'you must delete',
  'make space',
  'there is only one room',
  'BAD CODE ONLY',
  'energy YES. quality NO.',
  'everyone sees the same mantra',
];

export const CONDITIONAL_MANTRAS = [
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
    mantras: ['thou shalt not slander the kaleidescope'],
  },
];
