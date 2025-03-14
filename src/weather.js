const NUDEL_HOUR = 60 * 60 * 1000;
const NUDEL_DAY = 25 * NUDEL_HOUR;
const NUDEL_WEEK = NUDEL_DAY * 7;

export function getNudelDay() {
  const nudelDay = Math.floor(Date.now() / NUDEL_DAY);
  return nudelDay;
}

const weatherRules = {
  mantraName: () => getNudelDay() % 7 === 0,
};

export function getWeather() {
  const weather = {};
  for (const [key, rule] of Object.entries(weatherRules)) {
    weather[key] = rule();
  }
  return weather;
}
