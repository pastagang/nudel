import { getWeather, CLIMATE } from './climate.js';
import { getUserName, getSession } from '../session.js';
import { getNudelDay, getNudelDayStart } from './time.js';
import { nudelAlert } from '../alert.js';

// This is in an extra file, so climate.js doesn't load the session,
// so it can  be used in other places
let appliedWeatherHash = '';

// TODO: change the param to `changedWeather` which is an object whose keys are all changed weathers.
// it lets us do changes more minimally - similar to how settings work.
// in fact........... oh damn we could probably let this code die and move weather to settings, then [just] auto set/unset them
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

export function applyWeather(weather) {
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

export function updateWeather() {
  const now = Date.now();
  const weather = getWeather(now);
  // so we can access it from other places without having ciruclar dependencies
  // we cant do this cos the weather could change
  // window.weather = weather;
  applyWeather(weather);
  const nextDay = getNudelDayStart(getNudelDay(now) + 1);
  return nextDay;
}
