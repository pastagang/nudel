import { MANTRAS, getConditionalMantras } from '../../mantras.js';
import { repeatRepeatRepeatRepeat } from './update.js';

// bad code only
export function getCurrentMantra() {
  const allPossibleMantras = [...MANTRAS, ...getConditionalMantras()];
  let nonRandomIndex = getNudelHour() % allPossibleMantras.length;
  return allPossibleMantras[nonRandomIndex];
}

let currentlyAppliedMantra = null;
function applyMantra(mantra) {
  if (mantra === currentlyAppliedMantra) {
    return;
  }
  const mantraElement = document.getElementById('mantra');
  if (!mantraElement) {
    throw new Error("Couldn't find mantra element");
  }
  mantraElement.textContent = mantra;
  currentlyAppliedMantra = mantra;
}

export function updateMantra() {
  const mantra = getCurrentMantra();
  applyMantra(mantra);
}

repeatRepeatRepeatRepeat(updateMantra);
