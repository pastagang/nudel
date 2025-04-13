/* eslint-disable no-undef */


// If you edit this file, please also minify it
// and place the minified version in std-min.js

// For example, you can paste this file into https://minifier.org/
// and then copy the output into std-min.js

function spag(name) {
  return 'https://spag.cc/' + name;
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

async function spagda(nameList) {
  const names = listToArray(nameList);
  if (names.length === 0) {
    return;
  }
  const map = {};
  for (const name of names) {
    map[name] = spag(name);
  }
  window.samples(map);
}

async function speechda(
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
  window.samples('shabda/speech/' + locale + '/' + gender + ':' + words.join(','));
}

async function hubda(orgList, repoList = '') {
  const orgs = listToArray(orgList);

  const orgRepos = [];
  const orgChoices = [];
  for (const org of orgs) {
    if (org.includes('/')) {
      const [orgName, repoName] = org.split('/');
      orgRepos.push({ org: orgName, repo: repoName });
    } else {
      orgChoices.push(org);
    }
  }

  const repoChoices = listToArray(repoList);

  for (const orgChoice of orgChoices) {
    for (const repoChoice of repoChoices) {
      orgRepos.push({ org: orgChoice, repo: repoChoice });
    }
  }

  const addresses = orgRepos.map(({ org, repo }) => 'github:' + org + '/' + repo);
  for (const address of addresses) {
    window.samples(address);
  }
}

window.speechda = speechda;
window.spagda = spagda;
window.spag = spag;
window.hubda = hubda;
