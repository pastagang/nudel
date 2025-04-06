export const WEATHER_RULES = {
  clearSkies: {
    name: 'clear skies',
    when: (now) => {
      // Check all OTHER weather rules
      // Only apply if not any other weather rule is active
      for (const rule of Object.values(WEATHER_RULES)) {
        if (rule !== WEATHER_RULES.clearSkies && rule.when(now)) {
          return false;
        }
      }
      return true;
    },
  },
  mantraName: {
    name: 'everyone is mantra',
    when: (now) => getNudelDay(now) % 7 === 0,
  },
  grayScale: {
    name: 'greyscale',
    when: (now) => getNudelDay(now) % 13 === 12,
  },
  invertedColors: {
    name: 'inverted colors',
    when: (now) => getNudelDay(now) % 15 === 5,
  },
  noNudel: {
    name: 'no nudel',
    when: (now) => getNudelDay(now) % 37 === 9,
  },
  noSamples: {
    name: 'no samples',
    when: (now) => getNudelDay(now) % 11 === 8,
  },
  kaleidoscope: {
    name: 'kaleidoscope',
    when: (now) => getNudelDay(now) % 12 === 1,
  },
  pixelated: {
    name: 'pixel land',
    when: (now) => getNudelDay(now) % 19 === 3,
  },
  palindromeNames: {
    name: 'palindrome names',
    when: (now) => getNudelDay(now) % 9 === 0,
  },
};

//===========//
// INTERNALS //
//===========//
// You don't need to change these if you're just adding a new weather rule
// but you can if you want. I'm a comment, not a cop.

export const NUDEL_HOUR_IN_A_NUDEL_DAY = 25;

const NUDEL_MILLISECOND = 1;
const NUDEL_SECOND = 1000 * NUDEL_MILLISECOND;
const NUDEL_MINUTE = 60 * NUDEL_SECOND;
const NUDEL_HOUR = 60 * NUDEL_MINUTE;
const NUDEL_DAY = NUDEL_HOUR_IN_A_NUDEL_DAY * NUDEL_HOUR;
const NUDEL_WEEK = 7 * NUDEL_DAY;
export function getNudelDay(now = Date.now()) {
  const nudelDay = Math.floor(now / NUDEL_DAY);
  return nudelDay;
}

export function getNudelWeek(now = Date.now()) {
  const nudelWeek = Math.floor(now / NUDEL_WEEK);
  return nudelWeek;
}

export function getNudelHour(now = Date.now()) {
  const nudelHour = Math.floor(now / NUDEL_HOUR);
  return nudelHour;
}

globalThis.getNudelHour = getNudelHour;

export function getWeather(now = Date.now()) {
  const params = new URLSearchParams(window.location.search);
  const isSong = params.has('song');
  const weather = {};
  for (const [key, rule] of Object.entries(WEATHER_RULES)) {
    weather[key] = rule.when(now) && !isSong;
  }
  return weather;
}

export function getMilliSecondsSinceNudelDayStart() {
  return Date.now() % NUDEL_DAY;
}

globalThis.getMilliSecondsSinceNudelDayStart = getMilliSecondsSinceNudelDayStart;
