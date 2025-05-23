import { nudelAlert } from './alert.js';
import { nudelPrompt } from './prompt.js';
import { changeSettings, getSettings } from './settings.js';
import { getNudelHour } from './timedEvents/time.js';
import { getWeather, CLIMATE } from '../climate.js';
import { getSession } from './session.js';

const menuButton = document.querySelector('#menu-button');
const menuContainer = document.querySelector('#menu-container');

const aboutButton = document.querySelector('#about-button');
const weatherButton = document.querySelector('#weather-button');
const helpButton = document.querySelector('#help-button');
const aboutDialog = document.querySelector('#about-dialog');
const weatherDialog = document.querySelector('#weather-dialog');
const playButton = document.querySelector('#about-yes-button');
const docsButton = document.querySelector('#docs-button');

const root = document.documentElement;

menuButton?.addEventListener('click', (e) => {
  menuContainer?.classList.toggle('open');
});

helpButton?.addEventListener('click', () => {
  nudelAlert('Coming soon');
});

let playButtonClicked = false;
playButton?.addEventListener('click', () => {
  if (playButton?.classList.contains('loading')) {
    playButtonClicked = true;
    return;
  }
  const runButtons = document.querySelectorAll('.run');
  runButtons.forEach((runButton) => runButton.click());
});

aboutButton?.addEventListener('click', () => {
  aboutDialog?.showModal();
  playButton?.focus();
});

weatherButton?.addEventListener('click', () => {
  const weatherHour = document.querySelector('#weather-hour');
  if (!weatherHour) return;
  weatherHour.innerText = '' + (getNudelHour() % 25);
  const list = document.querySelector('#weather-list');
  if (!list) return;
  list.innerHTML = '';
  const weather = getWeather();
  Object.entries(CLIMATE)
    .filter(([key]) => weather[key])
    .forEach(([_, it]) => {
      list.insertAdjacentHTML('beforeend', `<li>${it.name}</li>`);
    });
  weatherDialog?.showModal();
});

docsButton?.addEventListener('click', () => {
  if (root?.classList.contains('sidebarOpen')) {
    root?.classList.remove('sidebarOpen');
  } else {
    root?.classList.add('sidebarOpen');
  }
});

// add / remove panes
document.getElementById('add-pane-button')?.addEventListener('click', () => {
  const session = getSession();
  if (!session) return;
  const documents = session.getDocuments();
  if (documents.length >= 8) {
    console.error('cannot add more than 8 panes');
    return;
  }
  const nextID = [1, 2, 3, 4, 5, 6, 7, 8].find((number) => !documents.find((doc) => Number(doc.id) === number));
  const newDocs = [
    ...documents.map((doc) => ({ id: doc.id, target: doc.target })),
    { id: nextID + '', target: 'strudel' },
  ];
  session.setActiveDocuments(newDocs);
});
document.getElementById('remove-pane-button')?.addEventListener('click', () => {
  const session = getSession();
  if (!session) return;
  const documents = session.getDocuments();
  session.setActiveDocuments([...documents.map((doc) => ({ id: doc.id, target: doc.target })).slice(0, -1)]);
});

const html = document.documentElement;

html.addEventListener('click', (e) => {
  if (e.target === html) {
    aboutDialog?.close();
  }
});

(async () => {
  if (!getSettings().username) {
    const username = await nudelPrompt('hello! what name do you want to go by?');
    changeSettings({ username });
    aboutDialog?.showModal();
    playButton?.focus();
  } else {
    if (getSettings().welcomeMessage3) {
      aboutDialog?.showModal();
      playButton?.focus();
    }
  }
})();

// This is to stop people running their old local code
// TODO: make this actually happen after the editors have been updated with the most recent content
setTimeout(() => {
  playButton?.classList.remove('loading');
  if (playButtonClicked) {
    setTimeout(() => {
      playButton?.click();
    }, 1000);
  }
}, 1000);
