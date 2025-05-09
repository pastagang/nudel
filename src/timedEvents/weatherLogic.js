import { getWeather, CLIMATE } from './climate.js';
import { getUserName, getSession } from '../session.js';
import { nudelAlert } from '../alert.js';
import { repeatRepeatRepeatRepeat } from './update.js';
//bad code only

export function applyWeatherRules(weather) {
  //=== Name weathers ===================================//
  const session = getSession();
  session.user = getUserName();

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
    nudelAlert('nudel is not available today ⛈️');
  }
}

let appliedWeatherHash = '';
function applyWeather(weather) {
  const weatherHash = JSON.stringify(weather);
  if (appliedWeatherHash === weatherHash) return;
  appliedWeatherHash = weatherHash;
  console.log('APPLYING WEATHER', weather);

  const enabledWeatherNames = Object.entries(weather)
    .filter(([_, enabled]) => enabled)
    .map(([name, _]) => CLIMATE[name].name);

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

function updateWeather() {
  const weather = getWeather(Date.now());
  console.log('WEATHER', weather);
  applyWeather(weather);
}

repeatRepeatRepeatRepeat(updateWeather);
