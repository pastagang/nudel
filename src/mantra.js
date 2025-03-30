import { getWeather } from './weather.js';

export const MANTRAS = [
  'no stars',
  'everyone sees the same mantra',
  'mantras repeat',
  'we love repetition',
  'this is a public flok room',
  'there is only one room',
  'press ctrl + enter to run code',
  'BAD CODE ONLY',
  'energy YES. quality NO.',
  'be brave',
  'recording and sharing is encouraged',
  'normalise sharing scrappy fiddles',
  'embrace death',
  'let code die',
  'just let go of what you know',
  'move',
  'make space',
  'you must delete',
  'delete a mantra',
  'add a mantra',
  'embrace spaghetti code',
  'all day every day',
  'we\'ll never release, but we already have',
  'there is only live, no testing',
  'i was told to add a mantra and i did',
  'question mantras',
  'you are not dead yet',
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
  let mantras = [];
  for (let i in CONDITIONAL_MANTRAS) {
    if (CONDITIONAL_MANTRAS[i].condition()) {
      mantras = mantras.concat(CONDITIONAL_MANTRAS[i].mantras);
    }
  }
  return mantras;
}
