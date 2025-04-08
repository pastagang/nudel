import { getWeather } from './weather.js';

export const MANTRAS = [
  //'no stars',
  //'we love repetition',
  'there is only one mantra',
  //'BAD CODE ONLY',
  // 'energy YES. quality NO.',
  // 'be brave',
  // 'normalise sharing scrappy fiddles',
  //'embrace death',
  // 'let code die',
  // 'let go of what you know',
  // 'move',
  //'make space',
  // 'you must delete',
  // 'delete a mantra',
  // 'add a conditional mantra',
  // 'embrace spaghetti code',
  // 'all day every day',
  // "we'll never release, but we already have",
  //  'test in the room',
  // 'question mantras',
  //'you are not dead yet',
  // 'connect',
  // 'mantras are code',
];

const CONDITIONAL_MANTRAS = [
  {
    condition: () => !getWeather().clearSkies,
    mantras: ['maybe you like the weather', 'BAD WEATHER ONLY'],
  },
  {
    condition: () => getWeather().mantraName,
    mantras: ['pastagang'],
  },
  {
    condition: () => getWeather().grayScale,
    mantras: [],
  },
  {
    condition: () => getWeather().invertedColors,
    mantras: ['colors * -1, energy * 10', 'ʎluo ǝpoɔ pɐq'],
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
    mantras: ['thou shalt use kaleidescope'],
  },
  {
    condition: () => getWeather().pixelated,
    mantras: ['pixels are an amazing way to make art'],
  },
  {
    condition: () => getWeather().palindromeNames,
    mantras: [],
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
