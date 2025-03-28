import { TimeSpan } from '@strudel/core';
import { getSecondsSinceNudelDayStart } from './weather.js';

let secondsSinceNudelDayStartCache = null;
export function getSyncOffset() {
  // 10 for now for debugging
  // return 1;
  if (secondsSinceNudelDayStartCache === null) {
    secondsSinceNudelDayStartCache = getSecondsSinceNudelDayStart();
    console.log('SYNC OFFSET:', secondsSinceNudelDayStartCache);
  }
  return secondsSinceNudelDayStartCache;
}
