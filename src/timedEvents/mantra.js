import { MANTRAS, getConditionalMantras } from './mantras.js';
import { getCoarseTime, getStartTime } from './time.js';
import { scrambleInt } from './scramble.js';
import { getSession, getUserName } from '../session.js';
import { getWeather } from './climate.js';

const MANTRA_INTERVAL = 1000 * 60 * 60;
let CURRENT_MANTRA = '';

export function getCurrentMantra() {
  return CURRENT_MANTRA;
}

export function getAllPossibleMantras() {
  const conditionalMantras = getConditionalMantras();
  return [...MANTRAS, ...conditionalMantras];
}

async function refreshMantra() {
  const conditionalMantras = getConditionalMantras();
  const time = getCoarseTime(MANTRA_INTERVAL);
  // conditional mantras are Nx as likely to be picked (when they can be)
  let randomIndex = (await scrambleInt(time, 'mantra')) % (MANTRAS.length + conditionalMantras.length * 1);
  let mantra = '';
  if (randomIndex < MANTRAS.length) {
    mantra = MANTRAS[randomIndex];
  } else {
    randomIndex = (randomIndex - MANTRAS.length) % conditionalMantras.length;
    mantra = conditionalMantras[randomIndex];
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
    getSession().user = getUserName();
  }
}

export async function updateMantra() {
  const [newMantra, nextMantraTime] = await refreshMantra();
  applyMantra(newMantra);
  return nextMantraTime;
}
