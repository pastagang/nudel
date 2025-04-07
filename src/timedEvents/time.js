// generic coarse time functions
// a period of coarse time starts at any multiple of the given interval
// examples:
// interval=30000, offset=0
// the period starts at 0th and 30th second of every minute
// interval=30000, offset=15000
// the period starts at 15th and 45th second of every minute

export function getCoarseTime(interval = 1000, offset = 0, time = Date.now()) {
  return Math.floor((time + offset) / interval);
}

export function getTimeSincePeriodStart(interval = 1000, offset = 0, time = Date.now()) {
  // time in miliseconds since given period of coarse time started
  return (time + offset) % interval;
}

export function getStartTime(coarseTime, interval = 1000, offset = 0) {
  // exact timestamp (in miliseconds) when a given period of coarse time starts
  return coarseTime * interval - offset;
}

// nudel hours, days, weeks

export const NUDEL_HOUR_IN_A_NUDEL_DAY = 25;

const NUDEL_MILLISECOND = 1;
const NUDEL_SECOND = 1000 * NUDEL_MILLISECOND;
const NUDEL_MINUTE = 60 * NUDEL_SECOND;
const NUDEL_HOUR = 60 * NUDEL_MINUTE;
const NUDEL_DAY = NUDEL_HOUR_IN_A_NUDEL_DAY * NUDEL_HOUR;
const NUDEL_WEEK = 7 * NUDEL_DAY;

export function getNudelHour(time = Date.now()) {
  return getCoarseTime(NUDEL_HOUR, 0, time);
}

globalThis.getNudelHour = getNudelHour;

export function getNudelDay(time = Date.now()) {
  return getCoarseTime(NUDEL_DAY, 0, time);
}

export function getNudelWeek(time = Date.now()) {
  return getCoarseTime(NUDEL_WEEK, 0, time);
}

export function getMilliSecondsSinceNudelDayStart(time = Date.now()) {
  return getTimeSincePeriodStart(NUDEL_DAY);
}

globalThis.getMilliSecondsSinceNudelDayStart = getMilliSecondsSinceNudelDayStart;

export function getNudelDayStart(coarseTime = getNudelDay()) {
  return getStartTime(coarseTime, NUDEL_DAY);
}
