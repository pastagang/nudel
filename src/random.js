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
  'angel hair',
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

const MANTRAS = [
  "let code die",
  "you don't need it",
  "pastagang made it, not you"
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

export function getRandomMantra() {
  const randomIndex = Math.floor(Math.random() * MANTRAS.length);
  const randomMantra = MANTRAS[randomIndex];
  return randomMantra;
}
