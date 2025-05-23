import { getMilliSecondsSinceNudelDayStart } from './timedEvents/time.js';

let syncOrigin;
export function initSync() {
  syncOrigin = getMilliSecondsSinceNudelDayStart() / 1000;
  globalThis.syncOrigin = syncOrigin;
}
globalThis.initSync = initSync;

export function getSyncOffset() {
  return syncOrigin;
}
globalThis.getSyncOrigin = getSyncOffset;
globalThis.getSyncOffset = getSyncOffset;
