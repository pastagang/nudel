function spag(name) {
  return `https://spag.cc/${name}`;
}

function listToArray(stringList) {
  if (Array.isArray(stringList)) {
    return stringList.map(listToArray).flat();
  }
  return stringList
    .replaceAll(' ', ',')
    .split(',')
    .map((v) => v.trim())
    .filter((v) => v);
}

function spagda(nameList) {
  const names = listToArray(nameList);
  if (names.length === 0) {
    return;
  }
  const map = {};
  for (const name of names) {
    map[name] = spag(name);
  }
  samples(map);
}

function speechda(
  wordList = '',
  // default to PC music
  locale = 'en-GB',
  gender = 'f',
) {
  if (wordList.includes(':')) {
    const [localeArg, wordsArg] = wordList.split(':');
    if (localeArg.includes('-')) {
      locale = localeArg;
    } else {
      gender = localeArg;
    }
    wordList = wordsArg;
  }

  if (locale.includes('/')) {
    const [localeArg, genderArg] = locale.split('/');
    locale = localeArg;
    gender = genderArg;
  }

  const words = listToArray(wordList);
  if (words.length === 0) {
    return;
  }
  samples(`shabda/speech/${locale}/${gender}:${words.join(',')}`);
}

window.speechda = speechda;
window.spagda = spagda;
window.spag = spag;
