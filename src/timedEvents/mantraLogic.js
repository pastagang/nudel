import { MANTRAS, getConditionalMantras } from './mantras.js';
import { getCoarseTime, getStartTime } from './time.js';
import { scrambleInt } from './scramble.js';
import { getSession, getFormattedUserName } from '../session.js';
import { getWeatherModifiesNames } from './climate.js';

const MANTRA_INTERVAL = 1000 * 60; // mantra change rate in miliseconds
let CURRENT_MANTRA = '';

export function getCurrentMantra() {
  return CURRENT_MANTRA;
}

async function refreshMantra() {
  const conditionalMantras = getConditionalMantras();
  const time = getCoarseTime(MANTRA_INTERVAL);
  // conditional mantras are Nx as likely to be picked (when they can be)
  let randomIndex = (await scrambleInt(time, 'mantra')) % (MANTRAS.length + conditionalMantras.length * 1);
  if (randomIndex < MANTRAS.length) {
    var mantra = MANTRAS[randomIndex];
  } else {
    randomIndex = (randomIndex - MANTRAS.length) % conditionalMantras.length;
    var mantra = conditionalMantras[randomIndex];
  }
  CURRENT_MANTRA = mantra;
  const nextMantraTime = getStartTime(time + 1, MANTRA_INTERVAL);
  return [mantra, nextMantraTime];
}

function applyMantra(mantra) {
  const mantraElement = document.getElementById('mantra');
  if (mantraElement) {
    mantraElement.innerHTML = mantra;
  } else {
    console.error("Couldn't find mantra element");
  }

  if (getWeather().mantraName) {
    getSession().user = getFormattedUserName();
  }
}

export async function updateMantra() {
  const [newMantra, nextMantraTime] = await refreshMantra();
  applyMantra(newMantra);
  return nextMantraTime;
}
