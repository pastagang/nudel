import { getCurrentMantra } from './random.js';
import { getSession } from './session.js';
import { getSettings } from './settings.js';

const WEATHER_RULES = {
  mantraName: () => getNudelDay() % 7 === 0,
};

let appliedWeatherHash = '';
export function applyWeather() {
  const weather = getWeather();
  const weatherHash = JSON.stringify(weather);
  if (appliedWeatherHash === weatherHash) return;
  appliedWeatherHash = weatherHash;
  console.log('APPLYING WEATHER', weather);

  //=== Mantra name ===================================//
  const session = getSession();
  if (weather.mantraName) {
    session.user = getCurrentMantra();
  } else {
    session.user = getSettings().username.trim() || 'anonymous nudelfan';
  }
}

//===========//
// INTERNALS //
//===========//
// You don't need to change these if you're just adding a new weather rule
// but you can if you want. I'm a comment, not a cop.

const NUDEL_HOUR = 60 * 60 * 1000;
const NUDEL_DAY = 25 * NUDEL_HOUR;
const NUDEL_WEEK = NUDEL_DAY * 7;
export function getNudelDay() {
  const nudelDay = Math.floor(Date.now() / NUDEL_DAY);
  return nudelDay;
}

export function getNudelWeek() {
  const nudelWeek = Math.floor(Date.now() / NUDEL_WEEK);
  return nudelWeek;
}

export function getNudelHour() {
  const nudelHour = Math.floor(Date.now() / NUDEL_HOUR);
  return nudelHour;
}

export function getWeather() {
  const weather = {};
  for (const [key, rule] of Object.entries(WEATHER_RULES)) {
    weather[key] = rule();
  }
  return weather;
}
