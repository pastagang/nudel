import { getNudelDay } from './src/timedEvents/time.js';

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
  icl: {
    name: 'iclc',
    when: () => true,
  },
  mantraName: {
    name: 'everyone is mantra',
    when: (now) => getNudelDay(now) % 14 === 0,
  },
  grayScale: {
    name: 'greyscale',
    when: (now) => getNudelDay(now) % 13 === 12,
  },
  invertedColors: {
    name: 'inverted colors',
    when: (now) => getNudelDay(now) % 15 === 6,
  },
  noNudel: {
    name: 'no nudel',
    when: (now) => getNudelDay(now) % 37 === 9,
  },
  noImages: {
    name: 'no images',
    when: (now) => getNudelDay(now) % 15 === 5,
  },
  // kaleidoscope: {
  //   name: 'kaleidoscope',
  //   when: (now) => getNudelDay(now) % 12 === 1,
  // },
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
    when: (now) => getNudelDay(now) % 14 === 7,
  },
  donnertag: {
    name: 'Tunderstorm',
    when: (now) => getNudelDay(now) % 37 == 5,
  }
  // msn: {
  //   name: 'msn',
  //   when: (now) => getNudelDay(now) % 19 === 10,
  // },
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

window.getWeather = getWeather;
