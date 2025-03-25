import { getWeather, WEATHER_RULES } from './weather.js';
import { getSession } from './session.js';
import { getCurrentMantra } from './random.js';
import { getSettings } from './settings.js';

// This is in an extra file, so weather.js doesn't load the session,
// so it can  be used in other places
let appliedWeatherHash = '';

export function applyWeatherRules(weather) {
  //=== Mantra name ===================================//
  const session = getSession();
  if (weather.mantraName) {
    session.user = getCurrentMantra();
  } else {
    session.user = getSettings().username.trim() || 'anonymous nudelfan';
  }

  if (weather.palindromeNames) {
    session.user = session.user.split('').reverse().join('');
  } else {
    // reversing is just the same lol
    session.user = session.user.split('').reverse().join('');
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

export function applyWeather() {
  const weather = getWeather();
  // so we can access it from other places without having ciruclar dependencies
  // we cant do this cos the weather could change
  // window.weather = weather;

  // we can do this though:
  window.getWeather = getWeather;

  const weatherHash = JSON.stringify(weather);
  if (appliedWeatherHash === weatherHash) return;
  appliedWeatherHash = weatherHash;
  console.log('APPLYING WEATHER', weather);

  const enabledWeatherNames = Object.entries(weather)
    .filter(([_, enabled]) => enabled)
    .map(([name, _]) => WEATHER_RULES[name].name);

  const footerParagraph = document.querySelector('#global-footer p');
  if (footerParagraph) {
    if (enabledWeatherNames.length === 0) {
      footerParagraph.textContent = '';
    } else {
      footerParagraph.textContent = `Weather: ${enabledWeatherNames.join(', ')}`;
    }
  }

  applyWeatherRules(weather);
}
