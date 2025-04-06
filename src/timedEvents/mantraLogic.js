import { MANTRAS, getConditionalMantras } from './mantras.js';
import { getCoarseTime, getStartTime } from './time.js';
import { scrambleInt } from './scramble.js';

const MANTRA_INTERVAL = 1000 * 60; // mantra change rate in miliseconds

export async function getCurrentMantra() {
  const conditionalMantras = getConditionalMantras();
  const time = getCoarseTime(MANTRA_INTERVAL);
  // conditional mantras are 2x as likely to be picked (when they can be)
  let randomIndex = await scrambleInt(time, 'mantra') % (MANTRAS.length + conditionalMantras.length * 2);
  if (randomIndex < MANTRAS.length) {
    var mantra = MANTRAS[randomIndex];
  } else {
    randomIndex = (randomIndex - MANTRAS.length) % conditionalMantras.length;
    var mantra = conditionalMantras[randomIndex];
  }
  const nextMantraTime = getStartTime(time + 1, MANTRA_INTERVAL)
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
    getSession().user = mantra;
  }
}

export async function updateMantra() {
  const [newMantra, nextMantraTime] = await getCurrentMantra();
  applyMantra(newMantra);
  return nextMantraTime;
}
