import { getWeather } from './weather.js';

export const MANTRAS = [
  'let code die',
  'energy YES. quality NO.',
  'everyone sees the same mantra',
  'mantras repeat',
  'we love repetition',
  'this is a public flok room',
  'there is only one room',
  'press ctrl + enter to run code',
  'BAD CODE ONLY',
  'recording and sharing is encouraged',
  'normalise sharing scrappy fiddles',
  'be brave',
  'embrace death',
  'just let go of what you know',
  'move',
  'make space',
  'you must delete',
  'embrace spaghetti code',
  'add a mantra',
  'all day every day',
  'we\'ll never release, but we already have',
  'there is only live, no testing',
  'i was told to add a mantra so i did',
  'you are not dead yet'
];


const CONDITIONAL_MANTRAS = [
  {
    condition: (() => !getWeather().clearSkies),
    mantras: [
      "maybe you like the weather"
    ]
  }
];

export function getConditionalMantras() {
  let mantras = []
  for (i in CONDITIONAL_MANTRAS) {
    if (CONDITIONAL_MANTRAS[i].condition()) {
      mantras = mantras.concat(list.mantras);
    }
  }
  return mantras;
}
