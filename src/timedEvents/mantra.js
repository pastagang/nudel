import { MANTRAS } from '../../mantras.js';
import { CONDITIONAL_MANTRAS } from './mantras.js';
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

function getConditionalMantras() {
  let mantras = [];
  for (let i in CONDITIONAL_MANTRAS) {
    if (CONDITIONAL_MANTRAS[i].condition()) {
      mantras = mantras.concat(CONDITIONAL_MANTRAS[i].mantras);
    }
  }
  return mantras;
}

repeatRepeatRepeatRepeat(updateMantra);
