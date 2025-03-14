import { getCurrentMantra } from './random.js';
import { getSession } from './session.js';
import { getSettings } from './settings.js';

export const WEATHER_RULES = {
  mantraName: {
    name: 'everyone is mantra',
    when: () => getNudelDay() % 7 === 0,
  },
  grayScale: {
    name: 'no colors',
    when: () => getNudelDay() % 13 === 10,
  },
  invertedColors: {
    name: 'inverted colors',
    when: () => getNudelDay() % 13 === 3,
  },
  noNudel: {
    name: 'no nudel',
    when: () => getNudelDay() % 37 === 8,
  },
  noSamples: {
    name: 'no sample is fresh enough',
    when: () => getNudelDay() % 11 === 8,
  },
};

export function applyWeatherRules(weather) {
  //=== Mantra name ===================================//
  const session = getSession();
  if (weather.mantraName) {
    session.user = getCurrentMantra();
  } else {
    session.user = getSettings().username.trim() || 'anonymous nudelfan';
  }

  //=== Grayscale =====================================//
  if (weather.grayScale) {
    document.body.classList.add('grayscale');
  } else {
    document.body.classList.remove('grayscale');
  }

  // === Inverted colors ===============================//
  if (weather.invertedColors) {
    document.body.classList.add('inverted-colors');
  } else {
    document.body.classList.remove('inverted-colors');
  }

  // === No nudel =====================================//
  if (weather.noNudel) {
    document.body.innerHTML = '';
    document.body.insertAdjacentHTML(
      'beforeend',
      `
    <div class="dialog-container">
        <dialog open>
            <h1>nudel is not available today ⛈️</h1>
        </dialog>
      </div>
    `,
    );
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
    weather[key] = rule.when();
  }
  return weather;
}

let appliedWeatherHash = '';
export function applyWeather() {
  const weather = getWeather();
  // so we can access it from other places without having ciruclar dependencies
  window.weather = weather;
  const weatherHash = JSON.stringify(weather);
  if (appliedWeatherHash === weatherHash) return;
  appliedWeatherHash = weatherHash;
  console.log('APPLYING WEATHER', weather);

  const enabledWeatherNames = Object.entries(weather)
    .filter(([_, enabled]) => enabled)
    .map(([name, _]) => WEATHER_RULES[name].name);

  const footerParagraph = document.querySelector('footer p');
  if (footerParagraph) {
    if (enabledWeatherNames.length === 0) {
      footerParagraph.textContent = '';
    } else {
      footerParagraph.textContent = `Weather: ${enabledWeatherNames.join(', ')}`;
    }
  }

  applyWeatherRules(weather);
}
