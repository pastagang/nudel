import { MANTRAS , getContitionalMantras} from './mantra.js';

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

// todo: make this show everyone the same mantra
// see: github.com/pastagang/dotcool
export function getCurrentMantra() {
  const conditionalMantras = getConditionalMantras()
  let randomIndex = Math.floor((Date.now() / 1000 / 60 / 60) % (MANTRAS.length + conditionalMantras.length*2));
  if (randomIndex < MANTRAS.length) {
    return MANTRAS[randomIndex];
  } else {
    randomIndex = (randomIndex - MANTRAS.length) % conditionalMantras.length;
    return condititnalMantras[randomIndex];
  }
}
