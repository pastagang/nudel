import { getNudelDay } from './time.js';

// Climate is what determines the weather you get
// any change to it should be called "manmade climate change" (unless you're not human)
export const CLIMATE = {
  clearSkies: {
    name: 'clear skies',
    when: (now) => {
      // Check all OTHER weather rules
      // Only apply if not any other weather rule is active
      for (const rule of Object.values(CLIMATE)) {
        if (rule !== CLIMATE.clearSkies && rule.when(now)) {
          return false;
        }
      }
      return true;
    },
  },
  londonAlgorave: {
    name: 'london algorave',
    when: () => false,
  },
  mantraName: {
    name: 'everyone is mantra',
    when: (now) => getNudelDay(now) % 7 === 0,
  },
  grayScale: {
    name: 'greyscale',
    when: (now) => getNudelDay(now) % 13 === 12,
  },
  invertedColors: {
    name: 'inverted colors',
    when: (now) => getNudelDay(now) % 15 === 5,
  },
  noNudel: {
    name: 'no nudel',
    when: (now) => getNudelDay(now) % 37 === 9,
  },
  noSamples: {
    name: 'no samples',
    when: (now) => getNudelDay(now) % 11 === 8,
  },
  kaleidoscope: {
    name: 'kaleidoscope',
    when: (now) => getNudelDay(now) % 12 === 1,
  },
  pixelated: {
    name: 'pixel land',
    when: (now) => getNudelDay(now) % 19 === 3,
  },
  palindromeNames: {
    name: 'palindrome names',
    when: (now) => getNudelDay(now) % 9 === 0,
  },
  emoticons: {
    name: 'everyone is emoticons',
    when: (now) => getNudelDay(now) % 22 === 0 && getNudelDay(now) % 7 !== 0,
  },
};

export function getWeather(now = Date.now()) {
  // get the weather based on climate
  const params = new URLSearchParams(window.location.search);
  const isSong = params.has('song');
  const weather = {};
  for (const [key, rule] of Object.entries(CLIMATE)) {
    weather[key] = rule.when(now) && !isSong;
  }
  return weather;
}

export function getWeatherModifiesNames()
{
  let weather = getWeather();
  if(weather.emoticons)
    return true;

  //this is applied during mantra applyMantra which is highly non-standard!
  if(weather.mantraName)
    return true;
  return false;
}

window.getWeather = getWeather;
