function spag(name) {
  return `https://spag.cc/${name}`;
}

function spagda(name) {
  samples({
    [name]: spag(name),
  });
}

function speechda(
  wordsArg = '',
  // default to PC music
  locale = 'en-GB',
  gender = 'f',
) {
  const words = wordsArg
    .replaceAll(' ', ',')
    .split(',')
    .map((word) => word.trim())
    .filter((word) => word.length > 0);

  if (words.length === 0) {
    return;
  }
  samples(`shabda/speech/${locale}/${gender}:${words.join(',')}`);
}

window.speechda = speechda;
window.spagda = spagda;
window.spag = spag;
