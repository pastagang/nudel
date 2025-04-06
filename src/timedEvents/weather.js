import { getNudelDay } from './time.js';

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

export function getWeather(now = Date.now()) {
  const params = new URLSearchParams(window.location.search);
  const isSong = params.has('song');
  const weather = {};
  for (const [key, rule] of Object.entries(WEATHER_RULES)) {
    weather[key] = rule.when(now) && !isSong;
  }
  return weather;
}

window.getWeather = getWeather;
