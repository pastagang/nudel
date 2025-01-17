import { nudelAlert } from './alert.js';
import { pastamirror } from './main.js';
import { nudelPrompt } from './prompt.js';
import { changeSettings, getSettings } from './settings.js';

const menuButton = document.querySelector('#menu-button');
const menuContainer = document.querySelector('#menu-container');

const aboutButton = document.querySelector('#about-button');
const helpButton = document.querySelector('#help-button');
const aboutDialog = document.querySelector('#about-dialog');
const playButton = document.querySelector('#about-yes-button');

menuButton.addEventListener('click', (e) => {
  menuContainer.classList.toggle('open');
});

helpButton?.addEventListener('click', () => {
  nudelAlert('Coming soon');
});

playButton.addEventListener('click', () => {
  const runButtons = document.querySelectorAll('.run');
  runButtons.forEach((runButton) => runButton.click());
});

aboutButton?.addEventListener('click', () => {
  aboutDialog.showModal();
  playButton.focus();
});

const html = document.documentElement;

html.addEventListener('click', (e) => {
  if (e.target === html) {
    aboutDialog.close();
  }
});

(async () => {
  if (!getSettings().username) {
    const username = await nudelPrompt('hello! what name do you want to go by?');
    changeSettings({ username });
    aboutDialog.showModal();
    playButton.focus();
  } else {
    if (getSettings().welcomeMessage3) {
      aboutDialog.showModal();
      playButton.focus();
    }
  }
})();
