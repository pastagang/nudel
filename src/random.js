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

export const EMOTICONS = [
  ':-)',
  ":')",
  ':3',
  'xD',
  ':-O',
  ';)',
  ':-]',
  ':^)',
  ':))',
  ':-D',
  '>_<',
  'UwU',
  '( ͡° ͜ʖ ͡°)',
  '<:‑|',
  '(-_-;)',
  'ಠ__ಠ',
  '(=ʘᆽʘ=)∫	',
  'ʕ •ᴥ•ʔ',
  'OwO',
  '(ΘεΘ;)',
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
