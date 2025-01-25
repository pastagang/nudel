function spag(name) {
  return `https://spag.cc/${name}`;
}

function spagda(name) {
  samples({
    [name]: spag(name),
  });
}

function speechda(
  words = '',
  // default to PC music
  locale = 'en-GB',
  gender = 'f',
) {
  if (words.includes(':')) {
    const [localeArg, wordsArg] = words.split(':');
    if (localeArg.includes('-')) {
      locale = localeArg;
    } else {
      gender = localeArg;
    }
    words = wordsArg;
  }

  if (locale.includes('/')) {
    const [localeArg, genderArg] = locale.split('/');
    locale = localeArg;
    gender = genderArg;
  }

  const wordsArray = words
    .replaceAll(' ', ',')
    .split(',')
    .map((word) => word.trim())
    .filter((word) => word.length > 0);

  if (words.length === 0) {
    return;
  }
  console.log(locale, gender, wordsArray);
  samples(`shabda/speech/${locale}/${gender}:${wordsArray.join(',')}`);
}

window.speechda = speechda;
window.spagda = spagda;
window.spag = spag;
