import { MANTRAS, getConditionalMantras } from './mantra.js';

const TAGS = [
  'penne',
  'spaghetti',
  'macaroni',
  'rigatoni',
  'farfalle',
  'linguine',
  'ravioli',
  'tortellini',
  'lasagne',
  'fettuccine',
  'gnocchi',
  'vermicelli',
  'rotini',
  'angel_hair',
  'bucatini',
  'cannelloni',
  'capellini',
  'conchiglie',
  'ditalini',
  'orzo',
  'pappardelle',
  'pastina',
  'radiatore',
  'stelle',
  'ziti',
  'pomodoro',
  'arrabbiata',
  'carbonara',
  'puttanesca',
  'bolognese',
  'amatriciana',
  'marinara',
  'primavera',
  'alfredo',
  'pesto',
  'vodka',
  'pescatore',
  'pollo',
];

export function getRandomName(tagCount = 2) {
  let name = '';
  for (let i = 0; i < tagCount; i++) {
    const randomIndex = Math.floor(Math.random() * TAGS.length);
    const randomTag = TAGS[randomIndex];
    name += randomTag;
    if (i < tagCount - 1) {
      name += '-';
    }
  }
  return name;
}

export function getCoarseTime(interval=1000, offset=0) {
  let t = Date.now();
  return Math.floor((t + offset) / interval);
}

export async function scrambleInt(input, domain='') {
  // DO NOT USE FOR SECURITY PURPOSES
  // turn a number into another number
  // change domain to change what number you get from a given number
  // returns a 32 bit unsigned integer
  const buffer = new TextEncoder().encode(input.toString().concat(';',domain));
  const hash = await crypto.subtle.digest("SHA-1", buffer);
  const result = new DataView(hash).getUint32(0,true);
  return result;
}

// todo: make this show everyone the same mantra
// see: github.com/pastagang/dotcool
export async function getCurrentMantra() {
  const conditionalMantras = getConditionalMantras();
  const interval = 1000 * 60; // mantra change rate in miliseconds
  const time = getCoarseTime(interval);
  // conditional mantras are 2x as likely to be picked (when they can be)
  let randomIndex = await scrambleInt(time, 'mantra') % (MANTRAS.length + conditionalMantras.length * 2);
  if (randomIndex < MANTRAS.length) {
    var mantra = MANTRAS[randomIndex];
  } else {
    randomIndex = (randomIndex - MANTRAS.length) % conditionalMantras.length;
    var mantra = conditionalMantras[randomIndex];
  }
  const nextMantraTime = (time + 1) * interval
  return [mantra, nextMantraTime];
}
