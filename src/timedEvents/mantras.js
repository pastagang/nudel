import { getWeather } from './climate.js';

export const MANTRAS = [
  'make another flok client',
  /*
Here are five ways of making a flok client: 
1. Fork flok.
   https://github.com/munshkr/flok

2. Fork nudel.
   https://github.com/pastagang/nudel

3. Fork dotcool.
   https://github.com/pastagang/dotcool

4. Copy the vanilla example. 
   https://github.com/munshkr/flok/tree/main/packages/example-vanilla-js

5. Start completely from scratch
   https://github.com/pastagang/??????

   If you need admin access to anything, please contact pastagang.
  */
];

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
  {
    condition: () => getWeather().palindromeNames,
    mantras: ['use kaleidoscope to make palindrome visuals'],
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
