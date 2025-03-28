import { getSecondsSinceNudelDayStart } from './weather.js';

let secondsSinceNudelDayStartCache = null;

let syncOrigin;

export function initSync(ctxTime) {
  syncOrigin = getSecondsSinceNudelDayStart() / 1000 + ctxTime;
  globalThis.syncOrigin = syncOrigin;
  console.log('syncOrigin', syncOrigin);
}
globalThis.initSync = initSync;

export function getSyncOrigin() {
  return syncOrigin;
}
globalThis.getSyncOrigin = getSyncOrigin;

export function getSyncOffset() {
  if (secondsSinceNudelDayStartCache === null) {
    secondsSinceNudelDayStartCache = getSecondsSinceNudelDayStart();
    console.log('SYNC OFFSET:', secondsSinceNudelDayStartCache);
  }
  return secondsSinceNudelDayStartCache;
}
