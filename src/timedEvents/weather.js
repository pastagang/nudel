import { getWeather, CLIMATE } from '../../climate.js';
import { getUserName, getSession } from '../session.js';
import { nudelAlert } from '../alert.js';
import { repeatRepeatRepeatRepeat } from './update.js';
//bad code only

function applyWeather(weather) {
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

  if (weather.foggy) {
    document.querySelector('#foggy')?.classList.add('active');
    document.addEventListener('mousemove', (e) => {
      const fog = document.querySelector('#foggy');
      fog?.style.setProperty('--x', `${e.clientX}px`);
      fog?.style.setProperty('--y', `${e.clientY}px`);
    });
  }

  // === No nudel =====================================//
  if (weather.noNudel) {
    nudelAlert('nudel is not available today ⛈️');
  }
}

let appliedWeatherHash = '';
function updateWeather() {
  const weather = getWeather(Date.now());
  const weatherHash = JSON.stringify(weather);
  if (appliedWeatherHash === weatherHash) return;
  appliedWeatherHash = weatherHash;

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

  applyWeather(weather);
}

repeatRepeatRepeatRepeat(updateWeather);
