import { updateWeather } from './weatherLogic.js';
import { updateMantra } from './mantraLogic.js';

async function runOnSchedule(fn) {
  // run the function based on the time it returns
  const nextTime = await fn();
  let interval = nextTime - Date.now();

  if (interval < 100) {
    interval = 100;
  }
  setTimeout((() => runOnSchedule(fn)), interval);
}

export function initializeTimedEvents() {
  runOnSchedule(updateWeather);
  runOnSchedule(updateMantra);
}
