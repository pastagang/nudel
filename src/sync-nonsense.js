import { TimeSpan } from '@strudel/core';
import { getSecondsSinceNudelDayStart } from './weather.js';

let secondsSinceNudelDayStartCache = null;
export function getSyncOffset() {
  // For debugging
  return 100000;

  if (secondsSinceNudelDayStartCache === null) {
    secondsSinceNudelDayStartCache = getSecondsSinceNudelDayStart();
    console.log('SYNC OFFSET:', secondsSinceNudelDayStartCache);
  }
  return secondsSinceNudelDayStartCache;
}
