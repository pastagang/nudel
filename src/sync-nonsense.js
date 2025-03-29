import { getMilliSecondsSinceNudelDayStart } from './weather.js';

let syncOrigin;
export function initSync(ctxTime) {
  syncOrigin = getMilliSecondsSinceNudelDayStart() / 1000; //- ctxTime;
  globalThis.syncOrigin = syncOrigin;
}
globalThis.initSync = initSync;

export function getSyncOffset() {
  return syncOrigin;
}
globalThis.getSyncOrigin = getSyncOffset;
globalThis.getSyncOffset = getSyncOffset;
