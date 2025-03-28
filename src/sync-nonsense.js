import { getSecondsSinceNudelDayStart } from './weather.js';

let syncOrigin;
export function initSync(ctxTime) {
  syncOrigin = getSecondsSinceNudelDayStart() / 1000 - ctxTime;
  globalThis.syncOrigin = syncOrigin;
}
globalThis.initSync = initSync;

export function getSyncOffset() {
  return syncOrigin;
}
globalThis.getSyncOrigin = getSyncOffset;
globalThis.getSyncOffset = getSyncOffset;

/* export function getSyncOffset() {
  if (secondsSinceNudelDayStartCache === null) {
    secondsSinceNudelDayStartCache = getSecondsSinceNudelDayStart();
    console.log('SYNC OFFSET:', secondsSinceNudelDayStartCache);
  }
  return secondsSinceNudelDayStartCache;
} */
